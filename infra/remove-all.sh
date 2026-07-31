#!/usr/bin/env bash

# SST remove often fails partway through VPC/RDS/NAT dependency chains.
# This script tries SST first, then deletes only resources that belong to
# this app+stage. It intentionally does not sweep the whole AWS account.
set -euo pipefail
export AWS_PAGER=""

export SST_APP_NAME="${SST_APP_NAME:-falcon-eye}"
export STAGE="${STAGE:-dev}"
STACK_NAME="$SST_APP_NAME"
FULL_STACK_NAME="${STACK_NAME}-${STAGE}"

echo "Starting full cleanup for SST stack: $FULL_STACK_NAME"

command -v aws >/dev/null || { echo "AWS CLI not installed."; exit 1; }
command -v pnpm >/dev/null || { echo "pnpm not installed."; exit 1; }

# aws --output text sometimes prints "None" for empty results
normalize_aws_list() {
  local value="${1:-}"
  if [ -z "$value" ] || [ "$value" = "None" ] || [ "$value" = "null" ]; then
    printf ''
  else
    printf '%s' "$value"
  fi
}

# Function to wait for RDS deletion
wait_for_rds_deletion() {
  local instance_id=$1
  local max_attempts=60  # Increased from 30 to 60 (30 minutes total)
  local attempt=1
  
  echo "Waiting for RDS instance $instance_id to be deleted..."
  while [ $attempt -le $max_attempts ]; do
    if aws rds describe-db-instances --db-instance-identifier "$instance_id" >/dev/null 2>&1; then
      echo "Attempt $attempt/$max_attempts: RDS instance still exists, waiting..."
      sleep 30
      attempt=$((attempt + 1))
    else
      echo "✅ RDS instance $instance_id has been deleted."
      return 0
    fi
  done
  
  echo "⚠️ RDS instance $instance_id deletion timed out after $max_attempts attempts (30 minutes)."
  return 1
}

# Try SST remove first
echo "📋 Step 1: SST remove"
if pnpm exec sst remove --stage "$STAGE"; then
  echo "✅ SST removed everything cleanly."
  exit 0
fi

echo "⚠️ SST remove failed. Proceeding with manual cleanup..."
echo "⚠️  Note: Manual cleanup may cause Pulumi state to become out of sync."
echo "⚠️  Run 'pnpm exec sst refresh --stage $STAGE' after cleanup if you encounter deployment issues."

# Keep going through dependency-ordered cleanup even if one delete fails.
set +e

# RDS
echo "📋 Step 2: RDS instances"
RDS_INSTANCES=$(normalize_aws_list "$(aws rds describe-db-instances \
  --query "DBInstances[?contains(DBInstanceIdentifier, '${STACK_NAME}-${STAGE}')].DBInstanceIdentifier" --output text 2>/dev/null || true)")
if [ -n "$RDS_INSTANCES" ]; then
  for instance in $RDS_INSTANCES; do
    echo "Deleting RDS: $instance"
    aws rds delete-db-instance --db-instance-identifier "$instance" --skip-final-snapshot --delete-automated-backups || true
  done
  
  # Wait for RDS instances to be deleted
  for instance in $RDS_INSTANCES; do
    wait_for_rds_deletion "$instance" || true
  done
else
  echo "No RDS instances found to delete."
fi

# RDS Subnet Groups
echo "📋 Step 3: RDS subnet groups"
RDS_SUBNETS=$(normalize_aws_list "$(aws rds describe-db-subnet-groups \
  --query "DBSubnetGroups[?contains(DBSubnetGroupName, '${STACK_NAME}-${STAGE}')].DBSubnetGroupName" --output text 2>/dev/null || true)")
if [ -n "$RDS_SUBNETS" ]; then
  for group in $RDS_SUBNETS; do
    echo "Deleting RDS subnet group: $group"
    aws rds delete-db-subnet-group --db-subnet-group-name "$group" || true
  done
else
  echo "No RDS subnet groups found to delete."
fi

# Lambda
echo "📋 Step 4: Lambda functions"
LAMBDA_FUNCS=$(normalize_aws_list "$(aws lambda list-functions \
  --query "Functions[?contains(FunctionName, '${STACK_NAME}-${STAGE}')].FunctionName" --output text 2>/dev/null || true)")
if [ -n "$LAMBDA_FUNCS" ]; then
  for func in $LAMBDA_FUNCS; do
    echo "Deleting Lambda function: $func"
    aws lambda delete-function --function-name "$func" || true
  done
