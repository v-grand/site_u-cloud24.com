# Wazuh: SIEM and Cloud Infrastructure Security

## Introduction

In the era of cloud computing, infrastructure security is critical. **Wazuh** is an open-source SIEM (Security Information and Event Management) solution that provides visibility and control over your cloud infrastructure.

This article covers:
- Deploying Wazuh in the cloud
- Configuring agents for server monitoring
- Detecting and responding to security threats
- Automating incident response

## Why Wazuh?

### Key Advantages:
- **Open Source** — full transparency and control
- **Scalability** — handles 10K+ nodes
- **Multi-cloud** — AWS, Azure, GCP
- **Real-time alerting** — immediate threat notifications
- **Compliance** — GDPR, HIPAA, PCI-DSS, SOC2

### Core Components:
1. **Wazuh Manager** — central management server
2. **Wazuh Agents** — data collection on hosts
3. **Elasticsearch** — event storage
4. **Kibana** — visualization and analysis

## Wazuh Architecture

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

## Installing Wazuh Manager in Cloud (AWS)

### 1. Launch EC2 Instance

```bash
# Launch Ubuntu 20.04 with min 4GB RAM, 20GB disk
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.large \
  --security-groups wazuh-sg \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=wazuh-manager}]'
```

### 2. Install Wazuh Manager

```bash
# Connect to instance and run:
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -
echo "deb https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-manager

# Start service
systemctl start wazuh-manager
systemctl enable wazuh-manager
```

### 3. Install Elasticsearch and Kibana

```bash
# Add Elastic repository
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" > /etc/apt/sources.list.d/elastic-7.x.list

# Install
apt-get install elasticsearch kibana

# Configure Elasticsearch (elasticsearch.yml):
cluster.name: wazuh-cluster
node.name: wazuh-node-1
network.host: 0.0.0.0
discovery.type: single-node

# Start services
systemctl start elasticsearch
systemctl start kibana
```

## Deploying Agents on Hosts

### On Linux Hosts:

```bash
# Add repository and install agent
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -
echo "deb https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-agent

# Edit config (/etc/ossec/ossec.conf):
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

### On Windows Hosts:

```powershell
# Download installer
Invoke-WebRequest -Uri "https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.0-1.msi" -OutFile "wazuh-agent.msi"

# Install with manager IP
msiexec.exe /i wazuh-agent.msi /q WAZUH_MANAGER_IP="MANAGER_IP" WAZUH_AGENT_NAME="HOSTNAME"

# Start service
Start-Service WazuhSvc
```

## Monitoring Configuration

### 1. File Integrity Monitoring (FIM)

```xml
<ossec_config>
  <syscheck>
    <directories check_all="yes">/etc,/usr/local</directories>
    <directories check_all="yes" realtime="yes">/var/www</directories>
    <frequency>43200</frequency>
  </syscheck>
</ossec_config>
```

### 2. Log Monitoring

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

### 3. Vulnerability Detection

```xml
<ossec_config>
  <vulnerability-detection>
    <enabled>yes</enabled>
    <index-status>enabled</index-status>
  </vulnerability-detection>
</ossec_config>
```

## Threat Detection

### Built-in Rules

Wazuh comes with thousands of rules for detecting:
- Brute force attacks (SSH, RDP)
- Web attacks (SQLi, XSS)
- Malware signatures
- Policy violations
- Anomalous behavior

### Example Rule:

```xml
<rule id="5512" level="10">
  <if_matched_sid>5503</if_matched_sid>
  <frequency>4</frequency>
  <timeframe>120</timeframe>
  <description>SSH Brute Force Attack Detected</description>
  <group>attack,sshd,invalid_login</group>
</rule>
```

## Incident Response

### Automated Actions

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

### Slack Integration

```xml
<integration>
  <name>slack</name>
  <hook_url>https://hooks.slack.com/services/YOUR/WEBHOOK/URL</hook_url>
  <alert_format>json</alert_format>
  <rule_id>5511</rule_id>
</integration>
```

## Analytics in Kibana

### Useful Dashboards:

1. **Security Events** — all security events
2. **Threat Intel** — known threats
3. **Compliance** — compliance status
4. **Vulnerability** — vulnerabilities
5. **Integrity Monitoring** — file changes

## Best Practices

### 1. Wazuh Security

```bash
# Use SSL/TLS for agent communication
openssl req -x509 -days 365 -nodes -newkey rsa:2048 \
  -keyout key.pem -out cert.pem

# Install certificate on Manager
cp cert.pem /var/ossec/etc/ssl/certs/
cp key.pem /var/ossec/etc/ssl/private/
```

### 2. Scaling

- **Cluster mode** for high availability
- **Multiple Managers** for different regions
- **Logstash** for event filtering

### 3. Retention Policy

```bash
# Keep events for 90 days
# /etc/elasticsearch/elasticsearch.yml
index.lifecycle.name: wazuh
index.lifecycle.rollover_alias: wazuh-events-*
```

## Case Study: Production Breach Detection

### Scenario:
Unauthorized database access through compromised application server.

### How Wazuh Helped:

1. **File Integrity Monitoring** detected configuration changes
2. **Log analysis** revealed suspicious SQL queries
3. **Vulnerability detector** identified vulnerability
4. **Active Response** automatically blocked attacker IP
5. **Alert** sent to Slack in <5 minutes

**Result:** Incident detected and isolated in 8 minutes instead of potentially days.

## Costs and ROI

| Metric | Value |
|--------|-------|
| License | Free (Open Source) |
| Infrastructure | ~$200/month on AWS |
| Time to Detect | 5-10 minutes |
| Time to Respond | 2-5 minutes |
| Cost Savings (prevented breach) | $100K+ |

## Conclusion

Wazuh is a powerful and flexible solution for monitoring cloud infrastructure security. With it, you can:

✅ Detect threats in real-time
✅ Automatically respond to incidents
✅ Meet compliance requirements
✅ Save on costly security breaches

### Next Steps:

1. Deploy Wazuh on your infrastructure
2. Configure agents on critical servers
3. Create custom rules for your environment
4. Integrate with Slack/PagerDuty for alerts
5. Regularly analyze events in Kibana

---

**Need help implementing Wazuh?** Contact our DevOps experts. We'll help deploy and configure a complete security monitoring system for your infrastructure.
