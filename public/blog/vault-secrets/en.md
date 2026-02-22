# Secret Management in the Cloud

## Introduction

Secrets are everywhere in modern applications: database passwords, API keys, OAuth tokens, SSH keys, TLS certificates. Managing these secrets securely is one of the most critical but often overlooked aspects of infrastructure security. Hardcoding secrets in configuration files or environment variables is a recipe for disaster.

HashiCorp Vault is an industry-leading secret management solution that provides centralized, encrypted storage for sensitive data with fine-grained access controls and detailed audit logs. In this guide, I'll show you how to implement a production-grade secret management system using Vault.

## The Secret Management Problem

### Traditional Approach (Bad)

```bash
# ❌ Hardcoded secrets
DATABASE_URL="postgres://admin:supersecret@db.example.com:5432/mydb"
API_KEY="sk_live_abc123def456"

# Problems:
# - Visible in source code/Git history
# - Exposed in process list
# - No rotation mechanism
# - No audit trail
# - Difficult to handle in different environments
```

### Why Vault?

**Centralized Management**: Store all secrets in one secure location

**Dynamic Secrets**: Generate credentials on-demand that automatically expire

**Encryption**: All data encrypted at rest and in transit

**Audit Logging**: Complete trail of who accessed what and when

**Access Control**: Fine-grained RBAC policies

**Secret Rotation**: Automatic rotation of credentials

## Vault Architecture

### Key Components

1. **Storage Backend**: Where secrets are stored (S3, Consul, etc.)
2. **Auth Methods**: How clients prove their identity (AppRole, Kubernetes, JWT)
3. **Secret Engines**: Plugins that generate secrets (Database, SSH, PKI, KV)
4. **Policies**: Define what each client can access
5. **Audit Backend**: Logs all requests

## Installing and Configuring Vault

### Installation

```bash
# Download Vault
wget https://releases.hashicorp.com/vault/1.15.0/vault_1.15.0_linux_amd64.zip
unzip vault_1.15.0_linux_amd64.zip
sudo mv vault /usr/local/bin/
```

### Basic Server Configuration

```hcl
# vault-config.hcl
storage "file" {
  path = "/opt/vault/data"
}

listener "tcp" {
  address       = "127.0.0.1:8200"
  tls_cert_file = "/opt/vault/tls/vault.crt"
  tls_key_file  = "/opt/vault/tls/vault.key"
}

ui = true
```

### Starting Vault

```bash
vault server -config=vault-config.hcl
```

### Initialization and Unsealing

```bash
# Initialize Vault (generates master keys)
vault operator init -key-shares=5 -key-threshold=3

# Unseal Vault (requires 3 of 5 keys)
vault operator unseal <key1>
vault operator unseal <key2>
vault operator unseal <key3>
```

## Secret Engines

### Key-Value Store

```bash
# Enable KV v2 engine
vault secrets enable -version=2 kv

# Store a secret
vault kv put kv/myapp/database \
  username="admin" \
  password="supersecret" \
  host="db.example.com"

# Retrieve secret
vault kv get kv/myapp/database

# Get specific field
vault kv get -field=password kv/myapp/database
```

### Database Engine

Generate dynamic database credentials that automatically expire:

```bash
# Configure database engine
vault secrets enable database

# Configure PostgreSQL connection
vault write database/config/mydb \
  plugin_name=postgresql-database-plugin \
  allowed_roles="readonly,fullaccess" \
  connection_url="postgresql://admin:password@db.example.com:5432/postgres"

# Define role with 24-hour TTL
vault write database/roles/myapp-readonly \
  db_name=mydb \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  default_ttl="1h" \
  max_ttl="24h"

# Generate temporary credentials
vault read database/creds/myapp-readonly
# Returns:
# username: v-kubernet-myapp-readon-abcd1234
# password: aAbBcCdDeEfFgGhHiIjJkKlMm
# ttl: 1h
```

### SSH Engine

Manage SSH key access:

```bash
# Enable SSH engine
vault secrets enable ssh

# Create SSH role
vault write ssh/roles/my-role \
  key_type=ca \
  ttl=30m \
  max_ttl=2h \
  allow_user_certificates=true \
  allowed_users="root,ubuntu,ec2-user"

# Sign user public key
vault write -field=signed_key ssh/sign/my-role \
  username=ubuntu \
  public_key=@$HOME/.ssh/id_rsa.pub \
  valid_principals=ubuntu > signed-cert.pub

# Use signed certificate
ssh -i signed-cert.pub -i ~/.ssh/id_rsa ubuntu@server.example.com
```

## Authentication Methods

### AppRole

Perfect for applications and machines:

