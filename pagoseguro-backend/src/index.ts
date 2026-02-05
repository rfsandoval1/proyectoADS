import { initializeServer } from './server';
import { config } from './config/env';

const PORT = config.port || 4000;

async function main() {
  try {
    const app = await initializeServer();
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`URL: ${config.backendUrl}`);
      console.log(`Entorno: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

main();
