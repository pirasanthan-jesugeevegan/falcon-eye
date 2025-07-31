# 🚀 PR-Based Deployment Strategy

## 📋 Overview

This project uses a **PR-based deployment strategy** that creates temporary environments for each pull request, ensuring safe and cost-effective deployments.

## 🔄 Workflow Files

### ✅ **Active Workflows**

| File                      | Purpose               | Trigger             | Environment   |
| ------------------------- | --------------------- | ------------------- | ------------- |
| `ci.yml`                  | Code quality checks   | All pushes/PRs      | None          |
| `pr-deploy.yml`           | PR environments       | PR events           | `pr-{number}` |
| `merge-to-production.yml` | Production deployment | PR merged to master | `production`  |

### ❌ **Removed Workflows**

| File                | Reason for Removal            |
| ------------------- | ----------------------------- |
| `cd-staging.yml`    | Replaced by PR environments   |
| `cd-production.yml` | Replaced by PR merge workflow |

## 🎯 **Deployment Flow**

### **1. Pull Request Created**

```
PR #123 opened → Deploy to pr-123 → Comment with preview URL
```

### **2. New Commits on PR**

```
New commit → Update pr-123 → Update comment with new URL
```

### **3. PR Merged**

```
PR merged → Deploy to production → Destroy pr-123 → Comment with production URL
```

### **4. PR Closed (Not Merged)**

```
PR closed → Destroy pr-123 → Comment cleanup notification
```

## 💰 **Cost Optimization**

### **Per PR Environment**

- **1 S3 bucket** (reused for all commits)
- **1 CloudFront distribution** (reused for all commits)
- **1 Lambda function** (reused for all commits)
- **Estimated cost**: ~$0.50-1.00/month per PR

### **Automatic Cleanup**

- ✅ PR environments destroyed on merge/close
- ✅ No orphaned resources
- ✅ Cost-effective temporary environments

## 🔧 **Environment Stages**

| Stage         | Purpose    | Lifecycle                     |
| ------------- | ---------- | ----------------------------- |
| `pr-{number}` | PR preview | Created → Updated → Destroyed |
| `production`  | Live site  | Permanent                     |

## 🎉 **Benefits**

1. **Safety**: Production only deploys after PR review
2. **Cost**: One environment per PR, not per commit
3. **Speed**: Reuses infrastructure for updates
4. **Transparency**: Clear preview URLs for testing
5. **Cleanup**: Automatic resource management

## 🚀 **Getting Started**

1. **Create a PR** → Automatic preview environment
2. **Test changes** → Use preview URL
3. **Merge PR** → Automatic production deployment
4. **Cleanup** → Automatic resource cleanup

---

_This strategy provides the perfect balance of safety, cost-effectiveness, and developer experience!_ 🎯
