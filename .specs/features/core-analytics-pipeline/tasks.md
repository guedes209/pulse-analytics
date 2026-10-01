# Tasks: Core Analytics Pipeline

## Phase 1: Specify & Design
- [x] **Task 1.1:** Create `spec.md` with EARS requirements and acceptance criteria.
- [x] **Task 1.2:** Create architecture documentation (`architecture.md`).
- [x] **Task 1.3:** Define high-level `docker-compose.yml` for data infrastructure.
- [ ] **Gate:** User approval of the `.specs` planning artifacts.

## Phase 2: Data Infrastructure Setup
- [ ] **Task 2.1:** Create `docker-compose.yml` in the project root to provision Apache Kafka and ClickHouse.
- [ ] **Task 2.2:** Configure ClickHouse SQL initialization scripts (`init.sql`):
  - Create Kafka Engine table.
  - Create target MergeTree table (`events`).
  - Create Materialized View to link Kafka table to MergeTree table.
- [ ] **Gate:** Validate infrastructure by manually producing a message to Kafka and querying ClickHouse.

## Phase 3: Ingestion API (Node.js/TypeScript)
- [ ] **Task 3.1:** Initialize Node.js/TypeScript project for the Ingestion API.
- [ ] **Task 3.2:** Implement basic HTTP server (e.g., Fastify) with CORS enabled.
- [ ] **Task 3.3:** Implement schema validation for incoming events (`pageview`, `click`).
- [ ] **Task 3.4:** Integrate Kafka Producer to publish validated events to the `events_topic`.
- [ ] **Gate:** Write and run tests for event ingestion.

## Phase 4: Tracker SDK (Vanilla JS)
- [ ] **Task 4.1:** Create `tracker.js` script.
- [ ] **Task 4.2:** Implement `pageview` auto-tracking on load.
- [ ] **Task 4.3:** Implement `click` tracking for configured elements.
- [ ] **Task 4.4:** Implement batching/sending mechanism (using `fetch` or `navigator.sendBeacon`).
- [ ] **Gate:** Test SDK locally using a simple HTML page.

## Phase 5: Analytics API & Dashboard
- [ ] **Task 5.1:** Initialize React + Vite project for the Dashboard.
- [ ] **Task 5.2:** Initialize Node.js/TypeScript project for the Analytics API.
- [ ] **Task 5.3:** Implement ClickHouse client in the Analytics API to query aggregated data.
- [ ] **Task 5.4:** Create endpoints for Dashboard metrics.
- [ ] **Task 5.5:** Implement real-time charts in the React Dashboard polling the Analytics API.
- [ ] **Gate:** End-to-end test: trigger an event via SDK and visualize it on the Dashboard.
