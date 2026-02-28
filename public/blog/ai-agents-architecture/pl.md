# Architektura agentów AI: od narzędzi do systemów wieloetapowych

## Wprowadzenie

Agenci AI stają się centralnym paradygmatem architektonicznym nowoczesnego oprogramowania. W przeciwieństwie do prostych modeli LLM, które generują tekst na podstawie podpowiedzi, **agenci mogą niezależnie podejmować decyzje, używać narzędzi i pracować w wieloetapowych scenariuszach**.

Artykuł obejmuje:
- Podstawowe komponenty architektury agentów
- Frameworki programistyczne (LangChain, CrewAI, AutoGen)
- Systemy narzędzi i integracje
- Wieloetapowe przepływy pracy i strategie rozumowania
- Przykłady gotowe do produkcji i najlepsze praktyki

## Co to jest agent AI?

### Definicja

**Agent AI** to system oprogramowania, który:
- Odbiera informacje ze środowiska
- Przetwarza je za pomocą LLM
- Podejmuje decyzje i wybiera działania
- Wykonuje narzędzia/funkcje
- Adaptuje się na podstawie wyników

### Różnice od zwykłego LLM

| Parameter | LLM | Agent AI |
|-----------|-----|----------|
| **Zdolność działania** | Tylko generuje tekst | Wykonuje akcje, wywołuje funkcje |
| **Pamięć** | Kontekst jednego żądania | Długoterminowa pamięć, historia interakcji |
| **Narzędzia** | Brak | API, bazy danych, wyszukiwarki, kalkulatory |
| **Autonomia** | Zależy od użytkownika | Planuje i działa niezależnie |
| **Obsługa błędów** | Halucynacje | Może weryfikować wyniki narzędziami |

### Przykłady agentów

1. **Asystent wsparcia** - odpowiadanie na pytania, zgłaszanie biletów
2. **Agent badawczy** - gromadzenie informacji, analiza źródeł, tworzenie raportów
3. **Analityk danych** - zapytania do bazy danych, analiza, wizualizacja
4. **Asystent kodowania** - pisanie kodu, debugowanie, testowanie
5. **Doradca finansowy** - obliczenia, porównania, rekomendacje

## Architektura agenta

### 1. Komponenty systemu

```
┌─────────────────────────────────────────────────┐
│         Użytkownik / Wejście zewnętrzne         │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │ Warstwa percepcji│
        │ (analiza wejścia)│
        └────────┬─────────┘
                 │
    ┌────────────▼────────────────┐
    │   Planowanie & Reasoning    │
    │  (LLM decyduje następny krok)
    └────────────┬─────────────────┘
                 │
         ┌───────▼──────────┐
    ┌────┴─────────┬────────┴──────┐
    │              │               │
┌───▼───┐      ┌──▼──┐      ┌────▼────┐
│Tool1  │      │Tool2│ ...  │ ToolN   │
│(API)  │      │(DB) │      │(Search) │
└───┬───┘      └──┬──┘      └────┬────┘
    │             │              │
    └─────────────┼──────────────┘
                  │
         ┌────────▼──────────┐
         │ Warstwa refleksji │
         │(Sprawdzenie)      │
         └────────┬──────────┘
                  │
         ┌────────▼──────────┐
         │ Pamięć & Kontekst │
         │(Stan długoterminowy)
         └────────┬──────────┘
                  │
        ┌─────────▼──────────┐
        │ Generowanie wyniku │
        │ (Odpowiedź)        │
        └────────────────────┘
```

### 2. Cykl wykonania agenta

```
1. Zapytanie użytkownika
   ↓
2. Percepcja: Analiza i ekstrakcja intencji
   ↓
3. Planowanie: Generowanie procesu myślenia
   ↓
4. Wybór narzędzia: Wybór najlepszego narzędzia
   ↓
5. Wykonanie narzędzia: Wywołanie API/funkcji
   ↓
6. Obserwacja: Przetworzenie wyniku
   ↓
7. Rozumowanie: Decyzja następnego kroku
   ├─→ Potrzeba więcej narzędzi? → Powrót do 4
   ├─→ Czy mogę odpowiedzieć? → Przejście do 8
   └─→ Błąd? → Obsługa & ponowna próba
   ↓
8. Generowanie odpowiedzi
   ↓
9. Aktualizacja pamięci
   ↓
10. Zwrot do użytkownika
```

