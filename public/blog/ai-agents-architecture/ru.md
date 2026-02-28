# Архитектура AI-агентов: от инструментов к многошаговым системам

## Введение

AI-агенты становятся центральной архитектурной парадигмой современного ПО. В отличие от простых LLM-моделей, которые генерируют текст на основе промпта, **агенты способны самостоятельно принимать решения, использовать инструменты и работать по многошаговым сценариям**.

Статья раскрывает:
- Основные компоненты архитектуры агентов
- Фреймворки для разработки (LangChain, CrewAI, AutoGen)
- Системы инструментов и интеграции
- Многошаговые workflows и стратегии reasoning
- Production-ready примеры и best practices

## Что такое AI-агент?

### Определение

**AI-агент** - это программная система, которая:
- Получает информацию из окружающей среды
- Обрабатывает её с помощью LLM
- Принимает решения и выбирает действия
- Выполняет инструменты/функции
- Адаптируется на основе результатов

### Отличие от обычного LLM

| Параметр | LLM | AI-Агент |
|----------|-----|----------|
| **Способность действовать** | Только генерирует текст | Выполняет действия, вызывает функции |
| **Память** | Контекст одного запроса | Долгосрочная память, история взаимодействий |
| **Инструменты** | Нет | API, базы данных, поисковики, калькуляторы |
| **Autonomy** | Зависит от юзера | Самостоятельно планирует и действует |
| **Ошибки** | Галлюцинации | Может проверить результат инструментом |

### Примеры AI-агентов

1. **Асистент поддержки** - ответы на вопросы, внесение заявок в базу
2. **Research агент** - поиск информации, анализ источников, создание отчётов
3. **Data analyst** - запросы к БД, анализ, визуализация, выводы
4. **Coding assistant** - написание кода, debugging, тесты
5. **Финансовый советник** - расчёты, сравнение вариантов, рекомендации

## Архитектура AI-агента

### 1. Компоненты системы

```
┌─────────────────────────────────────────────────┐
│           User / External Input                 │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │ Perception Layer │
        │ (Input parsing)  │
        └────────┬─────────┘
                 │
    ┌────────────▼────────────────┐
    │   Planning & Reasoning      │
    │  (LLM decides next action)  │
    └────────────┬─────────────────┘
                 │
         ┌───────▼──────────┐
    ┌────┴─────────┬────────┴──────┐
    │              │               │
┌───▼───┐      ┌──▼──┐      ┌────▼────┐
│ Tool1 │      │Tool2│ ...  │ ToolN   │
│(API)  │      │(DB) │      │(Search) │
└───┬───┘      └──┬──┘      └────┬────┘
    │             │              │
    └─────────────┼──────────────┘
                  │
         ┌────────▼──────────┐
         │ Reflection Layer  │
         │(Check & Evaluate) │
         └────────┬──────────┘
                  │
         ┌────────▼──────────┐
         │ Memory & Context  │
         │(Long-term state)  │
         └────────┬──────────┘
                  │
        ┌─────────▼──────────┐
        │  Output Generation │
        │  (Response to user)│
        └────────────────────┘
```

### 2. Цикл работы агента

```
1. User Query
   ↓
2. Perception: Parse & Extract Intent
   ↓
3. Planning: Generate Thought Process
   ↓
4. Tool Selection: Choose best tool
   ↓
5. Tool Execution: Call API/Function
   ↓
6. Observation: Process Result
   ↓
7. Reasoning: Decide next step
   ├─→ Need more tools? → Back to 4
   ├─→ Can answer? → Go to 8
   └─→ Error? → Handle & retry
   ↓
8. Response Generation
   ↓
9. Update Memory
   ↓
10. Return to User
```

## Инструменты и интеграции

### 1. Встроенные инструменты

**Поиск информации:**
```python
# Google Search via SerpAPI
agent.add_tool({
  "name": "google_search",
  "description": "Search internet for information",
  "function": search_google,
  "params": ["query", "num_results"]
})

# Database Query
agent.add_tool({
  "name": "query_db",
  "description": "Query PostgreSQL database",
  "function": query_postgresql,
  "params": ["sql_query"]
})
```

**Вычисления:**
```python
# Calculator
agent.add_tool({
  "name": "calculator",
  "description": "Perform mathematical calculations",
  "function": eval_math,
  "params": ["expression"]
})

# Code Execution (safe)
agent.add_tool({
  "name": "python_repl",
  "description": "Execute Python code",
  "function": run_python_safely,
  "params": ["code"]
})
```

**Внешние API:**
```python
# Weather API
agent.add_tool({
  "name": "weather",
  "description": "Get weather forecast",
  "function": get_weather,
  "params": ["location", "days"]
})

# Email Sending
agent.add_tool({
  "name": "send_email",
  "description": "Send email",
  "function": send_email_smtp,
  "params": ["to", "subject", "body"]
})
```

### 2. Фреймворки для разработки

#### LangChain

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import tool
from langchain.llm_cache import InMemoryCache
import langchain