```bash
# Enable AppRole auth
vault auth enable approle

# Create AppRole
vault write auth/approle/role/myapp \
  token_ttl=1h \
  token_max_ttl=4h \
  policies="myapp-policy"

# Get Role ID
vault read auth/approle/role/myapp/role-id

# Generate Secret ID
vault write -f auth/approle/role/myapp/secret-id

# Application authenticates with Role ID + Secret ID
curl --request POST \
  --data '{"role_id":"<role-id>","secret_id":"<secret-id>"}' \
  http://vault:8200/v1/auth/approle/login
```

### Kubernetes Auth

Automatic authentication for pods:

```bash
# Enable Kubernetes auth
vault auth enable kubernetes

# Configure with your cluster
vault write auth/kubernetes/config \
  token_reviewer_jwt=@/var/run/secrets/kubernetes.io/serviceaccount/token \
  kubernetes_host=https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

# Create role for specific namespace
vault write auth/kubernetes/role/myapp \
  bound_service_account_names=myapp \
  bound_service_account_namespaces=default \
  policies=myapp-policy \
  ttl=24h
```

## Access Control Policies

Define what each client can do:

```hcl
# myapp-policy.hcl
path "kv/data/myapp/*" {
  capabilities = ["read", "list"]
}

path "database/creds/myapp-readonly" {
  capabilities = ["read"]
}

path "secret/data/myapp/tls" {
  capabilities = ["read"]
}

# Deny access to other secrets
path "kv/data/admin/*" {
  capabilities = ["deny"]
}

# Audit endpoint (read-only)
path "sys/audit" {
  capabilities = ["read"]
}
```

### Writing Policies

```bash
# Write policy to Vault
vault policy write myapp-policy - << EOF
path "kv/data/myapp/*" {
  capabilities = ["read", "list"]
}
EOF

# List policies
vault policy list

# View policy
vault policy read myapp-policy
```

## Integration with Applications

### Python Example

```python
import hvac
import json

# Initialize client
client = hvac.Client(url='http://vault:8200')

# Authenticate with AppRole
response = client.auth.approle.login(
    role_id='<role-id>',
    secret_id='<secret-id>'
)
client.token = response['auth']['client_token']

# Read database credentials
secret = client.secrets.kv.v2.read_secret_version(path='myapp/database')
db_password = secret['data']['data']['password']

# Read KV secret
kv_secret = client.secrets.kv.v2.read_secret_version(path='myapp/api')
api_key = kv_secret['data']['data']['key']

# Use in database connection
import psycopg2
conn = psycopg2.connect(
    host=secret['data']['data']['host'],
    user=secret['data']['data']['username'],
    password=db_password,
    database='myapp'
)
```

### Environment Injection

```bash
# Fetch secret and export as environment variable
export DB_PASSWORD=$(vault kv get -field=password kv/myapp/database)

# Start application
python app.py
```

## Audit Logging

Enable and review audit logs:

```bash
# Enable file audit backend
vault audit enable file file_path=/var/log/vault-audit.log

# View audit logs
tail -f /var/log/vault-audit.log

# Example log entry:
# {
#   "time": "2024-02-22T10:30:00.123Z",
#   "type": "request",
#   "auth": {
#     "client_token": "s.abcdefghij1234567890",
#     "display_name": "myapp"
#   },
#   "request": {
#     "id": "...",
#     "operation": "read",
#     "path": "kv/data/myapp/database",
#     "client_token_accessor": "..."
#   },
#   "response": {
#     "auth": null,
#     "secret": null,
#     "data": {
#       "keys": ["password", "username", "host"]
#     }
#   }
# }
```

## Secret Rotation

Automatic credential rotation:

```bash
# Configure database role with rotation
vault write database/roles/myapp \
  db_name=mydb \
  creation_statements="..." \
  rotation_statements="ALTER USER \"{{name}}\" WITH PASSWORD '{{password}}';" \
  rotation_period="30d"

# Manually rotate
vault write -f database/rotate-root/mydb
```

## Best Practices

1. **Use Dynamic Secrets**: Generate credentials on-demand rather than storing static passwords
2. **Enable Audit Logging**: Monitor all secret access
3. **Rotate Credentials**: Implement automatic rotation for sensitive secrets
4. **Use Least Privilege**: Grant only necessary permissions in policies
5. **Encrypt Transit**: Always use TLS for Vault communication
6. **Backup Encryption Keys**: Store encryption keys in secure location
7. **Restrict Unseal Keys**: Distribute unseal keys to multiple people
8. **Monitor for Unauthorized Access**: Alert on policy violations

---

## Related U-Cloud 24 Services

- **[VPS & Cloud Servers](/services/server)** - Secure hosting for your Vault infrastructure
- **[DevOps & Infrastructure](/services/devops)** - Expert setup and management of secret systems
- **[Data Analytics & ML](/services/analytics)** - Secure credential management for ML pipelines
- **[Web App Development](/services/web)** - Integrate secret management into applications

**Related articles:** [Enterprise Networks](/blog/corporate-networks) | [Infrastructure with Terraform](/blog/terraform-iac)
