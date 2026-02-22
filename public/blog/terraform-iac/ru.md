# Terraform для ML инфраструктуры

## Введение

Infrastructure as Code (IaC) революционизировала способ управления облачными ресурсами. Terraform, разработанный HashiCorp, является ведущим инструментом IaC с открытым исходным кодом, который позволяет определять, предпросмотреть и развертывать изменения инфраструктуры безопасно и эффективно. Для ML-нагрузок наличие воспроизводимой, управляемой в системе контроля версий инфраструктуры критически важно для обеспечения согласованности между разработкой, staging и production окружениями.

В этом руководстве я покажу вам, как настроить полную ML-инфраструктуру с помощью Terraform, от базовой конфигурации VPC до развертывания GPU-enabled вычислительных экземпляров для обучения моделей.

## Почему Terraform для ML инфраструктуры?

### Воспроизводимость

Управление облачной инфраструктурой через AWS Console или веб-интерфейс подвержено ошибкам и затрудняет репликацию окружений. Terraform позволяет определить всю инфраструктуру в коде, обеспечивая, что ваше staging окружение является точной копией production.

**Преимущества:**
- Согласованность окружений в команде
- Быстрое восстановление окружения для аварийного восстановления
- Четкий аудит всех изменений инфраструктуры
- Легкая адаптация новых членов команды

### Контроль версий

Ваш код инфраструктуры хранится в Git, как и код приложения. Это означает, что каждое изменение отслеживается, проверяется и может быть откачено при необходимости. Вы получаете все преимущества review кода и CI/CD конвейеров, применяемые к инфраструктуре.

### Оптимизация затрат

Команда `terraform plan` показывает вам именно, какие ресурсы будут созданы или изменены до внесения каких-либо изменений. Это предотвращает случайное создание ресурсов и помогает оценить затраты.

## Настройка вашего первого проекта Terraform

### Шаг 1: Установка Terraform

```bash
# macOS
brew install terraform

# Ubuntu/Debian
wget https://releases.hashicorp.com/terraform/1.7.4/terraform_1.7.4_linux_amd64.zip
unzip terraform_1.7.4_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

### Шаг 2: Настройка учетных данных AWS

```bash
aws configure
# Введите AWS Access Key ID
# Введите AWS Secret Access Key
# Регион по умолчанию: us-east-1
# Формат вывода: json
```

### Шаг 3: Создание структуры проекта

```bash
mkdir ml-infrastructure && cd ml-infrastructure
touch main.tf variables.tf outputs.tf terraform.tfvars
```

## Основная конфигурация Terraform

### Настройка VPC и сетей

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

# VPC для ML-нагрузок
resource "aws_vpc" "ml_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "ml-vpc"
  }
}

# Subnets в нескольких AZ
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
```

### Экземпляры EC2 для обучения моделей

```hcl
# GPU экземпляр для training
resource "aws_instance" "ml_training" {
  count               = var.enable_training_instance ? 1 : 0
  ami                 = data.aws_ami.deep_learning.id
  instance_type       = var.training_instance_type
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
```

### S3 для хранения моделей

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
```

## Рабочий процесс: Plan, Apply, Destroy

### Планирование изменений инфраструктуры

```bash
# Просмотр того, что Terraform создаст/изменит/удалит
terraform plan -out=plan.tfplan

# Проверка плана
terraform plan -out=plan.tfplan | grep -A5 "Plan:"
```

### Применение изменений

```bash
# Создание инфраструктуры
terraform apply plan.tfplan

# Или интерактивно
terraform apply
```

### Удаление инфраструктуры

```bash
# Проверка того, что будет удалено
terraform plan -destroy

# Удаление (с подтверждением)
terraform destroy
```

## Управление состоянием и удаленное хранилище

### Локальное состояние

По умолчанию Terraform хранит состояние локально в `terraform.tfstate`. Этот файл не должен коммититься в Git.

```bash
# Добавить в .gitignore
echo "terraform.tfstate*" >> .gitignore
echo "*.tfvars" >> .gitignore
```

### Удаленное состояние (S3 Backend)

Для совместной работы команды, храните состояние в S3:

```hcl
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

## Лучшие практики для ML инфраструктуры

### 1. Модули для переиспользования

Создавайте модули для общих компонентов:

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
}
```

### 2. Используйте Workspace для окружений

Управляйте несколькими окружениями (dev, staging, prod) с помощью workspace:

```bash
terraform workspace new dev
terraform workspace new prod
terraform workspace select prod
terraform apply
```

### 3. Внедрите CI/CD конвейер

Автоматизируйте Terraform рабочие процессы с GitHub Actions:

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

## Типичные паттерны ML инфраструктуры

### Паттерн 1: Development окружение

Недорогой setup с одним экземпляром для экспериментов:

```hcl
instance_type = "t3.2xlarge"
enable_gpu    = false
```

### Паттерн 2: Pipeline для обучения

Многогорячая setup с auto-scaling для batch training:

```hcl
instance_type = "p3.8xlarge"  # 4x V100 GPUs
auto_scaling  = true
```

### Паттерн 3: Production Inference

Оптимизированный по стоимости inference с load balancing:

```hcl
instance_type = "g4dn.2xlarge"
load_balancer = true
```

---

## Связанные услуги U-Cloud 24

- **[VPS и облачные серверы](/services/server)** - Развертывание и управление инфраструктурой с максимальной надежностью
- **[DevOps и инфраструктура](/services/devops)** - Экспертная автоматизация инфраструктуры и оптимизация
- **[Аналитика и ML](/services/analytics)** - Комплексные решения ML инфраструктуры
- **[Интеграция API](/services/integration)** - Соединяйте компоненты инфраструктуры без проблем

**Связанные статьи:** [Выбор ML сервера](/blog/server-for-ml) | [Мониторинг production](/blog/monitoring-stack)