langchain.llm_cache = InMemoryCache()

@tool
def calculator(expression: str) -> str:
    """Perform math calculations"""
    return str(eval(expression))

@tool
def search_web(query: str) -> str:
    """Search the web for information"""
    # Implementation
    return results

# Create agent
tools = [calculator, search_web]
llm = ChatOpenAI(model="gpt-4", temperature=0)

agent = create_react_agent(llm, tools)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Run
result = executor.invoke({"input": "What is 25 * 4 + temperature in NYC?"})
```

#### CrewAI

```python
from crewai import Agent, Task, Crew

# Define agents
researcher = Agent(
  role="Research Analyst",
  goal="Find and analyze information",
  backstory="Expert researcher with 20 years experience",
  tools=[search_tool, scrape_tool],
  memory=True
)

analyst = Agent(
  role="Data Analyst",
  goal="Analyze data and provide insights",
  backstory="Data expert with Python expertise",
  tools=[query_tool, viz_tool]
)

# Define tasks
research_task = Task(
  description="Research AI agent frameworks",
  agent=researcher,
  expected_output="Comprehensive report"
)

analysis_task = Task(
  description="Analyze market trends",
  agent=analyst,
  expected_output="Insights and recommendations"
)

# Create crew
crew = Crew(
  agents=[researcher, analyst],
  tasks=[research_task, analysis_task],
  verbose=True
)

# Execute
result = crew.kickoff()
```

#### AutoGen

```python
from autogen import AssistantAgent, UserProxyAgent

# Create agents
assistant = AssistantAgent(
  name="assistant",
  system_message="You are a helpful AI assistant",
  llm_config={"model": "gpt-4", "api_key": "..."}
)

user_proxy = UserProxyAgent(
  name="user",
  human_input_mode="TERMINATE",
  max_consecutive_auto_reply=10,
  code_execution_config={"work_dir": "."}
)

# Chat
user_proxy.initiate_chat(
  assistant,
  message="Analyze this dataset and provide insights"
)
```

## Многошаговые системы и Reasoning

### 1. Chain of Thought (CoT)

```python
# Явный запрос к модели "думать пошагово"
prompt = """
Решите задачу пошагово:

Задача: Маша купила 3 яблока по $2 каждое и 2 апельсина по $3 каждый.
Сколько она потратила?

Шаг 1: Рассчитайте стоимость яблок
Шаг 2: Рассчитайте стоимость апельсинов
Шаг 3: Суммируйте
"""

response = llm.invoke(prompt)
# Модель явно показывает reasoning
```

### 2. ReAct (Reasoning + Acting)

```python
# Чередование мышления и действия
agent_prompt = """
You are a helpful assistant. Use the following format:

Question: the input question
Thought: you should always think about what to do
Action: the action to take (must be one of [{tool_names}])
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:"""
```

### 3. Tree of Thought (ToT)

```python
# Исследование нескольких путей решения
class TreeOfThoughtAgent:
    def solve(self, problem):
        # 1. Generate multiple possible approaches
        approaches = self.generate_approaches(problem, num=3)

        # 2. Evaluate each approach
        results = []
        for approach in approaches:
            # Execute steps in approach
            steps = self.plan_steps(approach)
            result = self.execute_steps(steps)
            score = self.evaluate(result)
            results.append((approach, result, score))

        # 3. Return best result
        return max(results, key=lambda x: x[2])
```

### 4. Self-Reflection

```python
class ReflectiveAgent:
    def execute_with_reflection(self, task):
        # Execute initial plan
        result = self.execute_plan(task)

        # Self-evaluate
        critique = self.llm.critique(task, result)

        if not critique["is_good"]:
            # Try to improve
            improved_plan = self.revise_plan(task, critique)
            result = self.execute_plan(improved_plan)

        return result
```

## Production-Ready примеры

### Пример 1: Асистент аналитики данных

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

# Tools
@tool
def query_database(sql: str) -> str:
    """Execute SQL query and return results"""
    conn = psycopg2.connect("...")
    df = pd.read_sql(sql, conn)
    return df.to_json()

@tool
def create_visualization(data: str, chart_type: str) -> str:
    """Create and save visualization"""
    df = pd.read_json(data)
    plt.figure(figsize=(10, 6))
    if chart_type == "bar":
        df.plot(kind="bar")
    elif chart_type == "line":
        df.plot(kind="line")
    plt.savefig("chart.png")
    return "Chart saved to chart.png"

@tool
def explain_data(data: str) -> str:
    """Provide statistical analysis"""
    df = pd.read_json(data)
    stats = {
        "mean": df.mean().to_dict(),
        "median": df.median().to_dict(),
        "std": df.std().to_dict()
    }
    return json.dumps(stats)

# Create agent
tools = [query_database, create_visualization, explain_data]
llm = ChatOpenAI(model="gpt-4", temperature=0)

agent = create_react_agent(llm, tools)
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=10
)

# Usage
query = """
Analyze sales data for Q3 2024:
1. Get total sales by region
2. Create visualization
3. Provide statistical insights
4. Identify top-performing regions
"""

result = executor.invoke({"input": query})
print(result["output"])
```

