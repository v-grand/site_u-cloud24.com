# Architectuur van AI-agenten: van gereedschappen naar meerstapssystemen

## Introductie

AI-agenten worden het centrale architectuurparadigma van moderne software. In tegenstelling tot eenvoudige LLM-modellen die tekst genereren op basis van een prompt, **kunnen agenten onafhankelijk beslissingen nemen, gereedschappen gebruiken en volgens meerstapscenario's werken**.

Dit artikel behandelt:
- Kerncomponenten van agentarchitectuur
- Ontwikkelingskaders (LangChain, CrewAI, AutoGen)
- Gereedschaps- en integratiesystemen
- Meerstapswerkstromen en redeneringstrategieën
- Productie-ready voorbeelden en best practices

## Wat is een AI-agent?

### Definitie

Een **AI-agent** is een softwaresysteem dat:
- Informatie ontvangt van de omgeving
- Deze verwerkt met behulp van LLM
- Besluiten neemt en acties kiest
- Gereedschappen/functies uitvoert
- Zich aanpast op basis van resultaten

### Verschillen met normale LLM

| Parameter | LLM | AI-Agent |
|-----------|-----|----------|
| **Vermogen om actie te ondernemen** | Genereert alleen tekst | Voert acties uit, roept functies aan |
| **Geheugen** | Context van één verzoek | Langetermijngeheugen, interactiegeschiedenis |
| **Gereedschappen** | Geen | API's, databases, zoekmachines, rekenmachines |
| **Autonomie** | Hangt af van gebruiker | Plant en handelt onafhankelijk |
| **Foutafhandeling** | Hallucinaties | Kan resultaten met gereedschappen verifiëren |

### Agent-voorbeelden

1. **Ondersteuningsassistent** - vragen beantwoorden, tickets indienen
2. **Onderzoeksagent** - informatie verzamelen, bronanalyse, rapportcreatie
3. **Data-analist** - databasequery's, analyse, visualisatie
4. **Coderingsassistent** - codering, debugging, testen
5. **Financieel adviseur** - berekeningen, vergelijkingen, aanbevelingen

## Agentarchitectuur

### 1. Systeemcomponenten

```
┌─────────────────────────────────────────────────┐
│         Gebruiker / Externe invoer              │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │ Waarnemingslaag  │
        │ (invoeranalyse)  │
        └────────┬─────────┘
                 │
    ┌────────────▼────────────────┐
    │   Planning & Reasoning      │
    │  (LLM beslist volgende stap)│
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
         │ Reflectielaag    │
         │(Controle)        │
         └────────┬──────────┘
                  │
         ┌────────▼──────────┐
         │ Geheugen & Context│
         │(Langetermijnstatus)
         └────────┬──────────┘
                  │
        ┌─────────▼──────────┐
        │ Uitvoergeneratie   │
        │ (Antwoord)         │
        └────────────────────┘
```

### 2. Agentuitvoeringscyclus

```
1. Gebruikersquery
   ↓
2. Waarneming: Parse en extract intentie
   ↓
3. Planning: Genereer denkproces
   ↓
4. Gereedschapskeuze: Kies beste gereedschap
   ↓
5. Gereedschapuitvoering: Roep API/functie aan
   ↓
6. Observatie: Verwerk resultaat
   ↓
7. Redenering: Beslis volgende stap
   ├─→ Meer gereedschappen nodig? → Terug naar 4
   ├─→ Kan antwoorden? → Ga naar 8
   └─→ Fout? → Behandel & retry
   ↓
8. Antwoordgeneratie
   ↓
9. Geheugen bijwerken
   ↓
10. Terug naar gebruiker
```

## Gereedschappen en integraties

### 1. Ingebouwde gereedschappen

**Informatie ophalen:**
```python
# Google Search via SerpAPI
agent.add_tool({
  "name": "google_search",
  "description": "Zoeken op internet",
  "function": search_google,
  "params": ["query", "num_results"]
})

# Database query
agent.add_tool({
  "name": "query_db",
  "description": "Query PostgreSQL database",
  "function": query_postgresql,
  "params": ["sql_query"]
})
```

**Berekeningen:**
```python
# Rekenmachine
agent.add_tool({
  "name": "calculator",
  "description": "Voer wiskundige berekeningen uit",
  "function": eval_math,
  "params": ["expression"]
})

# Code-uitvoering (veilig)
agent.add_tool({
  "name": "python_repl",
  "description": "Voer Python-code uit",
  "function": run_python_safely,
  "params": ["code"]
})
```

**Externe API's:**
```python
# Weer-API
agent.add_tool({
  "name": "weather",
  "description": "Weersvoorspelling ophalen",
  "function": get_weather,
  "params": ["location", "days"]
})

# E-mail verzenden
agent.add_tool({
  "name": "send_email",
  "description": "E-mail verzenden",
  "function": send_email_smtp,
  "params": ["to", "subject", "body"]
})
```

### 2. Ontwikkelingskaders

