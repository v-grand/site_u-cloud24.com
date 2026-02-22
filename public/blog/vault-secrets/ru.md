# Управление секретами в облаке

## Введение

Секреты везде в современных приложениях: пароли базы данных, API ключи, OAuth токены, SSH ключи, TLS сертификаты. Безопасное управление этими секретами - один из самых критических, но часто игнорируемых аспектов безопасности инфраструктуры. Жестко кодировать секреты в файлы конфигурации или переменные окружения - это рецепт катастрофы.

HashiCorp Vault - это ведущее решение для управления секретами, обеспечивающее централизованное, зашифрованное хранилище конфиденциальных данных с детальным контролем доступа и подробными журналами аудита. В этом руководстве я покажу вам, как реализовать систему управления секретами production-grade с помощью Vault.

## Проблема управления секретами

### Традиционный подход (плохо)

```bash
# ❌ Жестко закодированные секреты
DATABASE_URL="postgres://admin:supersecret@db.example.com:5432/mydb"
API_KEY="sk_live_abc123def456"

# Проблемы:
# - Видны в исходном коде/истории Git
# - Видны в списке процессов
# - Нет механизма ротации
# - Нет журнала аудита
# - Сложно управлять в разных окружениях
```

### Почему Vault?

**Централизованное управление**: Храните все секреты в одном безопасном месте

**Динамические секреты**: Генерируйте credentials по требованию, которые автоматически истекают

**Шифрование**: Все данные зашифрованы в покое и при передаче

**Логирование аудита**: Полная история того, кто и когда получал доступ

**Контроль доступа**: Детальное RBAC управление

**Ротация секретов**: Автоматическая ротация credentials

## Архитектура Vault

### Ключевые компоненты

1. **Storage Backend**: Где хранятся секреты (S3, Consul и т.д.)
2. **Auth Methods**: Как клиенты доказывают свою личность (AppRole, Kubernetes, JWT)
3. **Secret Engines**: Плагины для генерации секретов (Database, SSH, PKI, KV)
4. **Policies**: Определяют, к чему может получить доступ каждый клиент
5. **Audit Backend**: Логирует все запросы

## Установка и конфигурация Vault

### Установка

```bash
# Загрузите Vault
wget https://releases.hashicorp.com/vault/1.15.0/vault_1.15.0_linux_amd64.zip
unzip vault_1.15.0_linux_amd64.zip
sudo mv vault /usr/local/bin/
```

### Базовая конфигурация сервера

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

### Запуск Vault

```bash
vault server -config=vault-config.hcl
```

### Инициализация и разблокировка

```bash
# Инициализируйте Vault (генерирует master ключи)
vault operator init -key-shares=5 -key-threshold=3

# Разблокируйте Vault (требует 3 из 5 ключей)
vault operator unseal <key1>
vault operator unseal <key2>
vault operator unseal <key3>
```

## Secret Engines

### Key-Value Store

```bash
# Включите KV v2 engine
vault secrets enable -version=2 kv

# Сохраните секрет
vault kv put kv/myapp/database \
  username="admin" \
  password="supersecret" \
  host="db.example.com"

# Получите секрет
vault kv get kv/myapp/database

# Получите конкретное поле
vault kv get -field=password kv/myapp/database
```

### Database Engine

Генерируйте динамические credentials для базы данных, которые автоматически истекают:

```bash
# Конфигурируйте database engine
vault secrets enable database

# Конфигурируйте PostgreSQL подключение
vault write database/config/mydb \
  plugin_name=postgresql-database-plugin \
  allowed_roles="readonly,fullaccess" \
  connection_url="postgresql://admin:password@db.example.com:5432/postgres"

# Определите роль с TTL 24 часа
vault write database/roles/myapp-readonly \
  db_name=mydb \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';" \
  default_ttl="1h" \
  max_ttl="24h"

# Генерируйте временные credentials
vault read database/creds/myapp-readonly
```

### SSH Engine

Управляйте доступом по SSH:

