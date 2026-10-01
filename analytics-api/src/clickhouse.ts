import { createClient } from '@clickhouse/client';

export const clickhouse = createClient({
  url: 'http://localhost:8123',
  database: 'default',
  // username: 'default', // Using default user
  // password: '',
});

export const getMetrics = async () => {
  // Query to aggregate pageviews and clicks per minute for the last hour
  const query = `
    SELECT
        toStartOfMinute(timestamp) AS minute,
        event_type,
        count() AS count
    FROM default.events
    WHERE timestamp >= now() - INTERVAL 1 HOUR
    GROUP BY minute, event_type
    ORDER BY minute ASC
  `;

  const resultSet = await clickhouse.query({
    query,
    format: 'JSONEachRow',
  });

  return resultSet.json();
};