## Narzędzia i integracje

### 1. Wbudowane narzędzia

**Pobieranie informacji:**
```python
# Google Search via SerpAPI
agent.add_tool({
  "name": "google_search",
  "description": "Wyszukiwanie w internecie",
  "function": search_google,
  "params": ["query", "num_results"]
})

# Zapytanie do bazy danych
agent.add_tool({
  "name": "query_db",
  "description": "Zapytanie do bazy PostgreSQL",
  "function": query_postgresql,
  "params": ["sql_query"]
})
```

**Obliczenia:**
```python
# Kalkulator
agent.add_tool({
  "name": "calculator",
  "description": "Wykonaj obliczenia matematyczne",
  "function": eval_math,
  "params": ["expression"]
})

# Wykonanie kodu (bezpieczne)
agent.add_tool({
  "name": "python_repl",
  "description": "Wykonaj kod Python",
  "function": run_python_safely,
  "params": ["code"]
})
```

**Zewnętrzne API:**
```python
# Pogoda API
agent.add_tool({
  "name": "weather",
  "description": "Pobierz prognozę pogody",
  "function": get_weather,
  "params": ["location", "days"]
})

# Wysyłanie wiadomości email
agent.add_tool({
  "name": "send_email",
  "description": "Wyślij email",
  "function": send_email_smtp,
  "params": ["to", "subject", "body"]
})
```

### 2. Frameworki programistyczne

#### LangChain

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def calculator(expression: str) -> str:
    """Wykonaj obliczenia"""
    return str(eval(expression))

tools = [calculator]
llm = ChatOpenAI(model="gpt-4", temperature=0)

agent = create_react_agent(llm, tools)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({"input": "Ile wynosi 25 * 4?"})
```

#### CrewAI

```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Research Specialist",
    goal="Zbierz informacje",
    tools=[search_tool],
    memory=True
)

task = Task(
    description="Zbadaj trendy AI",
    agent=researcher,
    expected_output="Raport badawczy"
)

crew = Crew(
    agents=[researcher],
    tasks=[task],
    verbose=True
)

result = crew.kickoff()
```

#### AutoGen

```python
from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent(
    name="assistant",
    llm_config={"model": "gpt-4"}
)

user_proxy = UserProxyAgent(
    name="user",
    human_input_mode="TERMINATE",
    max_consecutive_auto_reply=10
)

user_proxy.initiate_chat(
    assistant,
    message="Przeanalizuj ten zbiór danych"
)
```

## Systemy wieloetapowe i rozumowanie

### 1. Chain of Thought (CoT)

```python
prompt = """
Rozwiąż to krok po kroku:

Zadanie: Jan kupił 3 jabłka po $2 każde i 2 pomarańcze po $3 każda.
Ile wydał?

Krok 1: Oblicz koszt jabłek
Krok 2: Oblicz koszt pomarańczy
Krok 3: Podsumuj
"""

response = llm.invoke(prompt)
```

### 2. ReAct (Reasoning + Acting)

```python
agent_prompt = """
Używaj tego formatu:

Pytanie: pytanie wejściowe
Myśl: zastanów się co robić
Akcja: akcja do wykonania
Obserwacja: wynik akcji
Myśl: teraz znam odpowiedź
Odpowiedź: ostateczna odpowiedź
"""
```

### 3. Tree of Thought (ToT)

```python
class TreeOfThoughtAgent:
    def solve(self, problem):
        approaches = self.generate_approaches(problem, num=3)

        results = []
        for approach in approaches:
            steps = self.plan_steps(approach)
            result = self.execute_steps(steps)
            score = self.evaluate(result)
            results.append((approach, result, score))

        return max(results, key=lambda x: x[2])
```

### 4. Self-Reflection

```python
class ReflectiveAgent:
    def execute_with_reflection(self, task):
        result = self.execute_plan(task)
        critique = self.llm.critique(task, result)

        if not critique["is_good"]:
            improved_plan = self.revise_plan(task, critique)
            result = self.execute_plan(improved_plan)

        return result
