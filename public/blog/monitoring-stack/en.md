# Monitoring ML Models in Production

## Introduction

Deploying machine learning models to production is just the beginning. Monitoring is where most teams stumble. A model that performed perfectly during training can degrade in production due to data drift, concept drift, or unexpected edge cases. Without proper monitoring, you won't know your models are failing until users complain.

In this comprehensive guide, I'll show you how to build a production-grade monitoring stack using Prometheus, Grafana, and the ELK Stack (Elasticsearch, Logstash, Kibana). This setup will give you visibility into model performance, infrastructure health, and application logs all in one place.

## The Three Pillars of ML Monitoring

### 1. Infrastructure Monitoring

Monitor CPU, memory, GPU utilization, network I/O, and disk space. Infrastructure issues directly impact model performance.

### 2. Application Monitoring

Track request latency, error rates, throughput, and API response times. These metrics tell you how your inference service is performing.

### 3. Model Monitoring

Monitor model-specific metrics: prediction accuracy, data drift, model latency, and inference quality. This is what separates ML monitoring from traditional DevOps.

## Prometheus: Time-Series Metrics

Prometheus is the industry-standard open-source time-series database for monitoring. It scrapes metrics from your applications at regular intervals and stores them efficiently.

### Installing Prometheus

```bash
# Download and install
wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
tar xvfz prometheus-2.48.0.linux-amd64.tar.gz
cd prometheus-2.48.0.linux-amd64
```

### Basic Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'ml-inference'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'gpu-metrics'
    static_configs:
      - targets: ['localhost:9400']
```

### Exposing Metrics from Your ML App

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# Define custom metrics
predictions_total = Counter(
    'ml_predictions_total',
    'Total number of predictions',
    ['model_name', 'status']
)

prediction_latency = Histogram(
    'ml_prediction_latency_seconds',
    'Prediction latency in seconds',
    ['model_name'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0]
)

model_accuracy = Gauge(
    'ml_model_accuracy',
    'Model accuracy on validation set',
    ['model_name', 'data_source']
)

# Use in your inference function
@app.post("/predict")
async def predict(data: dict):
    start = time.time()

    try:
        result = model.predict(data['features'])
        predictions_total.labels(
            model_name='resnet50',
            status='success'
        ).inc()
    except Exception as e:
        predictions_total.labels(
            model_name='resnet50',
            status='error'
        ).inc()
        raise

    duration = time.time() - start
    prediction_latency.labels(model_name='resnet50').observe(duration)

    return result
```

### PromQL Queries

Write queries to understand your data:

```promql
# Current request rate
rate(ml_predictions_total[5m])

# 95th percentile latency
histogram_quantile(0.95, ml_prediction_latency_seconds_bucket)

# Error rate
rate(ml_predictions_total{status="error"}[5m]) / rate(ml_predictions_total[5m])
```

## Grafana: Beautiful Dashboards

Grafana connects to Prometheus (and other data sources) to create stunning, interactive dashboards.

### Installing Grafana

```bash
# Ubuntu/Debian
sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/oss/release/grafana_10.2.0_amd64.deb
sudo dpkg -i grafana_10.2.0_amd64.deb
sudo systemctl start grafana-server
```

### Connecting Prometheus

1. Login to Grafana (default: admin/admin)
2. Configuration → Data Sources
3. Add Prometheus: `http://localhost:9090`
4. Save & test

### Building a Dashboard

Create a dashboard with these key panels:

**Panel 1: Model Accuracy Over Time**
```
select ml_model_accuracy
```

**Panel 2: Request Latency (95th percentile)**
```
histogram_quantile(0.95, rate(ml_prediction_latency_seconds_bucket[5m]))
```

**Panel 3: Error Rate**
```
rate(ml_predictions_total{status="error"}[5m]) / rate(ml_predictions_total[5m])
```

**Panel 4: GPU Utilization**
```
nvidia_smi_utilization_gpu_percent
```

