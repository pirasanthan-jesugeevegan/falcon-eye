#!/bin/bash

# All-in-one script to remove all AWS resources for the SST stack
# This script handles the RDS dependency issue and removes everything

set -e

# Disable AWS CLI pager to prevent interactive prompts
export AWS_PAGER=""

STACK_NAME="pj-falcon-eye-stack"
STAGE="${STAGE:-pirasanthanjesugeevegan}"
FULL_STACK_NAME="${STACK_NAME}-${STAGE}"

echo "🚀 Starting complete removal of all resources for stack: $FULL_STACK_NAME"
echo "=================================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if AWS CLI is installed
if ! command_exists aws; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if SST is installed
if ! command_exists sst; then
    echo "❌ SST is not installed. Please install it first."
    pnpm add --save-dev @serverless-stack/cli
    # exit 1
fi

echo "📋 Step 1: Attempting SST remove first..."
if sst remove --stage "$STAGE"; then
    echo "✅ SST remove successful! All resources cleaned up."
    exit 0
fi

echo "⚠️  SST remove failed, proceeding with manual cleanup..."

echo "📋 Step 2: Cleaning up RDS instances..."
RDS_INSTANCES=$(aws rds describe-db-instances \
    --query "DBInstances[?contains(DBInstanceIdentifier, 'pj-falcon-eye-${STAGE}') || contains(DBInstanceIdentifier, '${STACK_NAME}-${STAGE}')].DBInstanceIdentifier" \
    --output text 2>/dev/null || echo "")

if [ ! -z "$RDS_INSTANCES" ]; then
    echo "Found RDS instances: $RDS_INSTANCES"
    for instance in $RDS_INSTANCES; do
        echo "Deleting RDS instance: $instance"
        aws rds delete-db-instance \
            --db-instance-identifier "$instance" \
            --skip-final-snapshot \
            --delete-automated-backups || true
    done
    
    echo "Waiting for RDS instances to be deleted..."
    for instance in $RDS_INSTANCES; do
        aws rds wait db-instance-deleted --db-instance-identifier "$instance" || true
    done
else
    echo "No RDS instances found"
fi

echo "📋 Step 3: Cleaning up RDS subnet groups..."
SUBNET_GROUPS=$(aws rds describe-db-subnet-groups \
    --query "DBSubnetGroups[?contains(DBSubnetGroupName, '${STACK_NAME}-${STAGE}')].DBSubnetGroupName" \
    --output text 2>/dev/null || echo "")

if [ ! -z "$SUBNET_GROUPS" ]; then
    echo "Found subnet groups: $SUBNET_GROUPS"
    for group in $SUBNET_GROUPS; do
        echo "Deleting subnet group: $group"
        aws rds delete-db-subnet-group --db-subnet-group-name "$group" || true
    done
else
    echo "No subnet groups found"
fi

echo "📋 Step 4: Cleaning up Lambda functions..."
LAMBDA_FUNCTIONS=$(aws lambda list-functions \
    --query "Functions[?contains(FunctionName, '${STACK_NAME}-${STAGE}') || contains(FunctionName, '${STAGE}')].FunctionName" \
    --output text 2>/dev/null || echo "")

if [ ! -z "$LAMBDA_FUNCTIONS" ]; then
    echo "Found Lambda functions: $LAMBDA_FUNCTIONS"
    for func in $LAMBDA_FUNCTIONS; do
        echo "Deleting Lambda function: $func"
        aws lambda delete-function --function-name "$func" || true
    done
else
    echo "No Lambda functions found"
fi

echo "📋 Step 5: Cleaning up VPCs..."
VPC_IDS=$(aws ec2 describe-vpcs \
    --filters "Name=tag:Name,Values=*${STACK_NAME}*" \
    --query 'Vpcs[].VpcId' \
    --output text 2>/dev/null || echo "")

if [ ! -z "$VPC_IDS" ]; then
    echo "Found VPCs: $VPC_IDS"
    for vpc in $VPC_IDS; do
        echo "Deleting VPC: $vpc"
        # Delete VPC dependencies first
        aws ec2 delete-vpc --vpc-id "$vpc" || true
    done
else
    echo "No VPCs found"
fi

echo "📋 Step 6: Cleaning up CloudWatch log groups..."
LOG_GROUPS=$(aws logs describe-log-groups \
    --no-cli-pager \
    --query "logGroups[?contains(logGroupName, '${STACK_NAME}-${STAGE}') || contains(logGroupName, '${STAGE}')].logGroupName" \
    --output text 2>/dev/null || echo "")

if [ ! -z "$LOG_GROUPS" ]; then
    echo "Found log groups: $LOG_GROUPS"
    for group in $LOG_GROUPS; do
        echo "Deleting log group: $group"
        aws logs delete-log-group --log-group-name "$group" || true
    done
else
    echo "No log groups found"
fi

echo "📋 Step 7: Cleaning up IAM roles..."
IAM_ROLES=$(aws iam list-roles \
    --no-cli-pager \
    --query "Roles[?contains(RoleName, '${STACK_NAME}-${STAGE}') || contains(RoleName, '${STAGE}')].RoleName" \
    --output text 2>/dev/null || echo "")

if [ ! -z "$IAM_ROLES" ]; then
    echo "Found IAM roles: $IAM_ROLES"
    for role in $IAM_ROLES; do
        echo "Deleting IAM role: $role"
        # Detach policies first
        aws iam list-attached-role-policies --no-cli-pager --role-name "$role" --query 'AttachedPolicies[].PolicyArn' --output text | xargs -I {} aws iam detach-role-policy --role-name "$role" --policy-arn {} || true
        aws iam delete-role --role-name "$role" || true
    done
else
    echo "No IAM roles found"
fi

echo "📋 Step 8: Attempting CloudFormation stack deletion..."
if aws cloudformation describe-stacks --stack-name "$FULL_STACK_NAME" >/dev/null 2>&1; then
    echo "Deleting CloudFormation stack: $FULL_STACK_NAME"
    aws cloudformation delete-stack --stack-name "$FULL_STACK_NAME" || true
    echo "Waiting for stack deletion to complete..."
    aws cloudformation wait stack-delete-complete --stack-name "$FULL_STACK_NAME" || true
else
    echo "No CloudFormation stack found"
fi

echo "📋 Step 9: Final SST remove attempt..."
if sst remove --stage "$STAGE"; then
    echo "✅ Final SST remove successful!"
else
    echo "⚠️  Final SST remove failed, but manual cleanup completed"
fi

echo "=================================================="
echo "🎉 Cleanup process completed!"
echo "If any resources remain, you may need to manually delete them from the AWS Console." 