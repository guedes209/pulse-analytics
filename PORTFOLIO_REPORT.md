# PulseAnalytics: Architecture Highlights & Portfolio Report

Este relatório destaca as principais decisões arquiteturais tomadas durante o desenvolvimento do **PulseAnalytics**. O objetivo deste documento é servir como um forte diferencial para portfólio, demonstrando o uso de padrões avançados de Engenharia de Software e Engenharia de Dados voltados para **Big Data**, **Alta Vazão (High-Throughput)** e **Baixa Latência**.

---

## 1. Desacoplamento via Arquitetura Orientada a Eventos (EDA)
Ao invés de realizar inserções diretas no banco de dados a cada requisição HTTP, a API de Ingestão atua puramente como um **Edge Node** (Producer), jogando a carga para um Message Broker (Apache Kafka).

**Por que é um diferencial?**
- Permite que a API suporte picos gigantescos de acessos (milhões de requisições) sem sobrecarregar o banco de dados.
- Caso o banco de dados caia ou precise de manutenção, o Kafka atua como *buffer*, retendo as mensagens com segurança até que o processamento seja restaurado.

**Exemplo no código (`ingestion-api/src/index.ts`):**
```typescript
// A API apenas valida e joga o evento no Kafka de forma assíncrona, 
// respondendo rapidamente ao cliente (baixa latência HTTP).
await producer.send({
  topic: 'events_topic',
  messages: [{ value: JSON.stringify(payload) }],
});
return reply.status(200).send({ status: 'success' });
```

---

## 2. Padrão CQRS (Command Query Responsibility Segregation)
Nós dividimos a aplicação em duas APIs distintas: uma exclusiva para escrita (`ingestion-api`) e outra exclusiva para leitura (`analytics-api`).

**Por que é um diferencial?**
- Escala independente: Se o dashboard for muito acessado, escalamos apenas a API de Analytics. Se o tráfego do site monitorado explodir, escalamos apenas a API de Ingestão.
- Segurança e Isolamento: Falhas ou gargalos nas consultas analíticas não derrubam a captação de novos dados.

---

## 3. Ingestão Direta "Zero-ETL" no ClickHouse
Geralmente, arquiteturas tradicionais exigem um consumidor intermediário (como Apache Flink, Spark ou um worker Node.js) para ler do Kafka e gravar no banco. Nós utilizamos um modelo moderno de **"Zero-ETL"** configurando o próprio ClickHouse para ler diretamente do tópico Kafka.

**Por que é um diferencial?**
- Reduz a complexidade da infraestrutura e custos operacionais.
- A latência entre a geração do dado e sua visualização (Time-to-Insight) cai para milissegundos.

**Exemplo no código (`init-db.sql`):**
```sql
-- O próprio banco de dados gerencia o consumo dos eventos em tempo real
CREATE TABLE IF NOT EXISTS default.kafka_events (...)
ENGINE = Kafka
SETTINGS kafka_broker_list = 'kafka:29092', kafka_topic_list = 'events_topic';

-- Uma ponte nativa (Materialized View) puxa do Kafka e insere na tabela principal
CREATE MATERIALIZED VIEW default.events_mv TO default.events AS
SELECT * FROM default.kafka_events;
```

---

## 4. Modelagem OLAP Columnar (MergeTree Engine)
Bancos relacionais comuns (PostgreSQL, MySQL) organizam os dados por linhas e não suportam consultas analíticas agregadas eficientes para grandes volumes de dados. Usamos o **ClickHouse** com a engine **MergeTree**, que é um SGBD Colunar projetado para OLAP (Online Analytical Processing).

**Por que é um diferencial?**
- Permite varrer bilhões de registros em milissegundos para gerar os gráficos.
- O particionamento temporal garante compressão extrema de dados e economia de disco.

**Exemplo no código (`analytics-api/src/clickhouse.ts`):**
```sql
-- Utilizamos funções otimizadas de agrupamento temporal (toStartOfMinute)
-- nativas do ecossistema ClickHouse para criar séries temporais ultrarrápidas
SELECT
    toStartOfMinute(timestamp) AS minute,
    event_type,
    count() AS count
FROM default.events
WHERE timestamp >= now() - INTERVAL 1 HOUR
GROUP BY minute, event_type
ORDER BY minute ASC
```

---

## 5. Resiliência de Tracking no Frontend (Beacon API)
O envio de eventos analíticos não pode prejudicar a navegação do usuário e nem se perder caso a aba do navegador seja fechada bruscamente.

**Por que é um diferencial?**
- Demonstra conhecimento sênior em Web APIs e performance no client-side. Em vez de travar o Event Loop com requisições bloqueantes, usamos a moderna API `navigator.sendBeacon`.

**Exemplo no código (`tracker-sdk/tracker.js`):**
```javascript
// O sendBeacon delega o envio da requisição para o background do navegador.
// Mesmo se o usuário fechar a aba instantaneamente após clicar em algo,
// o navegador garante que a requisição HTTP será despachada.
if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(CONFIG.apiEndpoint, blob);
} else {
    // Fallback gracioso para navegadores antigos
    fetch(...)
}
```

---

## Conclusão
O **PulseAnalytics** não é apenas um CRUD tradicional; é um sistema **Data-Intensive** em tempo real. As escolhas arquiteturais empregadas provam maturidade em escalar aplicações, isolar falhas, processar streaming de eventos e utilizar as ferramentas adequadas (ClickHouse, Kafka) para os problemas corretos (OLAP e Fila).
