# Enterprise Networks in the Cloud

## Introduction

Building secure, scalable enterprise networks in the cloud requires careful planning and architectural decisions. Unlike traditional on-premises networks, cloud networking demands a different mindset: infrastructure is ephemeral, resources are created and destroyed dynamically, and security must be implemented at multiple layers.

In this comprehensive guide, I'll walk you through designing and implementing enterprise-grade network architectures on AWS, covering VPCs, subnets, security groups, network ACLs, VPN connectivity, and advanced topics like VPC peering and AWS PrivateLink.

## The Evolution of Enterprise Networking

### Traditional On-Premises

- Fixed physical infrastructure
- Perimeter-based security
- Difficult to scale
- High capital expenditure

### Cloud-Native

- Ephemeral resources
- Defense-in-depth security
- Automatic scaling
- Pay-per-use model

The transition requires rethinking how we design networks.

## VPC Fundamentals

### What is a VPC?

A Virtual Private Cloud (VPC) is an isolated network environment in AWS where you have complete control over the network configuration, including:

- IP address ranges (CIDR blocks)
- Subnets for segmentation
- Route tables for traffic control
- Internet and NAT gateways for connectivity
- Security groups and NACLs for access control

### VPC Design Best Practices

**1. Use a Classless Inter-Domain Routing (CIDR) Block**

```
Primary VPC:    10.0.0.0/16 (65,536 IPs)
├── Public:     10.0.1.0/24 (256 IPs) - Web tier
├── Private:    10.0.2.0/24 (256 IPs) - App tier
└── Database:   10.0.3.0/24 (256 IPs) - DB tier
```

**2. Multi-AZ Design for High Availability**

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

## Network Architecture Patterns

### Pattern 1: DMZ Architecture

Expose only web servers to the internet, keep application servers private:

```
Internet
   ↓
[Internet Gateway]
   ↓
[Public Subnet: Web Servers (ELB)]
   ↓
[Route Table: 0.0.0.0/0 → IGW]
   ↓
[Private Subnet: App Servers]
   ↓
[NAT Gateway for outbound access]
   ↓
[Security Group: Allow 443 from Web]
```

### Pattern 2: Database Tier Security

Keep databases isolated in private subnets:

```
[Private App Subnet]
     ↓
[Security Group: Allow 5432 from App]
     ↓
[Private Database Subnet]
     ↓
[RDS Multi-AZ]
```

### Pattern 3: Multi-Tier Application

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
   ↓
[Backup/Archive - Private S3]
```

## Security Groups vs Network ACLs

### Security Groups

**Stateful firewall** at the instance level:

```
Inbound:
├── HTTP (80) from 0.0.0.0/0
├── HTTPS (443) from 0.0.0.0/0
└── SSH (22) from 10.0.0.0/8 (internal only)

Outbound:
└── All traffic to anywhere (default)
```

**Characteristics:**
- Stateful (replies automatically allowed)
- Applied to instances
- Allow rules only (no deny)
- Evaluated before ACLs

### Network ACLs

**Stateless firewall** at the subnet level:

```
Inbound:
Rule 100: Allow TCP 80 from 0.0.0.0/0
Rule 110: Allow TCP 443 from 0.0.0.0/0
Rule 120: Allow TCP 1024-65535 from 10.0.0.0/8 (ephemeral)
Rule 32767: Deny all (default)

Outbound:
Rule 100: Allow all
```

**Characteristics:**
- Stateless (must allow both directions)
- Applied to subnets
- Allow and deny rules
- Evaluated after security groups

## VPN Connectivity

### Site-to-Site VPN

Connect your on-premises network to AWS VPC:

```
On-Premises Network (192.168.0.0/16)
         ↓
   [VPN Connection]
         ↓
         ↓ Encrypted tunnel
         ↓
   [Virtual Private Gateway]
         ↓
   AWS VPC (10.0.0.0/16)
```

**Configuration:**

```hcl
# Terraform

resource "aws_vpn_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "vpn-gw" }
}

resource "aws_customer_gateway" "main" {
  bgp_asn    = 65000
  public_ip  = "203.0.113.1"
  type       = "ipsec.1"
  tags = { Name = "customer-gw" }
}

resource "aws_vpn_connection" "main" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.main.id
  type                = "ipsec.1"
  static_routes_only  = true
}

