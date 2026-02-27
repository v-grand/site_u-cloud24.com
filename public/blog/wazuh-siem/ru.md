# Wazuh: SIEM и безопасность облачной инфраструктуры

## Введение

В эпоху облачных вычислений безопасность инфраструктуры становится критически важной. **Wazuh** — это открытое решение для SIEM (Security Information and Event Management) и обнаружения угроз, которое обеспечивает видимость и контроль над вашей облачной инфраструктурой.

Статья расскажет, как:
- Развернуть Wazuh в облаке
- Настроить агентов для мониторинга серверов
- Обнаруживать и реагировать на безопасности угрозы
- Автоматизировать реагирование на инциденты

## Почему Wazuh?

### Основные преимущества:
- **Открытый исходный код** — полная прозрачность и контроль
- **Масштабируемость** — обрабатывает 10K+ узлов
- **Multi-cloud** — AWS, Azure, GCP
- **Real-time alerting** — оповещения в реальном времени
- **Compliance** — GDPR, HIPAA, PCI-DSS, SOC2

### Основные компоненты:
1. **Wazuh Manager** — центральный сервер управления
2. **Wazuh Agents** — агенты на хостах для сбора данных
3. **Elasticsearch** — хранилище событий
4. **Kibana** — визуализация и анализ

## Архитектура Wazuh

```
┌─────────────────────────────────────────────────┐
│         Wazuh Manager (Central)                 │
│  - Event Processing                             │
│  - Alert Generation                             │
│  - Agent Management                             │
└──────────┬──────────────────────────────────────┘
           │
     ┌─────┼─────┐
     │     │     │
  ┌──▼──┐ │  ┌──▼──┐
  │Agent│ │  │Agent│
  │AWS  │ │  │Azure│
  └─────┘ │  └─────┘
          │
      ┌───▼────┐
      │Elasticsearch
      │+ Kibana
      └────────┘
```

## Установка Wazuh Manager в облаке (AWS)

### 1. Запуск EC2 инстанса

```bash
# Запустить Ubuntu 20.04 с минимум 4GB RAM, 20GB диска
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.large \
  --security-groups wazuh-sg \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=wazuh-manager}]'
```

### 2. Установка Wazuh Manager

```bash
# Подключитесь к инстансу и выполните:
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -
echo "deb https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-manager

# Запустить сервис
systemctl start wazuh-manager
systemctl enable wazuh-manager
```

### 3. Установка Elasticsearch и Kibana

```bash
# Добавить репозиторий Elastic
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" > /etc/apt/sources.list.d/elastic-7.x.list

# Установить
apt-get install elasticsearch kibana

# Конфигурация Elasticsearch (elasticsearch.yml):
cluster.name: wazuh-cluster
node.name: wazuh-node-1
network.host: 0.0.0.0
discovery.type: single-node

# Запустить
systemctl start elasticsearch
systemctl start kibana
```

## Развертывание агентов на хостах

### На Linux хостах:

```bash
# Добавить репозиторий и установить агент
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -
echo "deb https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-agent

# Отредактировать конфиг (/etc/ossec/ossec.conf):
<client>
  <server>
    <address>WAZUH_MANAGER_IP</address>
    <port>1514</port>
    <protocol>tcp</protocol>
  </server>
</client>

# Запустить агент
systemctl start wazuh-agent
systemctl enable wazuh-agent
```

### На Windows хостах:

```powershell
# Скачать инсталлер
Invoke-WebRequest -Uri "https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.0-1.msi" -OutFile "wazuh-agent.msi"

# Установить с параметром WAZUH_MANAGER_IP
msiexec.exe /i wazuh-agent.msi /q WAZUH_MANAGER_IP="MANAGER_IP" WAZUH_AGENT_NAME="HOSTNAME"

# Запустить сервис
Start-Service WazuhSvc
```

## Конфигурация мониторинга

### 1. Мониторинг файлов (FIM - File Integrity Monitoring)

```xml
<ossec_config>
  <syscheck>
    <directories check_all="yes">/etc,/usr/local</directories>
    <directories check_all="yes" realtime="yes">/var/www</directories>
    <frequency>43200</frequency>
  </syscheck>
</ossec_config>
```

### 2. Мониторинг логов

