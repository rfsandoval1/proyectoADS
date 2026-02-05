"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const env_1 = require("./config/env");
const PORT = env_1.config.port || 4000;
async function main() {
    try {
        const app = await (0, server_1.initializeServer)();
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en puerto ${PORT}`);
            console.log(`URL: ${env_1.config.backendUrl}`);
            console.log(`Entorno: ${env_1.config.nodeEnv}`);
        });
    }
    catch (error) {
        console.error('Error iniciando servidor:', error);
        process.exit(1);
    }
}
main();
