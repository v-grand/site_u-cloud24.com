---
title: "Jak wybrać serwer do obciążeń ML: CPU vs GPU"
description: "Kompletny przewodnik do wyboru serwera w chmurze dla uczenia maszynowego: porównanie procesorów, procesorów graficznych, pamięci i zalecenia dla różnych zadań ML."
keywords: "Serwer ML, GPU, CPU, uczenie maszynowe, chmura, TensorFlow, PyTorch, obliczenia"
author: "graweo"
date: "2026-03-15"
updated: "2026-03-15"
slug: "server-for-ml"
section: "Cloud Servers"
readTime: "12 min"
---

# Jak wybrać serwer do obciążeń ML: CPU vs GPU

Uczenie maszynowe wymaga potężnych zasobów obliczeniowych. Wybranie złego serwera prowadzi albo do przepłacenia za nadmierne moce, albo do braku możliwości uczenia modeli w akceptowalnym czasie. W tym artykule omówimy, jak wybrać optymalny serwer dla projektu ML na podstawie rzeczywistych wymagań i benchmarków.

## Wprowadzenie

Wymagania obliczeniowe dla uczenia maszynowego rosną wykładniczo. Pięć lat temu 8-rdzeniowy CPU wystarczał do treningu sieci neuronowych. Dzisiaj konkurencyjne modele wymagają procesorów graficznych z tysiącami rdzeni CUDA.

Ale który serwer wybrać? Gdzie jest granica między CPU a GPU? Ile pamięci potrzebujesz? Jaka pojemność SSD jest wystarczająca?

Przeanalizowaliśmy ponad 100 projektów ML na U-Cloud 24 i utworzyliśmy praktyczny przewodnik do wyboru idealnego serwera.

## 1. Architektura: CPU vs GPU vs TPU

### 1.1 CPU (Centralny Procesor)

**Kiedy stosować:** Małe modele, prototypowanie, wnioskowanie, przetwarzanie danych

**Charakterystyka:**
- Do 128 rdzeni (na serwerach wysokiej klasy)
- Częstotliwość: 3.0-4.5 GHz
- Obliczenia uniwersalne
- Niska cena

**Przykłady:** Intel Xeon Platinum, AMD EPYC

```
┌─────────────────────────────────────┐
│        Architektura CPU             │
├─────────────────────────────────────┤
│  Jednostka Sterująca                │
│  ├─ Predykcja skoków                │
│  ├─ Pobieranie instrukcji            │
│  └─ Zarządzanie pamięcią             │
│                                     │
│  ALU (Arytmetyczno-logiczna)        │
│  ├─ Operacje sekwencyjne            │
│  └─ Złożone instrukcje               │
│                                     │
│  Pamięć podręczna: L1, L2, L3       │
│  └─ Duże opóźnienia dla pamięci      │
└─────────────────────────────────────┘
```

**Wydajność (TensorFlow MNIST):**
- CPU: ~5 sekund na epokę
- 8 rdzeni: ~15 sekund na epokę

### 1.2 GPU (Procesor Graficzny)

**Kiedy stosować:** Głębokie uczenie, trening dużych modeli, obliczenia równoległe

**Charakterystyka:**
- 1000-10000 rdzeni CUDA (do treningu)
- Specjalizowana architektura dla paralelizmu
- Zoptymalizowana pamięć (GDDR6, HBM)
- Wbudowane operacje tensorowe

**Przykłady:**
- NVIDIA: H100, A100, RTX 4090
- AMD: MI300X
- Google: TPU v4

```
┌─────────────────────────────────────────┐
│        Architektura GPU                 │
├─────────────────────────────────────────┤
│  Rdzenie CUDA: 10000+                   │
│  ├─ Architektura ujednolicona           │
│  ├─ Wykonywanie oparte na warpach      │
│  └─ Ogromny paralelizm                  │
│                                         │
│  Hierarchia Pamięci:                    │
│  ├─ Rejestry: 256 MB (super szybko)     │
│  ├─ Pamięć Wspólna: 96 KB (cache)       │
│  ├─ Pamięć L2: 6-12 MB                  │
│  └─ HBM: 80 GB (A100/H100)              │
│                                         │
│  Rdzenie Tensorowe: przyspieszenie      │
│  └─ 16x przyspieszenie dla DNN          │
└─────────────────────────────────────────┘
```

