import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: 'mail-service',
    brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
})