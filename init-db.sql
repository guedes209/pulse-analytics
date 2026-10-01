-- 1. Create target MergeTree table for Analytics
CREATE TABLE IF NOT EXISTS default.events
(
    event_id UUID DEFAULT generateUUIDv4(),
    event_type String,
    url String,
    timestamp DateTime,
    user_agent String,
    element_metadata String,
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (event_type, timestamp);

-- 2. Create Kafka Engine table to consume from topic
CREATE TABLE IF NOT EXISTS default.kafka_events
(
    event_type String,
    url String,
    timestamp DateTime,
    user_agent String,
    element_metadata String
)
ENGINE = Kafka
SETTINGS kafka_broker_list = 'kafka:29092',
         kafka_topic_list = 'events_topic',
         kafka_group_name = 'clickhouse_consumer_group',
         kafka_format = 'JSONEachRow';

-- 3. Create Materialized View to move data from Kafka to MergeTree
CREATE MATERIALIZED VIEW IF NOT EXISTS default.events_mv TO default.events AS
SELECT
    event_type,
    url,
    timestamp,
    user_agent,
    element_metadata
FROM default.kafka_events;