else
  echo "No Lambda functions found to delete."
fi

# NAT Gateways
echo "📋 Step 5: NAT Gateways"
NAT_IDS=$(normalize_aws_list "$(aws ec2 describe-nat-gateways \
  --query "NatGateways[?State!='deleted' && contains(Tags[?Key=='sst:app'].Value, '${STACK_NAME}') && contains(Tags[?Key=='sst:stage'].Value, '${STAGE}')].NatGatewayId" \
  --output text 2>/dev/null || true)")
if [ -n "$NAT_IDS" ]; then
  for nat in $NAT_IDS; do
    echo "Deleting NAT Gateway: $nat"
    aws ec2 delete-nat-gateway --nat-gateway-id "$nat" || true
  done
  
  # Wait for NAT gateways to be deleted
  for nat in $NAT_IDS; do
    echo "Waiting for NAT Gateway $nat to be deleted..."
    aws ec2 wait nat-gateway-deleted --nat-gateway-ids "$nat" || true
  done
else
  echo "No NAT Gateways found to delete."
fi

# Elastic IPs (only those tagged for this SST app/stage)
echo "📋 Step 6: Elastic IPs"
EIP_IDS=$(normalize_aws_list "$(aws ec2 describe-addresses \
  --filters "Name=tag:sst:app,Values=${STACK_NAME}" "Name=tag:sst:stage,Values=${STAGE}" \
  --query "Addresses[].AllocationId" --output text 2>/dev/null || true)")
if [ -n "$EIP_IDS" ]; then
  for eip in $EIP_IDS; do
    echo "Releasing Elastic IP: $eip"
    aws ec2 release-address --allocation-id "$eip" || true
  done
else
  echo "No Elastic IPs found to release for this stage."
fi

# CloudFront
echo "📋 Step 7: CloudFront distributions"
DIST_IDS=$(normalize_aws_list "$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?contains(Comment, '${STACK_NAME}-${STAGE}')].Id" --output text 2>/dev/null || true)")
if [ -n "$DIST_IDS" ]; then
  for dist_id in $DIST_IDS; do
    echo "Processing CloudFront distribution: $dist_id"
    
    # Check if distribution still exists
    if aws cloudfront get-distribution-config --id "$dist_id" >/dev/null 2>&1; then
      etag=$(aws cloudfront get-distribution-config --id "$dist_id" --query ETag --output text)
      config=$(aws cloudfront get-distribution-config --id "$dist_id" \
        --query DistributionConfig --output json | jq '.Enabled = false')
      echo "$config" > tmp-config.json
      
      echo "Disabling distribution $dist_id..."
      aws cloudfront update-distribution --id "$dist_id" \
        --distribution-config file://tmp-config.json --if-match "$etag" || true
      
      echo "Waiting for disable propagation..."
      sleep 60
      
      echo "Deleting distribution $dist_id..."
      aws cloudfront delete-distribution --id "$dist_id" --if-match "$etag" || true
    else
      echo "Distribution $dist_id no longer exists, skipping..."
    fi
  done
  rm -f tmp-config.json
else
  echo "No CloudFront distributions found to delete."
fi

# S3 Buckets
echo "📋 Step 8: S3 buckets"
BUCKETS=$(normalize_aws_list "$(aws s3api list-buckets \
  --query "Buckets[?contains(Name, '${STACK_NAME}-${STAGE}')].Name" --output text 2>/dev/null || true)")
if [ -n "$BUCKETS" ]; then
  for bucket in $BUCKETS; do
    echo "Emptying and deleting bucket: $bucket"
    aws s3 rm "s3://$bucket" --recursive || true
    aws s3api delete-bucket --bucket "$bucket" || true
  done
else
  echo "No S3 buckets found to delete."
fi

# VPCs
echo "📋 Step 9: VPCs"
VPCS=$(normalize_aws_list "$(aws ec2 describe-vpcs \
  --filters "Name=tag:sst:app,Values=${STACK_NAME}" "Name=tag:sst:stage,Values=${STAGE}" --query "Vpcs[].VpcId" --output text 2>/dev/null || true)")
