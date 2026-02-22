# Terraform for ML Infrastructure

## Introduction

Infrastructure as Code (IaC) has revolutionized how teams manage cloud resources. Terraform, developed by HashiCorp, is the industry-leading open-source IaC tool that enables you to define, preview, and deploy infrastructure changes safely and efficiently. When it comes to ML workloads, having reproducible, version-controlled infrastructure is essential for consistency across development, staging, and production environments.

In this guide, I'll walk you through setting up a complete ML infrastructure using Terraform, from basic VPC configuration to deploying GPU-enabled compute instances for model training.

## Why Terraform for ML Infrastructure?

### Reproducibility

Managing cloud infrastructure through the AWS Console or web UI is error-prone and makes it difficult to replicate environments. Terraform allows you to define your entire infrastructure in code, ensuring that your staging environment is an exact replica of production.

**Benefits:**
- Consistent environments across teams
- Rapid environment recreation for disaster recovery
- Clear audit trail of all infrastructure changes
- Easy onboarding of new team members

### Version Control

Your infrastructure code lives in Git, just like application code. This means every change is tracked, reviewed, and can be rolled back if needed. You get the same benefits of code review and CI/CD pipelines applied to infrastructure.

### Cost Optimization

Terraform's `terraform plan` command shows you exactly what resources will be created or modified before any changes happen. This prevents accidental resource creation and helps estimate costs.

## Setting Up Your First Terraform Project

### Step 1: Install Terraform

```bash
# macOS
brew install terraform

# Ubuntu/Debian
wget https://releases.hashicorp.com/terraform/1.7.4/terraform_1.7.4_linux_amd64.zip
unzip terraform_1.7.4_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

### Step 2: Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

### Step 3: Create Project Structure

```bash
mkdir ml-infrastructure && cd ml-infrastructure
touch main.tf variables.tf outputs.tf terraform.tfvars
```

## Core Terraform Configuration

### VPC and Network Setup

```hcl
# main.tf

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC for ML workloads
resource "aws_vpc" "ml_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "ml-vpc"
  }
}

# Subnets in multiple AZs
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.ml_vpc.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "ml-public-subnet-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.ml_vpc.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "ml-private-subnet-${count.index + 1}"
  }
}
```

### EC2 Instances for Model Training

```hcl
# GPU Instance for training
resource "aws_instance" "ml_training" {
  count               = var.enable_training_instance ? 1 : 0
  ami                 = data.aws_ami.deep_learning.id
  instance_type       = var.training_instance_type  # p3.2xlarge for 1x GPU
  subnet_id           = aws_subnet.public[0].id
  iam_instance_profile = aws_iam_instance_profile.ml_profile.name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 100
    delete_on_termination = true
  }

  tags = {
    Name = "ml-training-instance"
  }
}

# Inference instance (lower cost)
resource "aws_instance" "ml_inference" {
  count               = var.enable_inference_instance ? 1 : 0
  ami                 = data.aws_ami.deep_learning.id
  instance_type       = var.inference_instance_type  # g4dn.xlarge for inference
  subnet_id           = aws_subnet.public[1].id
  iam_instance_profile = aws_iam_instance_profile.ml_profile.name

  tags = {
    Name = "ml-inference-instance"
  }
}
```

### S3 for Model Storage

```hcl
resource "aws_s3_bucket" "models" {
  bucket = "ml-models-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "ml-models"
  }
}

