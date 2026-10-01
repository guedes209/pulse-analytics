import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getMetrics } from './clickhouse.js';

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: '*', // Allow Dashboard to connect
});

fastify.get('/metrics', async (request, reply) => {
  try {
    const data = await getMetrics();
    return reply.send({ status: 'success', data });
  } catch (error: any) {
    fastify.log.error(error);
    return reply.status(500).send({ status: 'error', message: error.message });
  }
});

const start = async () => {
  try {
    // Port 3001 for Analytics API to avoid conflict with Ingestion API on 3000
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('📊 Analytics API running at http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
