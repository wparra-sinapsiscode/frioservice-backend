"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env['PORT'] || 3001;
const gracefulShutdown = () => {
    console.log('\n🔄 Iniciando cierre graceful del servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('❌ Forzando cierre del servidor');
        process.exit(1);
    }, 10000);
};
const server = app_1.default.listen(PORT, () => {
    console.log('🚀 ===================================');
    console.log('🚀  FrioService Backend iniciado');
    console.log('🚀 ===================================');
    console.log(`🌐 Servidor ejecutándose en puerto: ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env['NODE_ENV'] || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📡 API base: http://localhost:${PORT}/api`);
    console.log('🚀 ===================================');
});
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} ya está en uso`);
        process.exit(1);
    }
    else {
        console.error('❌ Error del servidor:', error);
        process.exit(1);
    }
});
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
exports.default = server;
//# sourceMappingURL=server.js.map