## ELK Stack: Centralized Logging

The ELK Stack provides centralized logging, which is crucial for debugging production issues.

### Architecture

- **Elasticsearch**: Distributed search and analytics engine
- **Logstash**: Log processing and enrichment
- **Kibana**: Visualization and exploration

### Installing the Stack

```bash
# Docker Compose setup
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.10.0
    ports:
      - "5000:5000"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

### Logstash Configuration

```
input {
  file {
    path => "/var/log/ml-app/*.log"
    start_position => "beginning"
  }
}

filter {
  json {
    source => "message"
  }

  # Extract model name from logs
  grok {
    match => { "message" => "model=%{NOTSPACE:model_name}" }
  }

  # Parse timestamps
  date {
    match => [ "timestamp", "ISO8601" ]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "ml-logs-%{+YYYY.MM.dd}"
  }
}
```

### Sending Logs from Python

```python
import logging
import json
from pythonjsonlogger import jsonlogger

# Configure JSON logging
logger = logging.getLogger()
logHandler = logging.FileHandler('/var/log/ml-app/app.log')
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

# Log with context
logger.info('prediction_made', extra={
    'model_name': 'resnet50',
    'prediction_time_ms': 45.3,
    'confidence_score': 0.95,
    'input_shape': [1, 224, 224, 3]
})
```

## Data Drift Detection

The most insidious problem in ML is data drift—when the distribution of input data changes over time.

### Monitoring Data Drift

```python
from scipy.stats import ks_2samp
import numpy as np

def check_data_drift(current_batch, reference_distribution, threshold=0.05):
    """
    KS test to detect if input distribution has shifted
    """
    for feature_name, reference_data in reference_distribution.items():
        current_data = current_batch[feature_name]

        statistic, p_value = ks_2samp(current_data, reference_data)

        if p_value < threshold:
            logger.warning(f'Data drift detected in {feature_name}: p-value={p_value}')
            drift_detected.labels(feature=feature_name).set(1)
        else:
            drift_detected.labels(feature=feature_name).set(0)
```

## Alerting Rules

Define alert thresholds to get notified of issues:

```yaml
# prometheus-alerts.yml
groups:
  - name: ml_alerts
    rules:
      - alert: HighPredictionLatency
        expr: histogram_quantile(0.95, ml_prediction_latency_seconds_bucket) > 1
        for: 5m
        annotations:
          summary: "High prediction latency detected"

      - alert: HighErrorRate
        expr: rate(ml_predictions_total{status="error"}[5m]) > 0.05
        for: 2m
        annotations:
          summary: "Error rate > 5%"

      - alert: GPUMemoryLeak
        expr: nvidia_smi_memory_used_mb > 90000
        for: 10m
        annotations:
          summary: "GPU memory usage critical"
```

## Deployment with Docker Compose

Complete monitoring stack:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  prometheus-data:
  grafana-data:
  elasticsearch-data:
```

## Best Practices

1. **Set Baselines**: Establish normal performance metrics during the first 2-4 weeks of production
2. **Alert on Anomalies**: Use statistical methods to detect unusual patterns
3. **Log Context**: Include input features, model version, and other context in logs
4. **Track Model Versions**: Always log which model version made each prediction
5. **Retention Policy**: Keep detailed logs for 30 days, summary metrics for 1 year
6. **Test Alerts**: Verify that alerts fire correctly before going to production

---

## Related U-Cloud 24 Services

- **[VPS & Cloud Servers](/services/server)** - Host your monitoring infrastructure with guaranteed uptime
- **[DevOps & Infrastructure](/services/devops)** - Expert implementation of monitoring stacks and alert systems
- **[Data Analytics & ML](/services/analytics)** - Comprehensive monitoring for ML pipelines and models
- **[API Integration](/services/integration)** - Connect monitoring tools with your existing systems

**Related articles:** [ML Server Selection](/blog/server-for-ml) | [Terraform Infrastructure](/blog/terraform-iac)