```xml
<ossec_config>
  <localfile>
    <log_format>syslog</log_format>
    <location>/var/log/auth.log</location>
  </localfile>
  <localfile>
    <log_format>json</log_format>
    <location>/var/log/application.json</location>
  </localfile>
</ossec_config>
```

### 3. Мониторинг уязвимостей

```xml
<ossec_config>
  <vulnerability-detection>
    <enabled>yes</enabled>
    <index-status>enabled</index-status>
  </vulnerability-detection>
</ossec_config>
```

## Обнаружение угроз

### Встроенные правила

Wazuh поставляется с тысячами правил для обнаружения:
- Brute force атаки (SSH, RDP)
- Web атаки (SQLi, XSS)
- Malware сигнатуры
- Нарушения политик
- Аномальное поведение

### Пример правила:

```xml
<rule id="5512" level="10">
  <if_matched_sid>5503</if_matched_sid>
  <frequency>4</frequency>
  <timeframe>120</timeframe>
  <description>SSH Brute Force Attack Detected</description>
  <group>attack,sshd,invalid_login</group>
</rule>
```

## Реагирование на инциденты

### Автоматические ответы

```xml
<ossec_config>
  <active-response>
    <command>firewall-drop</command>
    <location>all</location>
    <rules_id>31151,31152</rules_id>
    <timeout>600</timeout>
  </active-response>
</ossec_config>
```

### Интеграция с Slack

```xml
<integration>
  <name>slack</name>
  <hook_url>https://hooks.slack.com/services/YOUR/WEBHOOK/URL</hook_url>
  <alert_format>json</alert_format>
  <rule_id>5511</rule_id>
</integration>
```

## Аналитика в Kibana

### Полезные Dashboard'ы:

1. **Security Events** — все события безопасности
2. **Threat Intel** — известные угрозы
3. **Compliance** — соответствие стандартам
4. **Vulnerability** — уязвимости
5. **Integrity Monitoring** — изменения файлов

## Лучшие практики

### 1. Безопасность Wazuh

```bash
# Использовать SSL/TLS для агентов
openssl req -x509 -days 365 -nodes -newkey rsa:2048 \
  -keyout key.pem -out cert.pem

# Установить сертификат на Manager
cp cert.pem /var/ossec/etc/ssl/certs/
cp key.pem /var/ossec/etc/ssl/private/
```

### 2. Масштабирование

- **Cluster mode** для высокой доступности
- **Multiple Managers** для разных регионов
- **Logstash** для фильтрации событий

### 3. Retention политика

```bash
# Хранить события 90 дней
# /etc/elasticsearch/elasticsearch.yml
index.lifecycle.name: wazuh
index.lifecycle.rollover_alias: wazuh-events-*
```

## Кейс: Обнаружение breach в production

### Сценарий:
Неauthorized доступ к базе данных через компромированный сервер приложений.

### Как Wazuh помог:

1. **File Integrity Monitoring** обнаружила изменение конфиг файлов
2. **Log analysis** показала странные SQL запросы
3. **Vulnerability detector** указал на уязвимость в приложении
4. **Active Response** автоматически заблокировала IP злоумышленника
5. **Alert** отправлена в Slack за <5 минут

**Результат:** Инцидент обнаружен и изолирован за 8 минут вместо потенциальных дней.

## Затраты и ROI

| Метрика | Значение |
|---------|----------|
| Лицензия | Бесплатно (Open Source) |
| Infrastructure | ~$200/месяц на AWS |
| Time to Detect | 5-10 минут |
| Time to Respond | 2-5 минут |
| Cost Savings (prevented breach) | $100K+ |

## Заключение

Wazuh — это мощное и гибкое решение для мониторинга безопасности облачной инфраструктуры. С его помощью вы можете:

✅ Обнаруживать угрозы в реальном времени
✅ Автоматически реагировать на инциденты
✅ Соответствовать требованиям compliance
✅ Экономить на дорогостоящих инцидентах

### Следующие шаги:

1. Развернуть Wazuh на своей инфраструктуре
2. Настроить агентов на критических серверах
3. Создать custom правила для своего окружения
4. Интегрировать с Slack/PagerDuty для алертов
5. Регулярно анализировать события в Kibana

---

**Нужна помощь с внедрением Wazuh?** Свяжитесь с нашей командой DevOps экспертов. Мы поможем развернуть и настроить полную систему мониторинга безопасности для вашей инфраструктуры.
