# Terraform dla infrastruktury ML

## Wprowadzenie

Infrastructure as Code (IaC) zrewolucjonizowała sposób zarządzania zasobami w chmurze. Terraform, opracowany przez HashiCorp, jest wiodącym narzędziem IaC o otwartym kodzie źródłowym, które umożliwia definiowanie, podgląd i wdrażanie zmian infrastruktury w bezpieczny i efektywny sposób. W przypadku obciążeń ML posiadanie powtarzalnej, kontrolowanej wersjonowaniem infrastruktury jest niezbędne do zapewnienia spójności między środowiskami développement, staging i produkcji.

W tym przewodniku pokażę ci, jak skonfigurować kompletną infrastrukturę ML przy użyciu Terraform, od podstawowej konfiguracji VPC do wdrażania instancji obliczeniowych z obsługą GPU do trenowania modeli.

## Dlaczego Terraform dla infrastruktury ML?

### Powtarzalność

Zarządzanie infrastrukturą chmury poprzez konsolę AWS lub interfejs sieciowy jest podatne na błędy i utrudnia replikację środowisk. Terraform umożliwia zdefiniowanie całej infrastruktury w kodzie, zapewniając, że twoje środowisko staging jest dokładną kopią produkcji.

**Korzyści:**
- Spójne środowiska w całym zespole
- Szybkie odtworzenie środowiska do odzyskiwania danych
- Jasna ścieżka audytu wszystkich zmian infrastruktury
- Łatwe wdrażanie nowych członków zespołu

### Kontrola wersji

Twój kod infrastruktury przechowywany jest w Git, tak jak kod aplikacji. Oznacza to, że każda zmiana jest śledzona, przejrzysta i można ją cofnąć w razie potrzeby. Otrzymujesz wszystkie korzyści przeglądu kodu i potoków CI/CD stosowanych do infrastruktury.

### Optymalizacja kosztów

Polecenie `terraform plan` pokazuje ci dokładnie, jakie zasoby będą utworzone lub zmienione przed wprowadzeniem jakichkolwiek zmian. Zapobiega to przypadkowemu tworzeniu zasobów i pomaga oszacować koszty.

## Konfiguracja twojego pierwszego projektu Terraform

### Krok 1: Instalacja Terraform

```bash
# macOS
brew install terraform

# Ubuntu/Debian
wget https://releases.hashicorp.com/terraform/1.7.4/terraform_1.7.4_linux_amd64.zip
unzip terraform_1.7.4_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

### Krok 2: Konfiguracja poświadczeń AWS

```bash
aws configure
# Podaj AWS Access Key ID
# Podaj AWS Secret Access Key
# Domyślny region: us-east-1
# Domyślny format wyjścia: json
```

### Krok 3: Tworzenie struktury projektu

```bash
mkdir ml-infrastructure && cd ml-infrastructure
touch main.tf variables.tf outputs.tf terraform.tfvars
```

## Podstawowa konfiguracja Terraform

### Konfiguracja VPC i sieci

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

# VPC dla obciążeń ML
resource "aws_vpc" "ml_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "ml-vpc"
  }
}

# Sieci w wielu AZ
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

### Instancje EC2 do trenowania modeli

```hcl
# Instancja GPU do trenowania
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

### S3 do przechowywania modeli

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

## Przepływ pracy: Plan, Apply, Destroy

### Planowanie zmian infrastruktury

```bash
# Przejrzyj, co Terraform utworzy/zmieni/usunie
terraform plan -out=plan.tfplan

# Sprawdź plan
terraform plan -out=plan.tfplan | grep -A5 "Plan:"
```

### Wdrażanie zmian

```bash
# Tworzenie infrastruktury
terraform apply plan.tfplan

# Lub interaktywnie
terraform apply
```

### Usuwanie infrastruktury

```bash
# Sprawdź, co będzie usunięte
terraform plan -destroy

# Usuń (z potwierdzeniem)
terraform destroy
```

## Zarządzanie stanem i przechowywanie zdalne

### Stan lokalny

Domyślnie Terraform przechowuje stan lokalnie w `terraform.tfstate`. Plik ten nie powinien być zatwierdzany w Git.

```bash
# Dodaj do .gitignore
echo "terraform.tfstate*" >> .gitignore
echo "*.tfvars" >> .gitignore
```

### Stan zdalny (S3 Backend)

Dla współpracy zespołowej przechowuj stan w S3:

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

## Najlepsze praktyki dla infrastruktury ML

### 1. Moduły do ponownego wykorzystania

Twórz moduły dla wspólnych komponentów:

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

### 2. Używaj Workspace dla środowisk

Zarządzaj wieloma środowiskami (dev, staging, prod) za pomocą workspace:

```bash
terraform workspace new dev
terraform workspace new prod
terraform workspace select prod
terraform apply
```

### 3. Wdrażaj potok CI/CD

Automatyzuj przepływy pracy Terraform za pomocą GitHub Actions:

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

## Typowe wzory infrastruktury ML

### Wzór 1: Środowisko desenvolvimento

Niedroga konfiguracja z jedną instancją do eksperymentów:

```hcl
instance_type = "t3.2xlarge"
enable_gpu    = false
```

### Wzór 2: Potok trenowania

Wielogpu konfiguracja z auto-skalowaniem do trenowania batch:

```hcl
instance_type = "p3.8xlarge"  # 4x V100 GPUs
auto_scaling  = true
```

### Wzór 3: Inference produkcji

Zoptymalizowana pod względem kosztów wnioskowanie z load balancingiem:

```hcl
instance_type = "g4dn.2xlarge"
load_balancer = true
```

---

## Powiązane usługi U-Cloud 24

- **[Serwery VPS i chmurowe](/services/server)** - Wdrażaj i zarządzaj infrastrukturą z najwyższą dostępnością
- **[DevOps i infrastruktura](/services/devops)** - Ekspertna automatyzacja infrastruktury i optymalizacja
- **[Analityka i ML](/services/analytics)** - Kompletne rozwiązania infrastruktury ML
- **[Integracja API](/services/integration)** - Bezproblemowo połącz komponenty infrastruktury

**Powiązane artykuły:** [Wybór serwera ML](/blog/server-for-ml) | [Monitorowanie produkcji](/blog/monitoring-stack)
