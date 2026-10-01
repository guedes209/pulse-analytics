import { z } from 'zod';

export const EventSchema = z.object({
  event_type: z.enum(['pageview', 'click']),
  url: z.string().url(),
  timestamp: z.string().datetime({ offset: true }).or(z.string()), // Accept any ISO string, or let it be just a string for ClickHouse
  user_agent: z.string().optional().default(''),
  element_metadata: z.string().optional().default(''),
});

export type AnalyticsEvent = z.infer<typeof EventSchema>;
