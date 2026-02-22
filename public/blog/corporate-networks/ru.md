# Корпоративные сети в облаке

## Введение

Построение безопасных и масштабируемых корпоративных сетей в облаке требует тщательного планирования и архитектурных решений. В отличие от традиционных локальных сетей, облачные сети требуют другого подхода: инфраструктура является эфемерной, ресурсы создаются и удаляются динамически, а безопасность должна быть реализована на нескольких уровнях.

В этом подробном руководстве я покажу вам, как проектировать и реализовывать архитектуры сетей корпоративного уровня на AWS, охватывая VPC, подсети, security groups, network ACLs, VPN подключение и продвинутые темы, такие как VPC peering и AWS PrivateLink.

## Основы VPC

### Что такое VPC?

Virtual Private Cloud (VPC) - это изолированное сетевое окружение в AWS, где у вас есть полный контроль над конфигурацией сети, включая:

- Диапазоны IP адресов (CIDR блоки)
- Подсети для сегментации
- Таблицы маршрутизации для контроля трафика
- Internet и NAT гейтвеи для подключения
- Security groups и NACL для контроля доступа

### Лучшие практики проектирования VPC

**1. Используйте CIDR блоки**

```
Primary VPC:    10.0.0.0/16 (65,536 IP)
├── Public:     10.0.1.0/24 (256 IP) - Web tier
├── Private:    10.0.2.0/24 (256 IP) - App tier
└── Database:   10.0.3.0/24 (256 IP) - DB tier
```

**2. Дизайн Multi-AZ для высокой доступности**

```
VPC: 10.0.0.0/16

AZ-1 (us-east-1a):
├── Public:     10.0.1.0/24
├── Private:    10.0.2.0/24
└── Database:   10.0.3.0/24

AZ-2 (us-east-1b):
├── Public:     10.0.11.0/24
├── Private:    10.0.12.0/24
└── Database:   10.0.13.0/24
```

## Паттерны сетевой архитектуры

### Паттерн 1: DMZ архитектура

Открывайте в интернет только веб-серверы, держите сервера приложений приватными:

```
Internet
   ↓
[Internet Gateway]
   ↓
[Public Subnet: Web Servers]
   ↓
[Private Subnet: App Servers]
   ↓
[NAT Gateway для исходящего трафика]
```

### Паттерн 2: Безопасность слоя базы данных

Держите базы данных изолированными в приватных подсетях:

```
[Private App Subnet]
     ↓
[Security Group: Allow 5432 from App]
     ↓
[Private Database Subnet]
     ↓
[RDS Multi-AZ]
```

### Паттерн 3: Многоуровневое приложение

```
Internet
   ↓
[Load Balancer - Public]
   ↓
[Web Tier - Private]
   ↓
[App Tier - Private]
   ↓
[Database Tier - Private]
```

## Security Groups vs Network ACLs

### Security Groups

**Stateful файрвол** на уровне экземпляра:

```
Inbound:
├── HTTP (80) from 0.0.0.0/0
├── HTTPS (443) from 0.0.0.0/0
└── SSH (22) from 10.0.0.0/8

Outbound:
└── Весь трафик (по умолчанию)
```

### Network ACLs

**Stateless файрвол** на уровне подсети:

```
Inbound:
Rule 100: Allow TCP 80 from 0.0.0.0/0
Rule 110: Allow TCP 443 from 0.0.0.0/0
Rule 120: Allow TCP 1024-65535 from 10.0.0.0/8
Rule 32767: Deny all (по умолчанию)
```

## VPN подключение

### Site-to-Site VPN

Подключите вашу локальную сеть к AWS VPC:

```
On-Premises Network (192.168.0.0/16)
         ↓
   [VPN Connection]
         ↓
   [Virtual Private Gateway]
         ↓
   AWS VPC (10.0.0.0/16)
```

### Client VPN

Предоставьте удаленный доступ для сотрудников:

```
Remote Employee
   ↓
[OpenVPN Client]
   ↓
[Encrypted tunnel]
   ↓
[AWS Client VPN Endpoint]
   ↓
[Доступ к приватным ресурсам]
```

## VPC Peering

Соединяйте несколько VPC:

```
VPC-A (10.0.0.0/16)  ←→  VPC-B (10.1.0.0/16)
(Production)              (Development)
```

## AWS PrivateLink

Предоставляйте сервисы приватно между VPC:

```
VPC-A (Consumer)
   ↓
[VPC Endpoint]
   ↓
[PrivateLink Connection]
   ↓
[Network Load Balancer]
   ↓
VPC-B (Producer Service)
```

## VPC Flow Logs и мониторинг

### VPC Flow Logs

Захватывайте метаданные сетевого трафика для анализа безопасности:

```bash
# Определите отклоненные пакеты
aws logs filter-log-events \
  --log-group-name vpc-flow-logs \
  --filter-pattern "[version, account_id, interface_id, srcaddr, dstaddr, srcport, dstport, protocol, packets, bytes, windowstart, windowend, action=\"REJECT\", flowlogstatus]"

# Определите подключения к необычным портам
aws logs filter-log-events \
  --log-group-name vpc-flow-logs \
  --filter-pattern "[version, account_id, interface_id, srcaddr, dstaddr, srcport, dstport > 32000, protocol, packets, bytes, windowstart, windowend, action, flowlogstatus]"
```

## Производительность сети

### Placement Groups

Группируйте экземпляры для низкой latency коммуникации:

```hcl
resource "aws_placement_group" "cluster" {
  name     = "ml-training-cluster"
  strategy = "cluster"
}
```

### Enhanced Networking

Включите SR-IOV для 10+ Gbps пропускной способности:

```hcl
resource "aws_instance" "high_bandwidth" {
  ami           = data.aws_ami.latest.id
  instance_type = "m5.24xlarge"
}
```

## Соответствие и безопасность

### Сегментация сети

Разделяйте по функциям и уровню безопасности:

```
Public Tier:       Веб-серверы, ALB, NAT Gateway
Trusted Tier:      Серверы приложений
Database Tier:     RDS, базы данных
Secure Tier:       Vault, управление секретами
```

### Принцип минимальных привилегий

```hcl
resource "aws_security_group" "web" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}
```

---

## Связанные услуги U-Cloud 24

- **[VPS и облачные серверы](/services/server)** - Развертывайте корпоративную инфраструктуру с сетевой изоляцией
- **[DevOps и инфраструктура](/services/devops)** - Проектируйте и управляйте сложными сетевыми архитектурами
- **[Аналитика и ML](/services/analytics)** - Безопасные сети для изоляции data pipeline
- **[Интеграция API](/services/integration)** - Безопасно соединяйте сервисы через сети

**Связанные статьи:** [Управление секретами](/blog/vault-secrets) | [Инфраструктура с Terraform](/blog/terraform-iac)