**Wydajność (TensorFlow MNIST):**
- GPU (RTX 4090): ~0.5 sekund na epokę (10x szybciej niż CPU)
- GPU (A100): ~0.3 sekund na epokę (17x szybciej)
- GPU (H100): ~0.2 sekund na epokę (25x+ szybciej)

### 1.3 Tabela Porównawcza

| Parametr | CPU | GPU (RTX) | GPU (A100) | TPU v4 |
|----------|-----|-----------|------------|--------|
| **Rdzenie Równoległe** | 16-128 | 10000+ | 10000+ | specjalne |
| **Wydajność Szczytowa** | 5-10 TFLOPS | 80-130 TFLOPS | 312 TFLOPS | 275 TFLOPS |
| **Pamięć (GB)** | 384-1024 | 24-48 | 40-80 | 32-128 |
| **Szerokość Szyny (bit)** | Zmienna | 384 | 5120 | Zmienna |
| **TDP (W)** | 205-270 | 450 | 400 | 400-500 |
| **Koszt w Chmurze** | $0.30-0.50/h | $0.80-1.50/h | $3.00-5.00/h | $5.00-8.00/h |
| **Najlepsze do** | Wnioskowanie CPU | Gry + wnioskowanie | Trening produkcyjny | Trening na dużą skalę |

## 2. CPU vs GPU: Wybór dla Różnych Zadań

### 2.1 Pipeline ML: Gdzie Stosować Co

```
Pipeline Danych (1-5 TB danych)
├─ Ładowanie Danych: CPU (I/O bound)
├─ Przetwarzanie: CPU (do 8 rdzeni)
├─ Inżynieria Cech: CPU (równoległy na wielu rdzeniach)
│
Trening (1000 epok)
├─ Walidacja zestawu: CPU
├─ Forward Pass: GPU (krytyczne)
├─ Backprop: GPU (krytyczne)
├─ Aktualizacja gradientów: GPU
│
Wnioskowanie (100K żądań/dzień)
├─ Pojedyncze przewidywanie: CPU (wystarczające)
├─ Wnioskowanie wsadowe: GPU (10x szybciej)
└─ Obsługa rzeczywista: CPU lub edge GPU
```

### 2.2 Kiedy CPU Wystarczy

✅ **CPU wystarczy jeśli:**
- Trening modeli klasycznych (XGBoost, Random Forest, SVM)
- Rozmiar zestawu danych < 10 GB
- Wnioskowanie pojedynczych modeli (nie rzeczywiste)
- Prototypowanie i badania
- Metody zespołowe na CPU

**Przykład rzeczywisty:** Bank trenował XGBoost do wykrywania oszustw na CPU (16 rdzeni) w 30 minut. Model obsługiwał 1M żądań/dzień na jednym serwerze CPU.

### 2.3 Kiedy GPU Jest Potrzebny

✅ **GPU jest potrzebny jeśli:**
- Głębokie uczenie: CNN, RNN, Transformer
- Rozmiar zestawu danych > 1 GB lub rozmiar wsadu > 256
- Czas treningu jest krytyczny (< 2 godziny)
- Równoczesne wnioskowanie równoległe + trening
- Dostrajanie dużych modeli (GPT, BERT, Llama)

**Przykład rzeczywisty:** Trening GPT-2 (345M parametrów):
- Na CPU (32 rdzenie): 15 dni
- Na jednym GPU A100: 2 godziny
- Na 4 GPU A100 (rozproszone): 30 minut

## 3. Zalecenia Konfiguracji

### 3.1 Małe Projekty (< 1 TB danych, klasyczne ML)

```
Zalecana Konfiguracja Serwera:
├─ CPU: 16 rdzeni (Intel Xeon Gold / AMD EPYC 7002)
├─ RAM: 64 GB
├─ Magazyn: 500 GB NVMe SSD
├─ GPU: Opcjonalnie (RTX 4060 8GB jeśli potrzebne)
├─ Sieć: 1 Gbps
│
Przybliżony Koszt: $400-600/miesiąc
Idealnie do:
  ✓ Konkursów Kaggle
  ✓ Małych modeli NLP
  ✓ Prognozowania szeregów czasowych
  ✓ Klasycznego ML
```

**Konfiguracja na U-Cloud 24:**
```
vps-ml-small
├─ CPU: 16x Intel Xeon (3.5 GHz)
├─ RAM: 64 GB DDR4
├─ Magazyn: 500 GB NVMe
└─ Cena: $499/miesiąc
```