```bash
# Включите SSH engine
vault secrets enable ssh

# Создайте SSH роль
vault write ssh/roles/my-role \
  key_type=ca \
  ttl=30m \
  max_ttl=2h \
  allow_user_certificates=true \
  allowed_users="root,ubuntu,ec2-user"

# Подпишите публичный ключ пользователя
vault write -field=signed_key ssh/sign/my-role \
  username=ubuntu \
  public_key=@$HOME/.ssh/id_rsa.pub > signed-cert.pub

# Используйте подписанный сертификат
ssh -i signed-cert.pub -i ~/.ssh/id_rsa ubuntu@server.example.com
```

## Методы аутентификации

### AppRole

Идеально подходит для приложений и машин:

```bash
# Включите AppRole auth
vault auth enable approle

# Создайте AppRole
vault write auth/approle/role/myapp \
  token_ttl=1h \
  token_max_ttl=4h \
  policies="myapp-policy"

# Получите Role ID
vault read auth/approle/role/myapp/role-id

# Генерируйте Secret ID
vault write -f auth/approle/role/myapp/secret-id
```

### Kubernetes Auth

Автоматическая аутентификация для подов:

```bash
# Включите Kubernetes auth
vault auth enable kubernetes

# Конфигурируйте с вашим кластером
vault write auth/kubernetes/config \
  token_reviewer_jwt=@/var/run/secrets/kubernetes.io/serviceaccount/token \
  kubernetes_host=https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

# Создайте роль для конкретного namespace
vault write auth/kubernetes/role/myapp \
  bound_service_account_names=myapp \
  bound_service_account_namespaces=default \
  policies=myapp-policy \
  ttl=24h
```

## Политики контроля доступа

Определите, что может делать каждый клиент:

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

## Интеграция с приложениями

### Пример на Python

```python
import hvac

# Инициализируйте клиент
client = hvac.Client(url='http://vault:8200')

# Аутентифицируйтесь с помощью AppRole
response = client.auth.approle.login(
    role_id='<role-id>',
    secret_id='<secret-id>'
)
client.token = response['auth']['client_token']

# Прочитайте credentials базы данных
secret = client.secrets.kv.v2.read_secret_version(path='myapp/database')
db_password = secret['data']['data']['password']

# Используйте в подключении к базе данных
import psycopg2
conn = psycopg2.connect(
    host=secret['data']['data']['host'],
    user=secret['data']['data']['username'],
    password=db_password,
    database='myapp'
)
```

## Логирование аудита

Включайте и просматривайте журналы аудита:

```bash
# Включите file audit backend
vault audit enable file file_path=/var/log/vault-audit.log

# Просматривайте журналы аудита
tail -f /var/log/vault-audit.log
```

## Лучшие практики

1. **Используйте динамические секреты**: Генерируйте credentials по требованию
2. **Включайте логирование аудита**: Мониторьте весь доступ к секретам
3. **Ротируйте credentials**: Внедрите автоматическую ротацию
4. **Принцип минимальных привилегий**: Выдавайте только необходимые разрешения
5. **Шифруйте передачу**: Всегда используйте TLS для Vault
6. **Резервируйте ключи шифрования**: Храните их в безопасном месте
7. **Ограничьте Unseal ключи**: Распределите их между несколькими людьми
8. **Мониторьте несанкционированный доступ**: Настройте оповещения о нарушениях политики

---

## Связанные услуги U-Cloud 24

- **[VPS и облачные серверы](/services/server)** - Безопасное размещение инфраструктуры Vault
- **[DevOps и инфраструктура](/services/devops)** - Экспертная настройка и управление системами секретов
- **[Аналитика и ML](/services/analytics)** - Безопасное управление credentials для ML конвейеров
- **[Веб-разработка](/services/web)** - Интеграция управления секретами в приложения

**Связанные статьи:** [Корпоративные сети](/blog/corporate-networks) | [Инфраструктура с Terraform](/blog/terraform-iac)
