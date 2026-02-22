# Monitorowanie modeli ML w produkcji

## Wprowadzenie

Wdrożenie modeli uczenia maszynowego do produkcji to tylko początek. Monitorowanie to miejsce, w którym potykają się większość zespołów. Model, który działał idealnie podczas trenowania, może degradować się w produkcji z powodu dryfu danych, dryfu koncepcji lub nieoczekiwanych przypadków brzegowych. Bez odpowiedniego monitorowania nie dowiesz się, że twoje modele zawodzą, dopóki użytkownicy się nie skarżą.

W tym kompleksowym przewodniku pokażę ci, jak zbudować stos monitorowania klasy produkcji, używając Prometheus, Grafana i ELK Stack (Elasticsearch, Logstash, Kibana). Ta konfiguracja da ci widoczność na temat wydajności modelu, zdrowia infrastruktury i dzienników aplikacji w jednym miejscu.

## Trzy filary monitorowania ML

### 1. Monitorowanie infrastruktury

Monitoruj CPU, pamięć, wykorzystanie GPU, I/O sieciowe i wolne miejsce na dysku. Problemy z infrastrukturą bezpośrednio wpływają na wydajność modelu.

### 2. Monitorowanie aplikacji

Śledź latencję żądań, wskaźniki błędów, przepustowość i czasy odpowiedzi API. Te metryki mówią ci, jak działa twoja usługa wnioskowania.

### 3. Monitorowanie modelu

Monitoruj metryki specyficzne dla modelu: dokładność prognozowania, dryfowanie danych, latencję modelu i jakość wnioskowania. To właśnie rozróżnia monitorowanie ML od tradycyjnego DevOps.

## Prometheus: Baza danych szeregów czasowych

Prometheus jest standardem branżowym dla monitorowania szeregów czasowych o otwartym kodzie źródłowym. Zbiera metryki z twoich aplikacji w regularnych odstępach czasu i przechowuje je wydajnie.

### Instalacja Prometheus

```bash
# Pobierz i zainstaluj
wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
tar xvfz prometheus-2.48.0.linux-amd64.tar.gz
cd prometheus-2.48.0.linux-amd64
```

### Konfiguracja podstawowa

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

### Eksportowanie metryk z aplikacji ML

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# Zdefiniuj niestandardowe metryki
predictions_total = Counter(
    'ml_predictions_total',
    'Całkowita liczba prognoz',
    ['model_name', 'status']
)

prediction_latency = Histogram(
    'ml_prediction_latency_seconds',
    'Latencja prognozy w sekundach',
    ['model_name'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0]
)

# Użyj w funkcji wnioskowania
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

## Grafana: Piękne dashboardy

Grafana łączy się z Prometheus (i innymi źródłami danych), aby tworzyć wspaniałe, interaktywne pulpity nawigacyjne.

### Instalacja Grafana

```bash
# Ubuntu/Debian
sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/oss/release/grafana_10.2.0_amd64.deb
sudo dpkg -i grafana_10.2.0_amd64.deb
sudo systemctl start grafana-server
```

### Łączenie Prometheus

1. Zaloguj się do Grafana (domyślnie: admin/admin)
2. Configuration → Data Sources
3. Dodaj Prometheus: `http://localhost:9090`
4. Zapisz i przetestuj

### Budowanie dashboardu

Utwórz pulpit nawigacyjny z tymi kluczowymi panelami:

**Panel 1: Dokładność modelu w czasie**
```
select ml_model_accuracy
```

**Panel 2: Latencja żądania (95. percentyl)**
```
histogram_quantile(0.95, rate(ml_prediction_latency_seconds_bucket[5m]))
```

**Panel 3: Wskaźnik błędów**
```
rate(ml_predictions_total{status="error"}[5m]) / rate(ml_predictions_total[5m])
```

## ELK Stack: Scentralizowane logowanie

ELK Stack zapewnia scentralizowane logowanie, które jest niezbędne do debugowania problemów produkcji.

### Architektura

- **Elasticsearch**: Rozproszony silnik wyszukiwania i analityki
- **Logstash**: Przetwarzanie i wzbogacanie logów
- **Kibana**: Wizualizacja i eksploracja

### Instalacja stosu

```bash
# Konfiguracja Docker Compose
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

### Konfiguracja Logstash

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

  # Wyodrębnij nazwę modelu z logów
  grok {
    match => { "message" => "model=%{NOTSPACE:model_name}" }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "ml-logs-%{+YYYY.MM.dd}"
  }
}
```

## Wykrywanie dryfu danych

Najbardziej podstępny problem w ML to dryfowanie danych, kiedy rozkład danych wejściowych zmienia się w czasie.

### Monitorowanie dryfu danych

```python
from scipy.stats import ks_2samp
import numpy as np

def check_data_drift(current_batch, reference_distribution, threshold=0.05):
    """
    Test KS w celu wykrycia przesunięcia rozkładu wejściowego
    """
    for feature_name, reference_data in reference_distribution.items():
        current_data = current_batch[feature_name]

        statistic, p_value = ks_2samp(current_data, reference_data)

        if p_value < threshold:
            logger.warning(f'Data drift wykryty w {feature_name}: p-value={p_value}')
            drift_detected.labels(feature=feature_name).set(1)
```

## Reguły alertów

Zdefiniuj progi alertów, aby być powiadomianym o problemach:

```yaml
# prometheus-alerts.yml
groups:
  - name: ml_alerts
    rules:
      - alert: HighPredictionLatency
        expr: histogram_quantile(0.95, ml_prediction_latency_seconds_bucket) > 1
        for: 5m
        annotations:
          summary: "Wykryto wysoką latencję prognozy"

      - alert: HighErrorRate
        expr: rate(ml_predictions_total{status="error"}[5m]) > 0.05
        for: 2m
        annotations:
          summary: "Wskaźnik błędów > 5%"
```

---

## Powiązane usługi U-Cloud 24

- **[Serwery VPS i chmurowe](/services/server)** - Hostuj infrastrukturę monitorowania z gwarantowaną dostępnością
- **[DevOps i infrastruktura](/services/devops)** - Eksperta realizacja stosów monitorowania i systemów alertów
- **[Analityka i ML](/services/analytics)** - Kompleksowe monitorowanie potoków ML i modeli
- **[Integracja API](/services/integration)** - Połącz narzędzia monitorowania z istniejącymi systemami

**Powiązane artykuły:** [Wybór serwera ML](/blog/server-for-ml) | [Infrastruktura Terraform](/blog/terraform-iac)