### 3.2 Średnie Projekty (1-10 TB, Głębokie Uczenie)

```
Zalecana Konfiguracja Serwera:
├─ CPU: 32 rdzenie (proces główny)
├─ RAM: 256 GB (do ładowania danych)
├─ Magazyn: 2 TB NVMe SSD
├─ GPU: 1x A100 40GB lub 2x RTX 4090
├─ Sieć: 10 Gbps
│
Przybliżony Koszt: $2,500-4,000/miesiąc
Idealnie do:
  ✓ Modeli Computer Vision
  ✓ Dostrajania NLP (BERT, GPT)
  ✓ Szeregów czasowych z RNN
  ✓ Systemów rekomendacji
```

**Konfiguracja na U-Cloud 24:**
```
gpu-ml-medium
├─ CPU: 32x Intel Xeon Platinum
├─ RAM: 256 GB DDR5
├─ GPU: 1x NVIDIA A100 40GB
├─ Magazyn: 2 TB NVMe RAID
└─ Cena: $3,299/miesiąc
```

### 3.3 Duże Projekty (> 10 TB, Modele Produkcyjne)

```
Zalecana Konfiguracja Serwera:
├─ CPU: 64+ rdzenie (obliczenia rozproszone)
├─ RAM: 512 GB+ (do treningu rozproszonego)
├─ Magazyn: 10+ TB NVMe SSD (lub S3/magazyn obiektów)
├─ GPU: 4x H100 80GB (lub 8x A100)
├─ Sieć: 100 Gbps (do synchronizacji)
│
Przybliżony Koszt: $15,000-30,000/miesiąc
Idealnie do:
  ✓ Dużych Modeli Językowych
  ✓ Modeli Multimodalnych (Wizja + Język)
  ✓ Wnioskowania produkcyjnego w czasie rzeczywistym
  ✓ Treningu rozproszonego
```

**Konfiguracja na U-Cloud 24:**
```
gpu-ml-enterprise
├─ CPU: 64x Intel Xeon Platinum 8592+
├─ RAM: 512 GB DDR5
├─ GPU: 4x NVIDIA H100 80GB (połączone NVLink)
├─ Magazyn: 20 TB NVMe + Magazyn obiektów
├─ Sieć: 400 Gbps Infiniband
└─ Cena: $24,999/miesiąc
```

## 4. Przykłady Konfiguracji Frameworków

### 4.1 Benchmarki TensorFlow

```
Zestaw Danych: ImageNet (1.2M obrazów)
Model: ResNet-50

CPU (32 rdzenie, 256GB RAM):
├─ Rozmiar Wsadu: 128
├─ Czas na epokę: 45 minut
├─ Całkowity trening: 225 godzin (9.4 dnia)
└─ Użycie Pamięci: 120 GB

GPU (1x A100, 256GB RAM):
├─ Rozmiar Wsadu: 512 (4x większy)
├─ Czas na epokę: 3 minuty
├─ Całkowity trening: 15 godzin (0.6 dnia)
├─ Użycie Pamięci: 35 GB (GPU + gospodarz)
└─ Przyspieszenie: 15x
```

### 4.2 PyTorch Duży Model Językowy

```
Model: GPT-2 style (1.5B parametrów)
Zestaw Danych: 10M dokumentów (100 GB)

Pojedynczy GPU (RTX 4090, 48GB VRAM):
├─ Rozmiar Wsadu: 32
├─ Czas na epokę: 24 godziny
├─ Całkowity trening: 10 epok = 10 dni
├─ Pamięć: 48GB GPU + 128GB CPU
└─ Za mało pamięci dla większych modeli!

Multi-GPU (4x A100, 320GB VRAM razem):
├─ Rozmiar Wsadu: 256 (8x większy)
├─ Czas na epokę: 2 godziny (rozproszone)
├─ Całkowity trening: 10 epok = 20 godzin
├─ Pamięć: 80GB GPU + 256GB CPU
└─ Idealnie do produkcji
```

## 5. Praktyczne Rekomendacje

### 5.1 Jak Wybrać Serwer: Przewodnik Krok po Kroku

**Krok 1: Określ Typ Projektu**
```
├─ Klasyczne ML (XGBoost, RF)?        → CPU wystarczy
├─ Głębokie Uczenie (CNN, RNN)?       → GPU wymagane
├─ Dostrajanie LLM (BERT, GPT)?      → GPU A100/H100
└─ Wnioskowanie rzeczywiste?          → CPU + GPU wsadowy
```

