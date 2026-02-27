# Wazuh: SIEM i bezpieczeństwo infrastruktury chmury

## Wprowadzenie

W erze przetwarzania w chmurze bezpieczeństwo infrastruktury jest krytyczne. **Wazuh** to rozwiązanie SIEM (Security Information and Event Management) o otwartym kodzie źródłowym, które zapewnia widoczność i kontrolę nad infrastrukturą chmury.

Artykuł omawia:
- Wdrażanie Wazuh w chmurze
- Konfigurację agentów do monitorowania serwerów
- Wykrywanie i reagowanie na zagrożenia bezpieczeństwa
- Automatyzacja reagowania na incydenty

## Dlaczego Wazuh?

### Główne zalety:
- **Open Source** — pełna przezroczystość i kontrola
- **Skalowalność** — obsługuje 10K+ węzłów
- **Multi-cloud** — AWS, Azure, GCP
- **Alerty w czasie rzeczywistym** — natychmiastowe powiadomienia o zagrożeniach
- **Compliance** — GDPR, HIPAA, PCI-DSS, SOC2

### Główne komponenty:
1. **Wazuh Manager** — centralny serwer zarządzania
2. **Wazuh Agents** — zbieranie danych na hostach
3. **Elasticsearch** — magazyn zdarzeń
4. **Kibana** — wizualizacja i analiza

## Architektura Wazuh

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

## Instalacja Wazuh Manager w chmurze (AWS)

### 1. Uruchomienie instancji EC2

```bash
# Uruchom Ubuntu 20.04 z min. 4GB RAM, 20GB dysku
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.large \
  --security-groups wazuh-sg \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=wazuh-manager}]'
```

### 2. Instalacja Wazuh Manager

```bash
# Połącz się z instancją i uruchom:
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -
echo "deb https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-manager

# Uruchom serwis
systemctl start wazuh-manager
systemctl enable wazuh-manager
```

### 3. Instalacja Elasticsearch i Kibana

```bash
# Dodaj repozytorium Elastic
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" > /etc/apt/sources.list.d/elastic-7.x.list

# Zainstaluj
apt-get install elasticsearch kibana

# Skonfiguruj Elasticsearch (elasticsearch.yml):
cluster.name: wazuh-cluster
node.name: wazuh-node-1
network.host: 0.0.0.0
discovery.type: single-node

# Uruchom serwisy
systemctl start elasticsearch
systemctl start kibana
```

## Wdrażanie agentów na hostach

### Na hostach Linux:

```bash
# Dodaj repozytorium i zainstaluj agenta
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -
echo "deb https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-agent

# Edytuj konfigurację (/etc/ossec/ossec.conf):
<client>
  <server>
    <address>WAZUH_MANAGER_IP</address>
    <port>1514</port>
    <protocol>tcp</protocol>
  </server>
</client>

# Uruchom agenta
systemctl start wazuh-agent
systemctl enable wazuh-agent
```

### Na hostach Windows:

```powershell
# Pobierz instalator
Invoke-WebRequest -Uri "https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.0-1.msi" -OutFile "wazuh-agent.msi"

# Zainstaluj z adresem IP managera
msiexec.exe /i wazuh-agent.msi /q WAZUH_MANAGER_IP="MANAGER_IP" WAZUH_AGENT_NAME="HOSTNAME"

# Uruchom serwis
Start-Service WazuhSvc
```

## Konfiguracja monitorowania

### 1. Monitorowanie integralności plików (FIM)

```xml
<ossec_config>
  <syscheck>
    <directories check_all="yes">/etc,/usr/local</directories>
    <directories check_all="yes" realtime="yes">/var/www</directories>
    <frequency>43200</frequency>
  </syscheck>
</ossec_config>
```

### 2. Monitorowanie dzienników

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

### 3. Wykrywanie luk w zabezpieczeniach

```xml
<ossec_config>
  <vulnerability-detection>
    <enabled>yes</enabled>
    <index-status>enabled</index-status>
  </vulnerability-detection>
</ossec_config>
```

## Wykrywanie zagrożeń

### Wbudowane reguły