resource "aws_s3_bucket_versioning" "models" {
  bucket = aws_s3_bucket.models.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "models" {
  bucket = aws_s3_bucket.models.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

## Variables and Outputs

### Variables

```hcl
# variables.tf

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "training_instance_type" {
  description = "EC2 instance type for training"
  type        = string
  default     = "p3.2xlarge"
}

variable "inference_instance_type" {
  description = "EC2 instance type for inference"
  type        = string
  default     = "g4dn.xlarge"
}

variable "enable_training_instance" {
  description = "Whether to create training instance"
  type        = bool
  default     = true
}
```

### Outputs

```hcl
# outputs.tf

output "training_instance_ip" {
  description = "IP address of training instance"
  value       = try(aws_instance.ml_training[0].public_ip, "")
}

output "s3_models_bucket" {
  description = "S3 bucket for model storage"
  value       = aws_s3_bucket.models.bucket
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.ml_vpc.id
}
```

## Workflow: Plan, Apply, Destroy

### Planning Infrastructure Changes

```bash
# Review what Terraform will create/modify/delete
terraform plan -out=plan.tfplan

# Examine the plan
terraform plan -out=plan.tfplan | grep -A5 "Plan:"
```

### Applying Changes

```bash
# Create infrastructure
terraform apply plan.tfplan

# Or interactively
terraform apply
```

### Destroying Infrastructure

```bash
# Check what will be destroyed
terraform plan -destroy

# Destroy (with confirmation)
terraform destroy

# Destroy without confirmation
terraform destroy -auto-approve
```

## State Management and Remote Storage

### Local State

By default, Terraform stores state locally in `terraform.tfstate`. This file should not be committed to Git.

```bash
# Add to .gitignore
echo "terraform.tfstate*" >> .gitignore
echo "*.tfvars" >> .gitignore
```

### Remote State (S3 Backend)

For team collaboration, store state in S3:

```hcl
# Create S3 backend
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "ml-infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

## Best Practices for ML Infrastructure

### 1. Modules for Reusability

Create modules for common components:

```hcl
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr              = var.vpc_cidr
  availability_zones    = var.availability_zones
}

module "compute" {
  source = "./modules/compute"

  vpc_id           = module.vpc.vpc_id
  instance_type    = var.training_instance_type
  subnet_id        = module.vpc.public_subnet_ids[0]
}
```

### 2. Use Workspace for Environments

Manage multiple environments (dev, staging, prod) with workspaces:

```bash
terraform workspace new dev
terraform workspace new prod
terraform workspace select prod
terraform apply
```

### 3. Implement CI/CD Pipeline

Automate Terraform workflows with GitHub Actions:

```yaml
name: Terraform

on:
  pull_request:
    paths:
      - 'terraform/**'

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: hashicorp/setup-terraform@v2
      - run: terraform init
      - run: terraform plan -no-color
```

## Common ML Infrastructure Patterns

### Pattern 1: Development Environment

Low-cost, single instance setup for experimentation:

```hcl
instance_type = "t3.2xlarge"  # CPU-only development
enable_gpu    = false
```

### Pattern 2: Training Pipeline

Multi-GPU setup with auto-scaling for batch training:

```hcl
instance_type = "p3.8xlarge"  # 4x V100 GPUs
auto_scaling  = true
min_instances = 1
max_instances = 5
```

### Pattern 3: Production Inference

Cost-optimized inference with load balancing:

```hcl
instance_type = "g4dn.2xlarge"  # NVIDIA T4 GPUs
load_balancer = true
min_instances = 2
max_instances = 10
```

## Troubleshooting Terraform Issues

### Issue: Drift Detection

Infrastructure changes made outside Terraform (via Console):

```bash
# Detect drift
terraform refresh

# Fix drift (re-import)
terraform import aws_instance.ml_training i-1234567890abcdef0
```

### Issue: Insufficient Capacity

GPU instance types may have capacity issues in certain AZs:

```bash
# Solution: Use multiple AZs and try spot instances
resource "aws_spot_instance_request" "gpu" {
  ami                  = data.aws_ami.deep_learning.id
  instance_type        = "p3.2xlarge"
  spot_price           = "1.50"  # Check current pricing
  availability_zone    = var.availability_zones[0]
}
```

---

## Related U-Cloud 24 Services

- **[VPS & Cloud Servers](/services/server)** - Deploy and manage your infrastructure with the highest uptime
- **[DevOps & Infrastructure](/services/devops)** - Expert infrastructure automation and optimization
- **[Data Analytics & ML](/services/analytics)** - End-to-end ML infrastructure solutions
- **[API Integration](/services/integration)** - Connect your infrastructure components seamlessly

**Related articles:** [ML Server Selection](/blog/server-for-ml) | [Production Monitoring](/blog/monitoring-stack)
