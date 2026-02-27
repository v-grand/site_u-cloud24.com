# Wazuh: SIEM en cloud-infrastructuurbeveiliging

## Inleiding

In het tijdperk van cloudcomputing is infrastructuurbeveiliging van cruciaal belang. **Wazuh** is een open-source SIEM (Security Information and Event Management) oplossing die zichtbaarheid en controle over uw cloud-infrastructuur biedt.

Dit artikel behandelt:
- Wazuh implementeren in de cloud
- Agenten configureren voor servermonitoring
- Bedreigingen opsporen en erop reageren
- Incidentbeheer automatiseren

## Waarom Wazuh?

### Belangrijkste voordelen:
- **Open Source** — volledige transparantie en controle
- **Schaalbaarheid** — ondersteunt 10K+ knooppunten
- **Multi-cloud** — AWS, Azure, GCP
- **Real-time waarschuwingen** — directe bedreigingsmeldingen
- **Compliance** — GDPR, HIPAA, PCI-DSS, SOC2

### Kerncomponenten:
1. **Wazuh Manager** — centrale beheerserver
2. **Wazuh Agents** — gegevensverzameling op hosts
3. **Elasticsearch** — gebeurtenisopslag
4. **Kibana** — visualisatie en analyse

## Wazuh-architectuur

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

## Wazuh Manager in cloud installeren (AWS)

### 1. EC2-instantie starten

```bash
# Start Ubuntu 20.04 met minimaal 4GB RAM, 20GB schijf
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.large \
  --security-groups wazuh-sg \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=wazuh-manager}]'
```

### 2. Wazuh Manager installeren

```bash
# Verbind met instantie en voer uit:
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -
echo "deb https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-manager

# Start service
systemctl start wazuh-manager
systemctl enable wazuh-manager
```

### 3. Elasticsearch en Kibana installeren

```bash
# Voeg Elastic-opslagplaats toe
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" > /etc/apt/sources.list.d/elastic-7.x.list

# Installeren
apt-get install elasticsearch kibana

# Configureer Elasticsearch (elasticsearch.yml):
cluster.name: wazuh-cluster
node.name: wazuh-node-1
network.host: 0.0.0.0
discovery.type: single-node

# Start services
systemctl start elasticsearch
systemctl start kibana
```

## Agenten op hosts implementeren

### Op Linux-hosts:

```bash
# Voeg repository toe en installeer agent
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -
echo "deb https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-agent

# Bewerk config (/etc/ossec/ossec.conf):
<client>
  <server>
    <address>WAZUH_MANAGER_IP</address>
    <port>1514</port>
    <protocol>tcp</protocol>
  </server>
</client>

# Start agent
systemctl start wazuh-agent
systemctl enable wazuh-agent
```

### Op Windows-hosts:

```powershell
# Download installatieprogramma
Invoke-WebRequest -Uri "https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.0-1.msi" -OutFile "wazuh-agent.msi"

# Installeer met manager-IP
msiexec.exe /i wazuh-agent.msi /q WAZUH_MANAGER_IP="MANAGER_IP" WAZUH_AGENT_NAME="HOSTNAME"

# Start service
Start-Service WazuhSvc
```

## Monitoringconfiguratie

### 1. Monitoring van bestandsintegriteit (FIM)

```xml
<ossec_config>
  <syscheck>
    <directories check_all="yes">/etc,/usr/local</directories>
    <directories check_all="yes" realtime="yes">/var/www</directories>
    <frequency>43200</frequency>
  </syscheck>
</ossec_config>
```

### 2. Logmonitoring

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

### 3. Kwetsbaarheidsdetectie

```xml
<ossec_config>
  <vulnerability-detection>
    <enabled>yes</enabled>
    <index-status>enabled</index-status>
  </vulnerability-detection>
</ossec_config>
```

## Bedreigingsdetectie

### Ingebouwde regels

