# Sieci przedsiębiorstwa w chmurze

## Wprowadzenie

Budowanie bezpiecznych i skalowalnych sieci przedsiębiorstw w chmurze wymaga ostrożnego planowania i decyzji architektonicznych. W przeciwieństwie do tradycyjnych sieci lokacyjnych, sieci w chmurze wymagają innego podejścia: infrastruktura jest efemeryczna, zasoby są tworzone i niszczone dynamicznie, a bezpieczeństwo musi być wdrażane na wielu warstwach.

W tym kompleksowym przewodniku pokażę ci, jak projektować i wdrażać architektury sieci klasy korporacyjnej na AWS, obejmujące VPC, podsieci, grupy bezpieczeństwa, listy ACL sieci, łączność VPN i zaawansowane tematy, takie jak peering VPC i AWS PrivateLink.

## Podstawy VPC

### Co to jest VPC?

Virtual Private Cloud (VPC) to izolowane środowisko sieciowe w AWS, w którym masz pełną kontrolę nad konfiguracją sieci, w tym:

- Zakresy adresów IP (bloki CIDR)
- Podsieci do segmentacji
- Tabele routingu do kontroli ruchu
- Bramy internetowe i NAT do łączności
- Grupy bezpieczeństwa i NACL do kontroli dostępu

### Najlepsze praktyki projektowania VPC

**1. Używaj bloków CIDR**

```
Primary VPC:    10.0.0.0/16 (65,536 IP)
├── Public:     10.0.1.0/24 (256 IP) - Web tier
├── Private:    10.0.2.0/24 (256 IP) - App tier
└── Database:   10.0.3.0/24 (256 IP) - DB tier
```

**2. Projekt Multi-AZ dla wysokiej dostępności**

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

## Wzory architektury sieciowej

### Wzór 1: Architektura DMZ

Odsłaniaj tylko serwery internetowe, udostępniaj prywatnie serwery aplikacji:

```
Internet
   ↓
[Internet Gateway]
   ↓
[Public Subnet: Web Servers]
   ↓
[Private Subnet: App Servers]
   ↓
[NAT Gateway dla ruchu wychodzącego]
```

### Wzór 2: Bezpieczeństwo warstwy bazy danych

Utrzymuj bazy danych izolowane w prywatnych podsieciach:

```
[Private App Subnet]
     ↓
[Security Group: Allow 5432 from App]
     ↓
[Private Database Subnet]
     ↓
[RDS Multi-AZ]
```

### Wzór 3: Aplikacja wielowarstowa

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

## Grupy bezpieczeństwa vs listy ACL sieci

### Grupy bezpieczeństwa

**Zapora sieciowa stanowa** na poziomie instancji:

```
Inbound:
├── HTTP (80) from 0.0.0.0/0
├── HTTPS (443) from 0.0.0.0/0
└── SSH (22) from 10.0.0.0/8

Outbound:
└── Cały ruch (domyślnie)
```

### Listy ACL sieci

**Zapora sieciowa bezstanowa** na poziomie podsieci:

```
Inbound:
Rule 100: Allow TCP 80 from 0.0.0.0/0
Rule 110: Allow TCP 443 from 0.0.0.0/0
Rule 120: Allow TCP 1024-65535 from 10.0.0.0/8
Rule 32767: Deny all (domyślnie)
```

## Łączność VPN

### Site-to-Site VPN

Podłącz swoją sieć lokalną do AWS VPC:

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

Zapewniaj zdalny dostęp pracownikom:

```
Remote Employee
   ↓
[OpenVPN Client]
   ↓
[Encrypted tunnel]
   ↓
[AWS Client VPN Endpoint]
   ↓
[Dostęp do zasobów prywatnych]
```

## VPC Peering

Łącz wiele VPC:

```
VPC-A (10.0.0.0/16)  ←→  VPC-B (10.1.0.0/16)
(Production)              (Development)
```

## AWS PrivateLink

Udostępniaj usługi prywatnie między VPC:

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

## Dzienniki przepływu VPC i monitorowanie

### Dzienniki przepływu VPC

Przechwyć metadane ruchu sieciowego do analizy bezpieczeństwa:

```bash
# Identyfikuj odrzucone pakiety
aws logs filter-log-events \
  --log-group-name vpc-flow-logs \
  --filter-pattern "[version, account_id, interface_id, srcaddr, dstaddr, srcport, dstport, protocol, packets, bytes, windowstart, windowend, action=\"REJECT\", flowlogstatus]"

# Identyfikuj połączenia do niezwykłych portów
aws logs filter-log-events \
  --log-group-name vpc-flow-logs \
  --filter-pattern "[version, account_id, interface_id, srcaddr, dstaddr, srcport, dstport > 32000, protocol, packets, bytes, windowstart, windowend, action, flowlogstatus]"
```

## Wydajność sieci

### Grupy umieszczenia

Grupuj instancje dla komunikacji z niską latencją:

```hcl
resource "aws_placement_group" "cluster" {
  name     = "ml-training-cluster"
  strategy = "cluster"
}
```

### Ulepszone sieci

Włącz SR-IOV dla przepustowości 10+ Gbps:

```hcl
resource "aws_instance" "high_bandwidth" {
  ami           = data.aws_ami.latest.id
  instance_type = "m5.24xlarge"
}
```

## Zgodność i bezpieczeństwo

### Segmentacja sieci

Dziel wg funkcji i poziomu bezpieczeństwa:

```
Public Tier:       Serwery internetowe, ALB, NAT Gateway
Trusted Tier:      Serwery aplikacji
Database Tier:     RDS, bazy danych
Secure Tier:       Vault, zarządzanie tajemnicami
```

### Zasada najmniejszych uprawnień

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

## Powiązane usługi U-Cloud 24

- **[Serwery VPS i chmurowe](/services/server)** - Wdrażaj infrastrukturę przedsiębiorstwa z izolacją sieciową
- **[DevOps i infrastruktura](/services/devops)** - Projektuj i zarządzaj złożonymi architekturami sieciowymi
- **[Analityka i ML](/services/analytics)** - Bezpieczne sieci do izolacji potoków danych
- **[Integracja API](/services/integration)** - Bezpiecznie łącz usługi w sieciach

**Powiązane artykuły:** [Zarządzanie tajemnicami](/blog/vault-secrets) | [Infrastruktura Terraform](/blog/terraform-iac)
