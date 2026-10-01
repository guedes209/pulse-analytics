import Fastify from 'fastify';
import cors from '@fastify/cors';
import { EventSchema } from './schema.js';
import { producer, connectProducer, disconnectProducer } from './kafka.js';

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: true, // Reflects the request origin (supports 'null' for local files)
  credentials: true, // Required for navigator.sendBeacon
});

fastify.post('/collect', async (request, reply) => {
  try {
    // 1. Validate payload
    const eventData = EventSchema.parse(request.body);

    // 2. Format timestamp for ClickHouse if needed (ClickHouse DateTime expects YYYY-MM-DD HH:MM:SS or allows ISO if parsed correctly)
    // We will just let ClickHouse parse it (it handles basic strings in JSONEachRow, but replacing T with space helps)
    const formattedTimestamp = eventData.timestamp.replace('T', ' ').substring(0, 19);
    
    const payload = {
      ...eventData,
      timestamp: formattedTimestamp,
    };

    // 3. Produce to Kafka
    await producer.send({
      topic: 'events_topic',
      messages: [
        { value: JSON.stringify(payload) },
      ],
    });

    return reply.status(200).send({ status: 'success', message: 'Event queued' });
  } catch (err: any) {
    fastify.log.error(err);
    return reply.status(400).send({ status: 'error', message: err.errors || err.message });
  }
});

const start = async () => {
  try {
    await connectProducer();
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Ingestion API running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await disconnectProducer();
  await fastify.close();
  process.exit(0);
});
