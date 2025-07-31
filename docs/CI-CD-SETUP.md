# CI/CD Setup Guide

This guide will help you set up automated deployment for your QA Monitor application.

## Overview

The CI/CD pipeline includes:

- **Testing**: Linting, unit tests, and build verification
- **Staging Deployment**: Automatic deployment to staging environment on `develop` branch
- **Production Deployment**: Manual deployment to production on `main` branch

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **AWS Account**: With appropriate permissions for S3, CloudFront, and IAM
3. **AWS Credentials**: Access key and secret key for deployment

## Setup Steps

### 1. Create AWS IAM User for CI/CD

Create a new IAM user with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "iam:*",
        "lambda:*",
        "cloudformation:*",
        "ssm:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### 3. Configure Branch Protection (Optional)

For production safety, set up branch protection rules:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

## Workflow Files

### Simple Deployment (`deploy.yml`)

- Triggers on push to `main`
- Builds and deploys directly to production
- Good for small teams or rapid development

### Advanced Pipeline (`ci-cd.yml`)

- Includes testing phase
- Separate staging and production environments
- Better for larger teams and production safety

## Usage

### Development Workflow

1. **Create feature branch**:

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and commit**:

   ```bash
   git add .
   git commit -m "Add new feature"
   ```

3. **Push to trigger CI**:

   ```bash
   git push origin feature/new-feature
   ```

4. **Create Pull Request** to `develop` for staging deployment

5. **Merge to `main`** for production deployment

### Manual Deployment

If you need to deploy manually:

```bash
# Deploy to staging
cd infra
pnpm run deploy:sst --stage staging

# Deploy to production
cd infra
pnpm run deploy:sst --stage production
```

## Environment Variables

The pipeline uses these environment variables:

- `AWS_REGION`: us-east-1 (default)
- `AWS_ACCESS_KEY_ID`: From GitHub secrets
- `AWS_SECRET_ACCESS_KEY`: From GitHub secrets

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**:
   - Verify secrets are correctly set in GitHub
   - Check IAM permissions
   - Ensure AWS region is correct

2. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review linting errors

3. **Deployment Failures**:
   - Check CloudFormation stack status
   - Verify S3 bucket permissions
   - Review CloudFront distribution settings

### Debugging

To debug deployment issues:

1. Check GitHub Actions logs
2. Review AWS CloudFormation events
3. Check S3 bucket contents
4. Verify CloudFront distribution status

## Security Best Practices

1. **Use IAM Roles**: Instead of access keys when possible
2. **Limit Permissions**: Only grant necessary AWS permissions
3. **Rotate Credentials**: Regularly update access keys
4. **Monitor Access**: Use AWS CloudTrail to monitor deployments

## Cost Optimization

1. **Clean Up**: Remove unused CloudFormation stacks
2. **Monitor Usage**: Set up AWS billing alerts
3. **Optimize Assets**: Compress and optimize frontend assets
4. **Use CDN**: Leverage CloudFront for global distribution

## Next Steps

1. Set up monitoring and alerting
2. Configure custom domain names
3. Implement blue-green deployments
4. Add performance testing to the pipeline
