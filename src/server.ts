import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import 'dotenv/config';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { loadEnvironment } from './config/env.js';

const startServer = async (): Promise<void> => {
  try {
    const env = loadEnvironment();

    await connectDatabase({
      uri: env.mongodbUri,
      dbName: env.mongodbDbName
    });

    app.listen(env.port, () => {
      console.log(`API disponible en http://localhost:${env.port}`);
    });
   } catch (error) {
console.error(error instanceof Error ? `${error.name}: ${error.message}` : 'Error desconocido');    console.error(
      'No fue posible iniciar la API. Revise MONGODB_URI, ' +
      'el usuario y la lista de acceso de red.'
    );
    process.exitCode = 1;
  }
};

void startServer();