### Пример 2: Multi-Agent система для research

```python
from crewai import Agent, Task, Crew

# Agent 1: Research
researcher = Agent(
    role="Research Specialist",
    goal="Gather comprehensive information",
    backstory="Experienced researcher",
    tools=[web_search, document_analysis],
    memory=True,
    max_iter=5
)

# Agent 2: Analysis
analyst = Agent(
    role="Data Analyst",
    goal="Analyze and interpret findings",
    backstory="Expert analyst with statistics background",
    tools=[data_analysis, visualization],
    memory=True,
    max_iter=5
)

# Agent 3: Report Writer
writer = Agent(
    role="Technical Writer",
    goal="Create comprehensive reports",
    backstory="Excellent communicator",
    tools=[document_creation, formatting],
    memory=True,
    max_iter=3
)

# Tasks with dependencies
task1 = Task(
    description="Research AI market trends for 2024",
    agent=researcher,
    expected_output="Detailed research findings"
)

task2 = Task(
    description="Analyze research findings statistically",
    agent=analyst,
    expected_output="Statistical analysis report"
)

task3 = Task(
    description="Create executive summary from findings",
    agent=writer,
    expected_output="Professional report"
)

# Crew
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[task1, task2, task3],
    verbose=True,
    process=Process.sequential  # Tasks run in order
)

result = crew.kickoff()
print(result)
```

## Best Practices

### 1. Управление контекстом

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

        # Keep only recent interactions
        if len(self.memory) > self.max_memory:
            self.memory = self.memory[-self.max_memory:]

    def get_context(self):
        # Summarize memory for LLM
        return "\n".join([
            f"- {m['action']}: {m['observation'][:100]}"
            for m in self.memory[-10:]
        ])
```

### 2. Обработка ошибок

```python
class RobustAgent:
    def execute_with_retry(self, task, max_retries=3):
        for attempt in range(max_retries):
            try:
                result = self.agent.run(task)
                return result
            except APIError as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff
                    time.sleep(wait_time)
                    continue
                else:
                    raise
            except ValidationError as e:
                # Fix and retry with better prompt
                refined_task = self.refine_task(task, str(e))
                continue
```

### 3. Мониторинг и логирование

```python
import logging
from datetime import datetime

logger = logging.getLogger("agent")

class MonitoredAgent:
    def execute(self, task):
        start_time = datetime.now()

        logger.info(f"Task started: {task}")

        try:
            result = self.agent.run(task)
            duration = (datetime.now() - start_time).total_seconds()

            logger.info(f"Task completed in {duration}s")
            return result
        except Exception as e:
            logger.error(f"Task failed: {str(e)}")
            raise
```

### 4. Тестирование агентов

```python
def test_agent_accuracy():
    """Test agent on known tasks"""
    test_cases = [
        {
            "input": "What is 15 * 4?",
            "expected": "60"
        },
        {
            "input": "Find articles about AI agents",
            "expected_contains": ["agent", "AI"]
        }
    ]

    for test in test_cases:
        result = agent.run(test["input"])
        assert str(test["expected"]) in result["output"]

def test_agent_reliability():
    """Run same task multiple times"""
    task = "Summarize machine learning importance"
    results = [agent.run(task)["output"] for _ in range(5)]

    # Check consistency
    assert len(set(results)) > 1  # Different variations OK
    assert all("machine learning" in r for r in results)
```

## Затраты и оптимизация

### Cost Breakdown

```
Per request costs (using GPT-4):
- Main LLM call: ~$0.03
- Tool calls (avg 3): ~$0.005 × 3 = $0.015
- Vector search (embeddings): ~$0.001
- Total per request: ~$0.046

Cost optimization:
- Use gpt-3.5-turbo for planning: -60% cost
- Cache tool results: -30% API calls
- Batch similar requests: -20% overhead
- Use local embeddings: -0.001 per request

Optimized cost: ~$0.014 per request (70% reduction)
```

## Заключение

AI-агенты - это будущее автоматизации и интеллектуальных систем:

✅ **Автономность** - агенты работают без постоянного контроля
✅ **Инструменты** - расширяют возможности LLM за пределы текста
✅ **Многошаговость** - решают сложные задачи пошагово
✅ **Адаптивность** - учатся на опыте взаимодействия
✅ **Масштабируемость** - multi-agent системы координируют работу

### Следующие шаги:

1. Выбрать фреймворк (LangChain, CrewAI, AutoGen)
2. Определить инструменты для вашего сценария
3. Спроектировать reasoning стратегию (CoT, ReAct, ToT)
4. Реализовать с обработкой ошибок
5. Тестировать и мониторить production агента

---

**Хотите помощь в разработке AI-агента для вашего проекта?** Свяжитесь с нашей командой экспертов по AI. Мы помогим спроектировать, развернуть и оптимизировать агента для ваших специфических задач.