Wazuh wordt geleverd met duizenden regels voor detectie:
- Brute-force-aanvallen (SSH, RDP)
- Web-aanvallen (SQLi, XSS)
- Malware-handtekeningen
- Beleidsschendingen
- Ongewoon gedrag

### Voorbeeldregel:

```xml
<rule id="5512" level="10">
  <if_matched_sid>5503</if_matched_sid>
  <frequency>4</frequency>
  <timeframe>120</timeframe>
  <description>SSH Brute Force Attack Detected</description>
  <group>attack,sshd,invalid_login</group>
</rule>
```

## Incidentbeheer

### Automatische acties

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

### Slack-integratie

```xml
<integration>
  <name>slack</name>
  <hook_url>https://hooks.slack.com/services/YOUR/WEBHOOK/URL</hook_url>
  <alert_format>json</alert_format>
  <rule_id>5511</rule_id>
</integration>
```

## Analyse in Kibana

### Nuttige dashboards:

1. **Security Events** — alle beveiligingsgebeurtenissen
2. **Threat Intel** — bekende bedreigingen
3. **Compliance** — compliancestatus
4. **Vulnerability** — kwetsbaarheden
5. **Integrity Monitoring** — bestandswijzigingen

## Best practices

### 1. Wazuh-beveiliging

```bash
# Gebruik SSL/TLS voor agentcommunicatie
openssl req -x509 -days 365 -nodes -newkey rsa:2048 \
  -keyout key.pem -out cert.pem

# Installeer certificaat op Manager
cp cert.pem /var/ossec/etc/ssl/certs/
cp key.pem /var/ossec/etc/ssl/private/
```

### 2. Schaling

- **Clustermodus** voor hoge beschikbaarheid
- **Meerdere managers** voor verschillende regio's
- **Logstash** voor filterbeurtenissen

### 3. Retentiebeleid

```bash
# Bewaar events 90 dagen
# /etc/elasticsearch/elasticsearch.yml
index.lifecycle.name: wazuh
index.lifecycle.rollover_alias: wazuh-events-*
```

## Casestudy: detectie van schending in productie

### Scenario:
Onbevoegde databasetoegang via gecompromiteerde toepassingsserver.

### Hoe Wazuh geholpen:

1. **Monitoring van bestandsintegriteit** detecteerde configuratiewijzigingen
2. **Loganalyse** onthulde verdachte SQL-query's
3. **Kwetsbaarheidsdetector** identificeerde kwetsbaarheid
4. **Automatische respons** blokkeerde IP-adres aanvaller
5. **Alert** verzonden naar Slack in <5 minuten

**Resultaat:** Incident opgespoord en geïsoleerd in 8 minuten in plaats van mogelijk dagen.

## Kosten en ROI

| Metriek | Waarde |
|---------|--------|
| Licentie | Gratis (Open Source) |
| Infrastructuur | ~$200/maand op AWS |
| Detectietijd | 5-10 minuten |
| Reactietijd | 2-5 minuten |
| Kostenbesparing (voorkomen van schending) | $100K+ |

## Conclusie

Wazuh is een krachtige en flexibele oplossing voor het bewaken van cloud-infrastructuurbeveiliging. Daarmee kunt u:

✅ Bedreigingen in real-time opsporen
✅ Automatisch op incidenten reageren
✅ Voldoen aan nalevingsvereisten
✅ Besparen op kostbare beveiligingsinbreuken

### Volgende stappen:

1. Implementeer Wazuh op uw infrastructuur
2. Configureer agenten op kritieke servers
3. Maak aangepaste regels voor uw omgeving
4. Integreer met Slack/PagerDuty voor waarschuwingen
5. Analyseer regelmatig ereignissen in Kibana

---

**Heeft u hulp nodig bij de implementatie van Wazuh?** Neem contact op met ons team van DevOps-experts. We helpen u een volledig beveiligingsmonitoingsysteem voor uw infrastructuur in te implementeren en te configureren.
