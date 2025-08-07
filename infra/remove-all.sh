#!/bin/bash

set -e
export AWS_PAGER=""

STACK_NAME="pj-falcon-eye-stack"
STAGE="${STAGE:-pirasanthanjesugeevegan}"
FULL_STACK_NAME="${STACK_NAME}-${STAGE}"

echo "🚀 Starting full cleanup for SST stack: $FULL_STACK_NAME"

command -v aws >/dev/null || { echo "❌ AWS CLI not installed."; exit 1; }
command -v sst >/dev/null || { echo "⚠️ SST not found. Installing..."; npm install -g sst; }

# Try SST remove first
echo "📋 Step 1: SST remove"
if sst remove --stage "$STAGE"; then
  echo "✅ SST removed everything cleanly."
  exit 0
fi

echo "⚠️ SST remove failed. Proceeding with manual cleanup..."

# RDS
echo "📋 Step 2: RDS instances"
RDS_INSTANCES=$(aws rds describe-db-instances \
  --query "DBInstances[?contains(DBInstanceIdentifier, '${STACK_NAME}-${STAGE}')].DBInstanceIdentifier" --output text)
for instance in $RDS_INSTANCES; do
  echo "Deleting RDS: $instance"
  aws rds delete-db-instance --db-instance-identifier "$instance" --skip-final-snapshot --delete-automated-backups || true
done
for instance in $RDS_INSTANCES; do
  echo "Waiting for RDS to delete: $instance"
  aws rds wait db-instance-deleted --db-instance-identifier "$instance" || true
done

# RDS Subnet Groups
echo "📋 Step 3: RDS subnet groups"
RDS_SUBNETS=$(aws rds describe-db-subnet-groups \
  --query "DBSubnetGroups[?contains(DBSubnetGroupName, '${STACK_NAME}-${STAGE}')].DBSubnetGroupName" --output text)
for group in $RDS_SUBNETS; do
  aws rds delete-db-subnet-group --db-subnet-group-name "$group" || true
done

# Lambda
echo "📋 Step 4: Lambda functions"
LAMBDA_FUNCS=$(aws lambda list-functions \
  --query "Functions[?contains(FunctionName, '${STACK_NAME}-${STAGE}')].FunctionName" --output text)
for func in $LAMBDA_FUNCS; do
  aws lambda delete-function --function-name "$func" || true
done

# NAT Gateways
echo "📋 Step 5: NAT Gateways"
NAT_IDS=$(aws ec2 describe-nat-gateways --query "NatGateways[?State!='deleted'].NatGatewayId" --output text)
for nat in $NAT_IDS; do
  aws ec2 delete-nat-gateway --nat-gateway-id "$nat" || true
done
for nat in $NAT_IDS; do
  aws ec2 wait nat-gateway-deleted --nat-gateway-ids "$nat" || true
done

# Elastic IPs
echo "📋 Step 6: Elastic IPs"
EIP_IDS=$(aws ec2 describe-addresses \
  --query "Addresses[?Domain=='vpc'].AllocationId" --output text)
for eip in $EIP_IDS; do
  aws ec2 release-address --allocation-id "$eip" || true
done

# CloudFront
echo "📋 Step 7: CloudFront distributions"
DIST_IDS=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?contains(Comment, '${STACK_NAME}-${STAGE}')].Id" --output text)
for dist_id in $DIST_IDS; do
  etag=$(aws cloudfront get-distribution-config --id "$dist_id" --query ETag --output text)
  config=$(aws cloudfront get-distribution-config --id "$dist_id" \
    --query DistributionConfig --output json | jq '.Enabled = false')
  echo "$config" > tmp-config.json
  aws cloudfront update-distribution --id "$dist_id" \
    --distribution-config file://tmp-config.json --if-match "$etag"
  echo "Waiting for disable propagation..."
  sleep 60
  aws cloudfront delete-distribution --id "$dist_id" --if-match "$etag"
done
rm -f tmp-config.json

# S3 Buckets
echo "📋 Step 8: S3 buckets"
BUCKETS=$(aws s3api list-buckets \
  --query "Buckets[?contains(Name, '${STACK_NAME}-${STAGE}')].Name" --output text)
for bucket in $BUCKETS; do
  echo "Emptying and deleting bucket: $bucket"
  aws s3 rm "s3://$bucket" --recursive || true
  aws s3api delete-bucket --bucket "$bucket" || true
done

