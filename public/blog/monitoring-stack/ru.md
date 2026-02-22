# Мониторинг ML моделей в production

## Введение

Развертывание машинных моделей в production - это только начало. Мониторинг - это то, где спотыкаются большинство команд. Модель, которая идеально работала при обучении, может деградировать в production из-за data drift, concept drift или неожиданных граничных случаев. Без надлежащего мониторинга вы не узнаете, что модели отказывают, пока пользователи не начнут жаловаться.

В этом подробном руководстве я покажу вам, как построить production-grade стек мониторинга, используя Prometheus, Grafana и ELK Stack (Elasticsearch, Logstash, Kibana). Эта установка даст вам видимость в производительность модели, здоровье инфраструктуры и журналы приложений в одном месте.

## Три столпа ML мониторинга

### 1. Мониторинг инфраструктуры

Мониторьте CPU, память, использование GPU, сетевой ввод-вывод и свободное место на диске. Проблемы с инфраструктурой напрямую влияют на производительность модели.

### 2. Мониторинг приложения

Отслеживайте latency запросов, частоту ошибок, пропускную способность и время ответа API. Эти метрики говорят вам, как работает ваш сервис вывода.

### 3. Мониторинг модели

Мониторьте метрики, специфичные для модели: точность прогноза, data drift, latency модели и качество вывода. Это то, что отличает ML мониторинг от традиционного DevOps.

## Prometheus: База данных временных рядов

Prometheus - это отраслевой стандарт с открытым исходным кодом для мониторинга временных рядов. Он собирает метрики из ваших приложений в регулярные интервалы и хранит их эффективно.

### Установка Prometheus

```bash
# Загрузка и установка
wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
tar xvfz prometheus-2.48.0.linux-amd64.tar.gz
cd prometheus-2.48.0.linux-amd64
```

### Базовая конфигурация

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

### Экспорт метрик из вашего ML приложения

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# Определите пользовательские метрики
predictions_total = Counter(
    'ml_predictions_total',
    'Общее количество прогнозов',
    ['model_name', 'status']
)

prediction_latency = Histogram(
    'ml_prediction_latency_seconds',
    'Latency прогноза в секундах',
    ['model_name'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0]
)

# Используйте в функции вывода
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

## Grafana: Красивые dashboards

Grafana подключается к Prometheus (и другим источникам данных) для создания потрясающих интерактивных dashboards.

### Установка Grafana

```bash
# Ubuntu/Debian
sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/oss/release/grafana_10.2.0_amd64.deb
sudo dpkg -i grafana_10.2.0_amd64.deb
sudo systemctl start grafana-server
```

### Подключение Prometheus

1. Вход в Grafana (по умолчанию: admin/admin)
2. Configuration → Data Sources
3. Добавить Prometheus: `http://localhost:9090`
4. Сохранить и протестировать

### Создание dashboard

Создайте dashboard с этими ключевыми панелями:

**Панель 1: Точность модели во времени**
```
select ml_model_accuracy
```

**Панель 2: Latency запроса (95-й процентиль)**
```
histogram_quantile(0.95, rate(ml_prediction_latency_seconds_bucket[5m]))
```

**Панель 3: Частота ошибок**
```
rate(ml_predictions_total{status="error"}[5m]) / rate(ml_predictions_total[5m])
```

## ELK Stack: Централизованное логирование

ELK Stack обеспечивает централизованное логирование, которое критически важно для отладки проблем production.

### Архитектура

- **Elasticsearch**: Распределенный движок поиска и аналитики
- **Logstash**: Обработка и обогащение логов
- **Kibana**: Визуализация и исследование

### Установка стека

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

### Конфигурация Logstash

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

  # Извлеките имя модели из логов
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

## Обнаружение Data Drift

Самая коварная проблема в ML - это data drift, когда распределение входных данных меняется со временем.

### Мониторинг Data Drift

```python
from scipy.stats import ks_2samp
import numpy as np

def check_data_drift(current_batch, reference_distribution, threshold=0.05):
    """
    KS тест для обнаружения сдвига в распределении входных данных
    """
    for feature_name, reference_data in reference_distribution.items():
        current_data = current_batch[feature_name]

        statistic, p_value = ks_2samp(current_data, reference_data)

        if p_value < threshold:
            logger.warning(f'Data drift обнаружен в {feature_name}: p-value={p_value}')
            drift_detected.labels(feature=feature_name).set(1)
```

## Правила оповещений

Определите пороги оповещений для получения уведомлений о проблемах:

```yaml
# prometheus-alerts.yml
groups:
  - name: ml_alerts
    rules:
      - alert: HighPredictionLatency
        expr: histogram_quantile(0.95, ml_prediction_latency_seconds_bucket) > 1
        for: 5m
        annotations:
          summary: "Обнаружен высокий latency прогноза"

      - alert: HighErrorRate
        expr: rate(ml_predictions_total{status="error"}[5m]) > 0.05
        for: 2m
        annotations:
          summary: "Частота ошибок > 5%"
```

---

## Связанные услуги U-Cloud 24

- **[VPS и облачные серверы](/services/server)** - Хостируйте инфраструктуру мониторинга с гарантированным временем работы
- **[DevOps и инфраструктура](/services/devops)** - Экспертная реализация стеков мониторинга и систем оповещений
- **[Аналитика и ML](/services/analytics)** - Комплексный мониторинг для ML конвейеров и моделей
- **[Интеграция API](/services/integration)** - Подключите инструменты мониторинга к вашим существующим системам

**Связанные статьи:** [Выбор ML сервера](/blog/server-for-ml) | [Terraform инфраструктура](/blog/terraform-iac)