```

## Przykłady gotowe do produkcji

### Przykład 1: Asystent analityki danych

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def query_database(sql: str) -> str:
    """Wykonaj zapytanie SQL"""
    conn = psycopg2.connect("...")
    df = pd.read_sql(sql, conn)
    return df.to_json()

@tool
def create_visualization(data: str, chart_type: str) -> str:
    """Utwórz wizualizację"""
    df = pd.read_json(data)
    plt.figure(figsize=(10, 6))
    if chart_type == "bar":
        df.plot(kind="bar")
    plt.savefig("chart.png")
    return "Wykres zapisany"

tools = [query_database, create_visualization]
llm = ChatOpenAI(model="gpt-4", temperature=0)

agent = create_react_agent(llm, tools)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

query = "Przeanalizuj dane sprzedaży Q3 2024"
result = executor.invoke({"input": query})
```

### Przykład 2: System wielu agentów do badań

```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Specjalista badawczy",
    goal="Zbierz informacje",
    tools=[web_search, document_analysis],
    memory=True
)

analyst = Agent(
    role="Analityk danych",
    goal="Analizuj wyniki",
    tools=[data_analysis],
    memory=True
)

writer = Agent(
    role="Pisarz techniczny",
    goal="Twórz raporty",
    tools=[document_creation],
    memory=True
)

crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[task1, task2, task3],
    verbose=True,
    process=Process.sequential
)

result = crew.kickoff()
```

## Najlepsze praktyki

### 1. Zarządzanie kontekstem

```python
class ContextManager:
    def __init__(self, max_memory=50):
        self.memory = []
        self.max_memory = max_memory

    def add_interaction(self, input_text, action, observation):
        self.memory.append({
            "timestamp": datetime.now(),
            "input": input_text,
            "action": action,
            "observation": observation
        })

        if len(self.memory) > self.max_memory:
            self.memory = self.memory[-self.max_memory:]

    def get_context(self):
        return "\n".join([
            f"- {m['action']}: {m['observation'][:100]}"
            for m in self.memory[-10:]
        ])
```

### 2. Obsługa błędów

```python
class RobustAgent:
    def execute_with_retry(self, task, max_retries=3):
        for attempt in range(max_retries):
            try:
                return self.agent.run(task)
            except APIError:
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise
```

### 3. Monitorowanie i logowanie

```python
logger = logging.getLogger("agent")

class MonitoredAgent:
    def execute(self, task):
        start_time = datetime.now()
        logger.info(f"Zadanie: {task}")

        try:
            result = self.agent.run(task)
            duration = (datetime.now() - start_time).total_seconds()
            logger.info(f"Ukończone w {duration}s")
            return result
        except Exception as e:
            logger.error(f"Błąd: {str(e)}")
            raise
```

### 4. Testowanie agentów

```python
def test_agent_accuracy():
    test_cases = [
        {
            "input": "Ile wynosi 15 * 4?",
            "expected": "60"
        }
    ]

    for test in test_cases:
        result = agent.run(test["input"])
        assert str(test["expected"]) in result["output"]
```

## Koszty i optymalizacja

### Podział kosztów

```
Koszty na żądanie (GPT-4):
- Główne LLM: ~$0.03
- Wywołania narzędzi (3 avg): ~$0.015
- Wektorowe wyszukiwanie: ~$0.001
- Razem: ~$0.046

Optymalizacja:
- GPT-3.5-turbo: -60% kosztów
- Cache wyników: -30% API
- Batching: -20% overhead
- Lokalne embeddingi: -0.001

Zoptymalizowany koszt: ~$0.014 (-70%)
```

## Podsumowanie

Agenci AI to przyszłość automatyzacji:

✅ **Autonomia** - pracują niezależnie
✅ **Narzędzia** - rozszerzają możliwości LLM
✅ **Wieloetapowość** - rozwiązują złożone zadania
✅ **Adaptacyjność** - uczą się z interakcji
✅ **Skalowalność** - systemy wielu agentów

### Następne kroki:

1. Wybierz framework (LangChain, CrewAI, AutoGen)
2. Zdefiniuj narzędzia
3. Zaprojektuj strategię rozumowania
4. Implementuj z obsługą błędów
5. Testuj i monitoruj w produkcji

---

**Potrzebujesz pomocy w budowie agenta AI?** Skontaktuj się z naszymi ekspertami. Pomożemy zaprojektować i wdrożyć agenta dla Twoich potrzeb.