#### LangChain

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def calculator(expression: str) -> str:
    """Voer berekeningen uit"""
    return str(eval(expression))

tools = [calculator]
llm = ChatOpenAI(model="gpt-4", temperature=0)

agent = create_react_agent(llm, tools)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({"input": "Hoeveel is 25 * 4?"})
```

#### CrewAI

```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Research Specialist",
    goal="Informatie verzamelen",
    tools=[search_tool],
    memory=True
)

task = Task(
    description="Onderzoek AI-trends",
    agent=researcher,
    expected_output="Onderzoeksrapport"
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
    max_consecutive_auto_reply=10
)

user_proxy.initiate_chat(
    assistant,
    message="Analyseer deze dataset"
)
```

## Meerstapssystemen en redenering

### 1. Chain of Thought (CoT)

```python
prompt = """
Los dit stap voor stap op:

Taak: Jan kocht 3 appels à $2 en 2 sinaasappels à $3.
Hoeveel uitgegeven?

Stap 1: Bereken kosten appels
Stap 2: Bereken kosten sinaasappels
Stap 3: Tel op
"""

response = llm.invoke(prompt)
```

### 2. ReAct (Reasoning + Acting)

```python
agent_prompt = """
Gebruik dit format:

Vraag: invoervraag
Gedachte: denk na over wat te doen
Actie: uit te voeren actie
Observatie: actieresultaat
Gedachte: ik weet het antwoord
Antwoord: uiteindelijk antwoord
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

## Productie-ready voorbeelden

### Voorbeeld 1: Data-analyseasistent

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def query_database(sql: str) -> str:
    """Voer SQL-query uit"""
    conn = psycopg2.connect("...")
    df = pd.read_sql(sql, conn)
    return df.to_json()

@tool
def create_visualization(data: str, chart_type: str) -> str:
    """Maak visualisatie"""
    df = pd.read_json(data)
    plt.figure(figsize=(10, 6))
    if chart_type == "bar":
        df.plot(kind="bar")
    plt.savefig("chart.png")
    return "Grafiek opgeslagen"

tools = [query_database, create_visualization]
llm = ChatOpenAI(model="gpt-4", temperature=0)

agent = create_react_agent(llm, tools)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

query = "Analyseer Q3 2024 verkoopgegevens"
result = executor.invoke({"input": query})
```

### Voorbeeld 2: Onderzoekssysteem met meerdere agenten

```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Onderzoeksspecialist",
    goal="Informatie verzamelen",
    tools=[web_search, document_analysis],
    memory=True
)

analyst = Agent(
    role="Data-analist",
    goal="Resultaten analyseren",
    tools=[data_analysis],
    memory=True
)

writer = Agent(
    role="Technisch schrijver",
    goal="Rapporten maken",
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

## Best practices

### 1. Contextbeheer

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

### 2. Foutafhandeling

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

### 3. Monitoring en logboekregistratie

```python
logger = logging.getLogger("agent")

class MonitoredAgent:
    def execute(self, task):
        start_time = datetime.now()
        logger.info(f"Taak: {task}")

        try:
            result = self.agent.run(task)
            duration = (datetime.now() - start_time).total_seconds()
            logger.info(f"Voltooid in {duration}s")
            return result
        except Exception as e:
            logger.error(f"Fout: {str(e)}")
            raise
```

### 4. Agent testen

```python
def test_agent_accuracy():
    test_cases = [
        {
            "input": "Hoeveel is 15 * 4?",
            "expected": "60"
        }
    ]

    for test in test_cases:
        result = agent.run(test["input"])
        assert str(test["expected"]) in result["output"]
```

## Kosten en optimalisatie

### Kostenopbouw

```
Kosten per verzoek (GPT-4):
- Hoofd-LLM: ~$0.03
- Gereedschapoproepen (3 avg): ~$0.015
- Vectorzoeken: ~$0.001
- Totaal: ~$0.046

Optimalisatie:
- GPT-3.5-turbo: -60% kosten
- Resultaten cachen: -30% API
- Batching: -20% overhead
- Lokale embeddings: -0.001

Geoptimaliseerde kosten: ~$0.014 (-70%)
```

## Conclusie

AI-agenten zijn de toekomst van automatisering:

✅ **Autonomie** - werken onafhankelijk
✅ **Gereedschappen** - breiden LLM-mogelijkheden uit
✅ **Meerstapps** - lossen complexe taken stap voor stap op
✅ **Aanpassingsvermogen** - leren van interacties
✅ **Schaalbaarheid** - meerdere-agentsystemen coördineren

### Volgende stappen:

1. Kies een framework (LangChain, CrewAI, AutoGen)
2. Definieer gereedschappen
3. Ontwerp redeneringsstrategie
4. Implementeer met foutafhandeling
5. Test en monitor in productie

---

**Hulp nodig bij het bouwen van een AI-agent?** Neem contact op met onze experts. We helpen u een agent ontwerpen en implementeren voor uw behoeften.