if [ -n "$VPCS" ]; then
  for vpc in $VPCS; do
    echo "Cleaning VPC: $vpc"

         # Subnets
     SUBNETS=$(normalize_aws_list "$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$vpc" --query "Subnets[].SubnetId" --output text 2>/dev/null || true)")
     for subnet in $SUBNETS; do 
       echo "Deleting subnet: $subnet"
       
       # Check if subnet has dependencies
       DEPENDENCIES=$(normalize_aws_list "$(aws ec2 describe-subnets --subnet-ids "$subnet" --query "Subnets[0].State" --output text 2>/dev/null || true)")
       if [ "$DEPENDENCIES" = "available" ]; then
         aws ec2 delete-subnet --subnet-id "$subnet" || true
       else
         echo "Subnet $subnet has dependencies, skipping for now..."
       fi
     done

         # Internet Gateways
     IGWS=$(normalize_aws_list "$(aws ec2 describe-internet-gateways \
       --filters Name=attachment.vpc-id,Values="$vpc" --query "InternetGateways[].InternetGatewayId" --output text 2>/dev/null || true)")
     for igw in $IGWS; do
       echo "Processing Internet Gateway: $igw"
       
       # Check if Internet Gateway still exists
       if aws ec2 describe-internet-gateways --internet-gateway-ids "$igw" >/dev/null 2>&1; then
         echo "Detaching Internet Gateway: $igw"
         aws ec2 detach-internet-gateway --internet-gateway-id "$igw" --vpc-id "$vpc" || true
         
         echo "Deleting Internet Gateway: $igw"
         aws ec2 delete-internet-gateway --internet-gateway-id "$igw" || true
       else
         echo "Internet Gateway $igw no longer exists, skipping..."
       fi
     done

         # Route Tables - Detach associations first
     RTBS=$(normalize_aws_list "$(aws ec2 describe-route-tables --filters Name=vpc-id,Values="$vpc" --query "RouteTables[].RouteTableId" --output text 2>/dev/null || true)")
     for rtb in $RTBS; do
       echo "Processing route table: $rtb"
       
       # Get associations and filter out null values
       ASSOCIATIONS=$(normalize_aws_list "$(aws ec2 describe-route-tables --route-table-ids "$rtb" --query "RouteTables[0].Associations[?AssociationId!=null].AssociationId" --output text 2>/dev/null || true)")
       if [ -n "$ASSOCIATIONS" ]; then
         for assoc in $ASSOCIATIONS; do
           echo "Disassociating route table association: $assoc"
           aws ec2 disassociate-route-table --association-id "$assoc" || true
         done
       else
         echo "No valid associations found for route table $rtb"
       fi
       
       echo "Deleting route table: $rtb"
       aws ec2 delete-route-table --route-table-id "$rtb" || true
     done

    # Security groups (not default)
    SGROUPS=$(normalize_aws_list "$(aws ec2 describe-security-groups --filters Name=vpc-id,Values="$vpc" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text 2>/dev/null || true)")
    for sg in $SGROUPS; do 
      echo "Deleting security group: $sg"
      aws ec2 delete-security-group --group-id "$sg" || true
    done

    # VPC endpoints
    ENDPOINTS=$(normalize_aws_list "$(aws ec2 describe-vpc-endpoints --filters Name=vpc-id,Values="$vpc" --query "VpcEndpoints[].VpcEndpointId" --output text 2>/dev/null || true)")
    for ep in $ENDPOINTS; do 
      echo "Deleting VPC endpoint: $ep"
      aws ec2 delete-vpc-endpoints --vpc-endpoint-ids "$ep" || true
    done

         # Finally delete the VPC
     echo "Deleting VPC: $vpc"
     aws ec2 delete-vpc --vpc-id "$vpc" || true
   done
 else
   echo "No VPCs found to delete."
 fi

# Final VPC cleanup - try to delete any remaining resources
echo "📋 Step 9.5: Final VPC cleanup"
VPCS=$(normalize_aws_list "$(aws ec2 describe-vpcs \
  --filters "Name=tag:sst:app,Values=${STACK_NAME}" "Name=tag:sst:stage,Values=${STAGE}" --query "Vpcs[].VpcId" --output text 2>/dev/null || true)")
if [ -n "$VPCS" ]; then
  for vpc in $VPCS; do
    echo "Final cleanup for VPC: $vpc"
    
    # Try to delete any remaining subnets
    REMAINING_SUBNETS=$(normalize_aws_list "$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$vpc" --query "Subnets[].SubnetId" --output text 2>/dev/null || true)")
    for subnet in $REMAINING_SUBNETS; do
      echo "Final attempt to delete subnet: $subnet"
      aws ec2 delete-subnet --subnet-id "$subnet" || true
    done
    
    # Try to delete any remaining route tables
    REMAINING_RTBS=$(normalize_aws_list "$(aws ec2 describe-route-tables --filters Name=vpc-id,Values="$vpc" --query "RouteTables[].RouteTableId" --output text 2>/dev/null || true)")
    for rtb in $REMAINING_RTBS; do
      echo "Final attempt to delete route table: $rtb"
      aws ec2 delete-route-table --route-table-id "$rtb" || true
    done
    
    # Final VPC deletion attempt
    echo "Final attempt to delete VPC: $vpc"
    aws ec2 delete-vpc --vpc-id "$vpc" || true
  done