**Krok 2: Oszacuj Rozmiar Danych**
```
├─ < 10 GB                → 64 GB RAM, 16 rdzeni
├─ 10-100 GB              → 256 GB RAM, 32 rdzenie
├─ 100 GB - 1 TB          → 512 GB RAM, 64 rdzenie + GPU
└─ > 1 TB                 → Trening rozproszony
```

**Krok 3: Sprawdź Wymagania Frameworku**

| Framework | Min GPU RAM | Rec GPU | Zalecany Serwer |
|-----------|-------------|---------|-----------------|
| TensorFlow | 4 GB | 16+ GB | V100 / A100 |
| PyTorch | 4 GB | 16+ GB | RTX 3090 / A100 |
| JAX | 4 GB | 16+ GB | TPU v3 / A100 |
| Hugging Face | 8 GB | 16-40 GB | A100 |
| LLaMA dostrajanie | 20 GB | 40+ GB | A100 40GB+ |

**Krok 4: Oblicz Czas Treningu**

```
Przybliżony Wzór:
Training_Time = (Data_Size / Batch_Size) × Epochs × Time_Per_Batch

Przykład dla ResNet:
├─ Rozmiar Danych: 100 GB = 50,000 obrazów
├─ Rozmiar Wsadu: 256
├─ Epoki: 100
├─ Czas na wsad (GPU): 0.5 sek
│
└─ Razem = (50,000 / 256) × 100 × 0.5 sek
   = 195 × 100 × 0.5 = 9,750 sek = 2.7 godziny ✓

Na CPU:
├─ Czas na wsad: 5 sek
└─ Razem = 195 × 100 × 5 = 97,500 sek = 27 godzin ✗
```

### 5.2 Lista Kontrolna Wyboru

```
☐ Określił typ zadania ML (klasyczne lub głębokie uczenie)
☐ Oszacował rozmiar zestawu danych
☐ Wybrał framework (TensorFlow, PyTorch)
☐ Sprawdził minimalne wymagania
☐ Obliczył czas treningu
☐ Ustalił budżet (trening + wnioskowanie)
☐ Sprawdzył dostępność GPU w chmurze
☐ Zarezerwował okres testowy (24-48 godzin)
☐ Uruchomił kod na serwerze testowym
☐ Zmierzył rzeczywisty czas treningu
☐ Zatwierdził konfigurację
```

## Wnioski

**Główne Wnioski:**

1. **CPU wystarczy** do klasycznego ML i małych modeli (<1B parametrów)
2. **GPU jest wymagany** do Głębokich Uczenia z dużymi zestawami danych lub złożonymi modelami
3. **A100/H100** — optymalny wybór do produkcji: moc + efektywność
4. **Trening rozproszony** — jedyny sposób na trening LLM (skalę GPT)
5. **Zacznij od małego** — wynajmij GPU na 24-48 godzin do testowania

**Zalecane Konfiguracje U-Cloud 24:**

- **Do prototypowania:** vps-ml-small (CPU, 16 rdzeni) — $499/miesiąc
- **Do produkcji:** gpu-ml-medium (1x A100) — $3,299/miesiąc
- **Do LLM:** gpu-ml-enterprise (4x H100) — $24,999/miesiąc

Wybranie złego serwera może kosztować tysiące dolarów w obliczeniach chmurowych. Zacznij od małego, testuj, mierz i skaluj.

---

## Przydatne Linki

- [Specyfikacje GPU NVIDIA](https://www.nvidia.com/pl-pl/data-center/resources/)
- [Wydajność GPU TensorFlow](https://www.tensorflow.org/guide/gpu)
- [Obsługa CUDA PyTorch](https://pytorch.org/docs/stable/cuda.html)
- [Benchmarki GPU AWS](https://aws.amazon.com/ec2/gpu/)
- [Dokumentacja Google TPU](https://cloud.google.com/tpu/docs)

**Powiązane artykuły:** [Terraform do Infrastruktury ML](/terraform-iac) | [Monitorowanie Modeli ML](/monitoring-stack)

---

**Wersja:** 1.0
**Data Publikacji:** 15 marca 2026
**Czas Czytania:** ~12 minut
**Poziom:** Średniozaawansowany/Zaawansowany

**Tagi:** ML, Infrastruktura, Chmura, GPU, CPU, Benchmarki, TensorFlow, PyTorch