# VPCs
echo "📋 Step 9: VPCs"
VPCS=$(aws ec2 describe-vpcs \
  --filters "Name=tag:Name,Values=*${STACK_NAME}*" --query "Vpcs[].VpcId" --output text)
for vpc in $VPCS; do
  echo "Cleaning VPC: $vpc"

  # Subnets
  SUBNETS=$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$vpc" --query "Subnets[].SubnetId" --output text)
  for subnet in $SUBNETS; do aws ec2 delete-subnet --subnet-id "$subnet" || true; done

  # Internet Gateways
  IGWS=$(aws ec2 describe-internet-gateways \
    --filters Name=attachment.vpc-id,Values="$vpc" --query "InternetGateways[].InternetGatewayId" --output text)
  for igw in $IGWS; do
    # Detach before deleting
    aws ec2 detach-internet-gateway --internet-gateway-id "$igw" --vpc-id "$vpc" || true
    aws ec2 delete-internet-gateway --internet-gateway-id "$igw" || true
  done

  # Route Tables - Detach associations first
  RTBS=$(aws ec2 describe-route-tables --filters Name=vpc-id,Values="$vpc" --query "RouteTables[].RouteTableId" --output text)
  for rtb in $RTBS; do
    ASSOCIATIONS=$(aws ec2 describe-route-tables --route-table-ids "$rtb" --query "RouteTables[0].Associations")
    for assoc in $(echo "$ASSOCIATIONS" | jq -r '.[] | .AssociationId'); do
      aws ec2 disassociate-route-table --association-id "$assoc" || true
    done
    aws ec2 delete-route-table --route-table-id "$rtb" || true
  done

  # Security groups (not default)
  SGROUPS=$(aws ec2 describe-security-groups --filters Name=vpc-id,Values="$vpc" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text)
  for sg in $SGROUPS; do aws ec2 delete-security-group --group-id "$sg" || true; done

  # VPC endpoints
  ENDPOINTS=$(aws ec2 describe-vpc-endpoints --filters Name=vpc-id,Values="$vpc" --query "VpcEndpoints[].VpcEndpointId" --output text)
  for ep in $ENDPOINTS; do aws ec2 delete-vpc-endpoints --vpc-endpoint-ids "$ep" || true; done

  # Finally delete the VPC
  aws ec2 delete-vpc --vpc-id "$vpc" || true
done

# CloudWatch Logs
echo "📋 Step 10: CloudWatch logs"
LOGS=$(aws logs describe-log-groups --query "logGroups[?contains(logGroupName, '${STACK_NAME}-${STAGE}')].logGroupName" --output text)
for log in $LOGS; do aws logs delete-log-group --log-group-name "$log" || true; done

# IAM Roles
echo "📋 Step 11: IAM roles"
ROLES=$(aws iam list-roles --query "Roles[?contains(RoleName, '${STACK_NAME}-${STAGE}')].RoleName" --output text)
for role in $ROLES; do
  POLICIES=$(aws iam list-attached-role-policies --role-name "$role" --query 'AttachedPolicies[].PolicyArn' --output text)
  for pol in $POLICIES; do aws iam detach-role-policy --role-name "$role" --policy-arn "$pol" || true; done
  aws iam delete-role --role-name "$role" || true
done

# CloudFormation Stack
echo "📋 Step 12: CloudFormation"
if aws cloudformation describe-stacks --stack-name "$FULL_STACK_NAME" >/dev/null 2>&1; then
  aws cloudformation delete-stack --stack-name "$FULL_STACK_NAME" || true
  aws cloudformation wait stack-delete-complete --stack-name "$FULL_STACK_NAME" || true
fi

# Final cleanup
echo "📋 Step 13: Final SST remove retry"
sst remove --stage "$STAGE" || true

# Secrets Manager
echo "📋 Step 14: Deleting Secrets Manager secrets"
SECRETS=$(aws secretsmanager list-secrets --query "SecretList[?contains(Name, '${STACK_NAME}-${STAGE}')].ARN" --output text)
for secret in $SECRETS; do
  echo "Deleting secret: $secret"
  aws secretsmanager delete-secret --secret-id "$secret" --force-delete-without-recovery || true
done

# CloudFormation Stack
echo "📋 Step 15: CloudFormation"
if aws cloudformation describe-stacks --stack-name "$FULL_STACK_NAME" >/dev/null 2>&1; then
  aws cloudformation delete-stack --stack-name "$FULL_STACK_NAME" || true
  aws cloudformation wait stack-delete-complete --stack-name "$FULL_STACK_NAME" || true
fi

echo "✅ All done. Manual cleanup complete."