fi

# CloudWatch Logs
echo "📋 Step 10: CloudWatch logs"
LOGS=$(normalize_aws_list "$(aws logs describe-log-groups --query "logGroups[?contains(logGroupName, '${STACK_NAME}-${STAGE}')].logGroupName" --output text 2>/dev/null || true)")
if [ -n "$LOGS" ]; then
  for log in $LOGS; do 
    echo "Deleting log group: $log"
    aws logs delete-log-group --log-group-name "$log" || true
  done
else
  echo "No CloudWatch log groups found to delete."
fi

# IAM Roles
echo "📋 Step 11: IAM roles"
ROLES=$(normalize_aws_list "$(aws iam list-roles --query "Roles[?contains(RoleName, '${STACK_NAME}-${STAGE}')].RoleName" --output text 2>/dev/null || true)")
if [ -n "$ROLES" ]; then
  for role in $ROLES; do
    echo "Processing IAM role: $role"
    POLICIES=$(normalize_aws_list "$(aws iam list-attached-role-policies --role-name "$role" --query 'AttachedPolicies[].PolicyArn' --output text 2>/dev/null || true)")
    for pol in $POLICIES; do 
      echo "Detaching policy $pol from role $role"
      aws iam detach-role-policy --role-name "$role" --policy-arn "$pol" || true
    done
    echo "Deleting IAM role: $role"
    aws iam delete-role --role-name "$role" || true
  done
else
  echo "No IAM roles found to delete."
fi

# Secrets Manager
echo "📋 Step 12: Deleting Secrets Manager secrets"
SECRETS=$(normalize_aws_list "$(aws secretsmanager list-secrets --query "SecretList[?contains(Name, '${STACK_NAME}-${STAGE}')].ARN" --output text 2>/dev/null || true)")
if [ -n "$SECRETS" ]; then
  for secret in $SECRETS; do
    echo "Deleting secret: $secret"
    aws secretsmanager delete-secret --secret-id "$secret" --force-delete-without-recovery || true
  done
else
  echo "No Secrets Manager secrets found to delete."
fi

# CloudFormation Stack
echo "📋 Step 13: CloudFormation"
if aws cloudformation describe-stacks --stack-name "$FULL_STACK_NAME" >/dev/null 2>&1; then
  echo "Deleting CloudFormation stack: $FULL_STACK_NAME"
  aws cloudformation delete-stack --stack-name "$FULL_STACK_NAME" || true
  aws cloudformation wait stack-delete-complete --stack-name "$FULL_STACK_NAME" || true
else
  echo "CloudFormation stack $FULL_STACK_NAME not found."
fi

# Final cleanup
echo "📋 Step 14: Final SST remove retry"
echo "Checking if SST resources still exist before attempting final remove..."

# Check if there are any remaining SST-managed resources
REMAINING_RESOURCES=$(normalize_aws_list "$(aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=sst:app,Values="$STACK_NAME" Key=sst:stage,Values="$STAGE" \
  --query "ResourceTagMappingList[].ResourceARN" --output text 2>/dev/null || true)")

if [ -n "$REMAINING_RESOURCES" ]; then
  echo "Found remaining SST resources, attempting final remove..."
  pnpm exec sst remove --stage "$STAGE" || true
else
  echo "No remaining SST resources found, skipping final remove."
fi

# Refresh SST state to sync with AWS reality
echo "📋 Step 15: Refreshing SST state"
echo "Syncing Pulumi state with actual AWS resources..."
pnpm exec sst refresh --stage "$STAGE" || true

# Final SST remove attempt after refresh
echo "📋 Step 16: Final SST remove after refresh"
echo "Attempting final SST remove with clean state..."
if pnpm exec sst remove --stage "$STAGE"; then
  echo "✅ Final SST remove completed successfully."
else
  echo "⚠️ Final SST remove failed, but resources should be cleaned up."
fi

echo "✅ All done. Manual cleanup complete."
