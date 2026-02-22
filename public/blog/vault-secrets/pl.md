# Zarządzanie tajemnicami w chmurze

## Wprowadzenie

Tajemnice są wszędzie w nowoczesnych aplikacjach: hasła bazy danych, klucze API, tokeny OAuth, klucze SSH, certyfikaty TLS. Bezpieczne zarządzanie tymi tajemnicami to jeden z najkrytyczniejszych, ale często ignorowanych aspektów bezpieczeństwa infrastruktury. Kodowanie tajemnic na stałe w plikach konfiguracji lub zmiennych środowiska to przepis na katastrofę.

HashiCorp Vault to wiodące rozwiązanie do zarządzania tajemnicami, zapewniające scentralizowane, szyfrowane przechowywanie poufnych danych z precyzyjnym kontrolą dostępu i szczegółowymi dziennikami audytu. W tym przewodniku pokażę ci, jak wdrożyć system zarządzania tajemnicami klasy produkcji przy użyciu Vault.

## Problem zarządzania tajemnicami

### Tradycyjne podejście (złe)

```bash
# ❌ Tajemnice zakodowane na stałe
DATABASE_URL="postgres://admin:supersecret@db.example.com:5432/mydb"
API_KEY="sk_live_abc123def456"

# Problemy:
# - Widoczne w kodzie źródłowym/historii Git
# - Widoczne na liście procesów
# - Brak mechanizmu rotacji
# - Brak śladu audytu
# - Trudne do zarządzania w różnych środowiskach
```

### Dlaczego Vault?

**Scentralizowane zarządzanie**: Przechowuj wszystkie tajemnice w jednym bezpiecznym miejscu

**Dynamiczne tajemnice**: Generuj credentials na żądanie, które automatycznie wygasają

**Szyfrowanie**: Wszystkie dane szyfrowane zarówno w spoczynku, jak i w tranzycie

**Logowanie audytu**: Pełna historia kto i kiedy uzyskał dostęp

**Kontrola dostępu**: Precyzyjne zarządzanie RBAC

**Rotacja tajemnic**: Automatyczna rotacja credentials

## Architektura Vault

### Kluczowe komponenty

1. **Storage Backend**: Gdzie przechowywane są tajemnice (S3, Consul itp.)
2. **Auth Methods**: Jak klienci udowadniają swoją tożsamość (AppRole, Kubernetes, JWT)
3. **Secret Engines**: Wtyczki do generowania tajemnic (Database, SSH, PKI, KV)
4. **Policies**: Definiują co każdy klient może robić
5. **Audit Backend**: Loguje wszystkie żądania

## Instalacja i konfiguracja Vault

### Instalacja

```bash
# Pobierz Vault
wget https://releases.hashicorp.com/vault/1.15.0/vault_1.15.0_linux_amd64.zip
unzip vault_1.15.0_linux_amd64.zip
sudo mv vault /usr/local/bin/
```

### Podstawowa konfiguracja serwera

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

### Uruchamianie Vault

```bash
vault server -config=vault-config.hcl
```

### Inicjalizacja i odblokowanie

```bash
# Zainicjuj Vault (generuje klucze główne)
vault operator init -key-shares=5 -key-threshold=3

# Odblokuj Vault (wymaga 3 z 5 kluczy)
vault operator unseal <key1>
vault operator unseal <key2>
vault operator unseal <key3>
```

## Secret Engines

### Key-Value Store

```bash
# Włącz KV v2 engine
vault secrets enable -version=2 kv

# Przechowuj tajemnicę
vault kv put kv/myapp/database \
  username="admin" \
  password="supersecret" \
  host="db.example.com"

# Pobierz tajemnicę
vault kv get kv/myapp/database

# Pobierz konkretne pole
vault kv get -field=password kv/myapp/database
```

### Database Engine

Generuj dynamiczne credentials bazy danych, które automatycznie wygasają:

```bash
# Skonfiguruj database engine
vault secrets enable database

# Skonfiguruj połączenie PostgreSQL
vault write database/config/mydb \
  plugin_name=postgresql-database-plugin \
  allowed_roles="readonly,fullaccess" \
  connection_url="postgresql://admin:password@db.example.com:5432/postgres"

# Zdefiniuj rolę z TTL 24 godziny
vault write database/roles/myapp-readonly \
  db_name=mydb \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}';" \
  default_ttl="1h" \
  max_ttl="24h"

# Generuj tymczasowe credentials
vault read database/creds/myapp-readonly
```

