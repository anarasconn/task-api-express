import mongoose from 'mongoose';
import { env } from './env.js';

export interface DatabaseConfig {
  uri: string;
  dbName: string;
}

export const connectDatabase = async (
  config?: DatabaseConfig
): Promise<void> => {
  const uri = config?.uri ?? env.MONGODB_URI;
  const dbName = config?.dbName ?? env.MONGODB_DB_NAME;
  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 5000
  });
  console.log('Conexión con MongoDB establecida.');
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('Conexión con MongoDB cerrada.');
};
