import { Kafka, type Producer } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'ingestion-api',
  brokers: ['localhost:9092'], // Connects directly to the localhost port mapped by Docker Compose
});

export const producer: Producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
  console.log('✅ Kafka Producer connected');
};

export const disconnectProducer = async () => {
  await producer.disconnect();
  console.log('❌ Kafka Producer disconnected');
};