### SSH Engine

Zarządzaj dostępem SSH:

```bash
# Włącz SSH engine
vault secrets enable ssh

# Utwórz rolę SSH
vault write ssh/roles/my-role \
  key_type=ca \
  ttl=30m \
  max_ttl=2h \
  allow_user_certificates=true \
  allowed_users="root,ubuntu,ec2-user"

# Podpisz publiczny klucz użytkownika
vault write -field=signed_key ssh/sign/my-role \
  username=ubuntu \
  public_key=@$HOME/.ssh/id_rsa.pub > signed-cert.pub

# Użyj podpisanego certyfikatu
ssh -i signed-cert.pub -i ~/.ssh/id_rsa ubuntu@server.example.com
```

## Metody autentykacji

### AppRole

Idealne dla aplikacji i maszyn:

```bash
# Włącz AppRole auth
vault auth enable approle

# Utwórz AppRole
vault write auth/approle/role/myapp \
  token_ttl=1h \
  token_max_ttl=4h \
  policies="myapp-policy"

# Pobierz Role ID
vault read auth/approle/role/myapp/role-id

# Generuj Secret ID
vault write -f auth/approle/role/myapp/secret-id
```

### Kubernetes Auth

Automatyczna autentykacja dla podów:

```bash
# Włącz Kubernetes auth
vault auth enable kubernetes

# Skonfiguruj ze swoim klastrem
vault write auth/kubernetes/config \
  token_reviewer_jwt=@/var/run/secrets/kubernetes.io/serviceaccount/token \
  kubernetes_host=https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

# Utwórz rolę dla konkretnej przestrzeni nazw
vault write auth/kubernetes/role/myapp \
  bound_service_account_names=myapp \
  bound_service_account_namespaces=default \
  policies=myapp-policy \
  ttl=24h
```

## Polityki kontroli dostępu

Zdefiniuj co każdy klient może robić:

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
```

## Integracja z aplikacjami

### Przykład Python

```python
import hvac

# Zainicjuj klienta
client = hvac.Client(url='http://vault:8200')

# Uwierzytelnij się za pomocą AppRole
response = client.auth.approle.login(
    role_id='<role-id>',
    secret_id='<secret-id>'
)
client.token = response['auth']['client_token']

# Przeczytaj credentials bazy danych
secret = client.secrets.kv.v2.read_secret_version(path='myapp/database')
db_password = secret['data']['data']['password']

# Użyj w połączeniu do bazy danych
import psycopg2
conn = psycopg2.connect(
    host=secret['data']['data']['host'],
    user=secret['data']['data']['username'],
    password=db_password,
    database='myapp'
)
```

## Logowanie audytu

Włączaj i przeglądaj dzienniki audytu:

```bash
# Włącz file audit backend
vault audit enable file file_path=/var/log/vault-audit.log

# Przeglądaj dzienniki audytu
tail -f /var/log/vault-audit.log
```

## Najlepsze praktyki

1. **Używaj dynamicznych tajemnic**: Generuj credentials na żądanie
2. **Włącz logowanie audytu**: Monitoruj cały dostęp do tajemnic
3. **Rotacja credentials**: Wdróż automatyczną rotację
4. **Zasada najmniejszych przywilejów**: Udzielaj tylko niezbędnych uprawnień
5. **Szyfruj transmisję**: Zawsze używaj TLS dla Vault
6. **Zabezpiecz klucze szyfrowania**: Przechowuj je w bezpiecznym miejscu
7. **Ogranicz klucze Unseal**: Rozprowadź je między kilka osób
8. **Monitoruj nieautoryzowany dostęp**: Ustaw alerty na naruszenia polityki

---

## Powiązane usługi U-Cloud 24

- **[Serwery VPS i chmurowe](/services/server)** - Bezpieczne hostowanie infrastruktury Vault
- **[DevOps i infrastruktura](/services/devops)** - Eksperta konfiguracja i zarządzanie systemami tajemnic
- **[Analityka i ML](/services/analytics)** - Bezpieczne zarządzanie credentials dla potoków ML
- **[Tworzenie aplikacji web](/services/web)** - Integracja zarządzania tajemnicami w aplikacje

**Powiązane artykuły:** [Sieci przedsiębiorstwa](/blog/corporate-networks) | [Infrastruktura Terraform](/blog/terraform-iac)
