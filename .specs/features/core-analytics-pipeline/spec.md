# Specification: Core Analytics Pipeline

## 1. Feature Overview
The `core-analytics-pipeline` is the foundational feature of the PulseAnalytics MVP. It handles the complete lifecycle of a web analytics event: from capturing user interactions in the browser (via a Tracker SDK) to ingesting, queuing, processing, and making the aggregated data available for real-time visualization on a Dashboard.

## 2. Requirements (EARS Syntax)

### 2.1 Tracker SDK
- **REQ-01:** When a user visits a webpage containing the Tracker SDK, the system shall capture a `pageview` event with the URL, timestamp, and user agent.
- **REQ-02:** When a user clicks on a tracked element, the system shall capture a `click` event with the element's metadata and timestamp.
- **REQ-03:** When an event is captured, the system shall transmit the event payload via HTTP to the Ingestion API.

### 2.2 Ingestion API
- **REQ-04:** When the Ingestion API receives an HTTP event payload, the system shall validate the payload structure.
- **REQ-05:** When a valid event payload is received, the system shall publish the event to the configured Apache Kafka topic (`events_topic`).
- **REQ-06:** When the event is successfully published to Kafka, the system shall return an HTTP 200 OK response to the Tracker SDK.

### 2.3 Data Infrastructure & Processing (ClickHouse)
- **REQ-07:** While Kafka and ClickHouse are running, the ClickHouse Kafka Engine shall continuously consume events from the `events_topic`.
- **REQ-08:** When an event is consumed by the Kafka Engine, a Materialized View shall transform and insert the event into a MergeTree table (`events`).

### 2.4 Analytics API & Dashboard
- **REQ-09:** When the Analytics API receives a query request for aggregations, the system shall execute an OLAP query against the ClickHouse `events` table.
- **REQ-10:** When the Dashboard is loaded, the system shall fetch real-time aggregations from the Analytics API and render the charts.

## 3. Acceptance Criteria
- **AC-1:** The Tracker SDK correctly sends `pageview` and `click` events to the Ingestion API.
- **AC-2:** The Ingestion API successfully validates and publishes events to Kafka with < 50ms latency.
- **AC-3:** ClickHouse automatically ingests data from Kafka and makes it available in the `events` table within < 2 seconds of publish time.
- **AC-4:** The Analytics API can query ClickHouse and return aggregated data.
- **AC-5:** The React Dashboard correctly displays the aggregated metrics in real-time.

## 4. Traceability
- **Epic:** MVP Analytics Core
- **Dependencies:** Docker infrastructure (Kafka, Zookeeper, ClickHouse).