resource "aws_vpn_connection_route" "main" {
  destination_cidr_block  = "192.168.0.0/16"
  vpn_connection_id       = aws_vpn_connection.main.id
  depends_on              = [aws_vpn_connection.main]
}
```

### Client VPN

Provide remote access for employees:

```
Remote Employee
   ↓
[OpenVPN Client]
   ↓
[Encrypted tunnel to AWS]
   ↓
[AWS Client VPN Endpoint]
   ↓
[Access to private resources]
```

## VPC Peering

Connect multiple VPCs:

```
VPC-A (10.0.0.0/16)  ←→  VPC-B (10.1.0.0/16)
(Production)              (Development)
         ↓                        ↓
   [EC2 Instances]          [EC2 Instances]
```

**Peering Configuration:**

```hcl
# Create peering connection
resource "aws_vpc_peering_connection" "main" {
  vpc_id      = aws_vpc.prod.id
  peer_vpc_id = aws_vpc.dev.id

  tags = { Name = "prod-dev-peering" }
}

# Accept peering
resource "aws_vpc_peering_connection_accepter" "main" {
  vpc_peering_connection_id = aws_vpc_peering_connection.main.id
  auto_accept              = true
}

# Update route tables
resource "aws_route" "prod_to_dev" {
  route_table_id            = aws_route_table.prod.id
  destination_cidr_block    = "10.1.0.0/16"
  vpc_peering_connection_id = aws_vpc_peering_connection.main.id
}
```

## AWS PrivateLink

Expose services privately between VPCs without internet exposure:

```
VPC-A (Consumer)
   ↓
[VPC Endpoint (Interface)]
   ↓
[PrivateLink Connection]
   ↓
[Network Load Balancer]
   ↓
VPC-B (Producer Service)
```

## Flow Logs and Monitoring

### VPC Flow Logs

Capture network traffic metadata:

```hcl
resource "aws_flow_log" "main" {
  iam_role_arn    = aws_iam_role.flow_logs.arn
  log_destination = aws_cloudwatch_log_group.flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id

  tags = { Name = "vpc-flow-logs" }
}
```

**Log Analysis:**

```bash
# Identify rejected packets
aws logs filter-log-events \
  --log-group-name vpc-flow-logs \
  --filter-pattern "[version, account_id, interface_id, srcaddr, dstaddr, srcport, dstport, protocol, packets, bytes, windowstart, windowend, action=\"REJECT\", flowlogstatus]"

# Identify connections to unusual ports
aws logs filter-log-events \
  --log-group-name vpc-flow-logs \
  --filter-pattern "[version, account_id, interface_id, srcaddr, dstaddr, srcport, dstport > 32000, protocol, packets, bytes, windowstart, windowend, action, flowlogstatus]"
```

## Network Performance

### Placement Groups

Cluster instances for low-latency communication:

```hcl
resource "aws_placement_group" "cluster" {
  name     = "ml-training-cluster"
  strategy = "cluster"
}

resource "aws_instance" "training" {
  count              = 8
  ami                = data.aws_ami.deep_learning.id
  instance_type      = "p3.8xlarge"
  placement_group    = aws_placement_group.cluster.name
}
```

### Enhanced Networking

Enable SR-IOV for 10+ Gbps throughput:

```hcl
resource "aws_instance" "high_bandwidth" {
  ami                      = data.aws_ami.latest.id
  instance_type            = "m5.24xlarge"
  associate_public_ip_address = false

  network_interface {
    device_index         = 0
    network_interface_id = aws_network_interface.main.id
  }
}

resource "aws_network_interface" "main" {
  subnet_id       = aws_subnet.private.id
  security_groups = [aws_security_group.app.id]
}
```

## Compliance and Security

### Network Segmentation

Separate by function and security level:

```
Public Tier:       Web servers, ALB, NAT Gateway
Trusted Tier:      Application servers
Database Tier:     RDS, managed databases
Secure Tier:       Vault, secrets management
```

### Least Privilege Access

```hcl
# Security Group: Web tier
resource "aws_security_group" "web" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
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

## Related U-Cloud 24 Services

- **[VPS & Cloud Servers](/services/server)** - Deploy enterprise infrastructure with network isolation
- **[DevOps & Infrastructure](/services/devops)** - Design and manage complex network architectures
- **[Data Analytics & ML](/services/analytics)** - Secure networks for data pipeline isolation
- **[API Integration](/services/integration)** - Connect services securely across networks

**Related articles:** [Secret Management](/blog/vault-secrets) | [Infrastructure with Terraform](/blog/terraform-iac)