Wazuh zawiera tysiące reguł do wykrywania:
- Ataki brute force (SSH, RDP)
- Ataki webowe (SQLi, XSS)
- Sygnatury złośliwego oprogramowania
- Naruszenia polityk
- Anomalne zachowanie

### Przykład reguły:

```xml
<rule id="5512" level="10">
  <if_matched_sid>5503</if_matched_sid>
  <frequency>4</frequency>
  <timeframe>120</timeframe>
  <description>SSH Brute Force Attack Detected</description>
  <group>attack,sshd,invalid_login</group>
</rule>
```

## Reagowanie na incydenty

### Akcje automatyczne

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

### Integracja ze Slack

```xml
<integration>
  <name>slack</name>
  <hook_url>https://hooks.slack.com/services/YOUR/WEBHOOK/URL</hook_url>
  <alert_format>json</alert_format>
  <rule_id>5511</rule_id>
</integration>
```

## Analityka w Kibana

### Przydatne pulpity nawigacyjne:

1. **Security Events** — wszystkie zdarzenia bezpieczeństwa
2. **Threat Intel** — znane zagrożenia
3. **Compliance** — status zgodności
4. **Vulnerability** — luki w zabezpieczeniach
5. **Integrity Monitoring** — zmiany plików

## Najlepsze praktyki

### 1. Bezpieczeństwo Wazuh

```bash
# Używaj SSL/TLS do komunikacji agentów
openssl req -x509 -days 365 -nodes -newkey rsa:2048 \
  -keyout key.pem -out cert.pem

# Zainstaluj certyfikat na Managerze
cp cert.pem /var/ossec/etc/ssl/certs/
cp key.pem /var/ossec/etc/ssl/private/
```

### 2. Skalowanie

- **Tryb klastra** dla wysokiej dostępności
- **Wielu Managerów** dla różnych regionów
- **Logstash** do filtrowania zdarzeń

### 3. Polityka przechowywania

```bash
# Przechowuj zdarzenia przez 90 dni
# /etc/elasticsearch/elasticsearch.yml
index.lifecycle.name: wazuh
index.lifecycle.rollover_alias: wazuh-events-*
```

## Studium przypadku: Wykrycie naruszenia w produkcji

### Scenariusz:
Nieautoryzowany dostęp do bazy danych przez skompromitowany serwer aplikacji.

### Jak Wazuh pomógł:

1. **Monitorowanie integralności plików** wykryło zmiany w plikach konfiguracji
2. **Analiza dzienników** ujawniła podejrzane zapytania SQL
3. **Detektor luk** zidentyfikował lukę w aplikacji
4. **Automatyczne reagowanie** zablokowało IP atakującego
5. **Alert** wysłany do Slack w <5 minut

**Wynik:** Incydent wykryty i izolowany w 8 minut zamiast potencjalnych dni.

## Koszty i zwrot z inwestycji

| Metryka | Wartość |
|---------|---------|
| Licencja | Bezpłatna (Open Source) |
| Infrastruktura | ~$200/miesiąc na AWS |
| Czas wykrycia | 5-10 minut |
| Czas reagowania | 2-5 minut |
| Oszczędności kosztów (zapobieganie naruszeniom) | $100K+ |

## Podsumowanie

Wazuh to potężne i elastyczne rozwiązanie do monitorowania bezpieczeństwa infrastruktury chmury. Dzięki niemu możesz:

✅ Wykrywać zagrożenia w czasie rzeczywistym
✅ Automatycznie reagować na incydenty
✅ Spełniać wymogi zgodności
✅ Zaoszczędzić na kosztownych naruszeniach bezpieczeństwa

### Następne kroki:

1. Wdróż Wazuh w swojej infrastrukturze
2. Skonfiguruj agentów na krytycznych serwerach
3. Utwórz niestandardowe reguły dla swojego środowiska
4. Zintegruj ze Slack/PagerDuty dla alertów
5. Regularnie analizuj zdarzenia w Kibana

---

**Potrzebujesz pomocy z wdrożeniem Wazuh?** Skontaktuj się z naszym zespołem ekspertów DevOps. Pomożemy wdrożyć i skonfigurować kompletny system monitorowania bezpieczeństwa infrastruktury.
