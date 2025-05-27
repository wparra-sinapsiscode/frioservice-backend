"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes"));
const quoteRoutes_1 = __importDefault(require("./routes/quoteRoutes"));
const technicianRoutes_1 = __importDefault(require("./routes/technicianRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
if (process.env['NODE_ENV'] === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use(express_1.default.json({
    limit: '10mb',
    strict: true
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '10mb'
}));
app.set('trust proxy', 1);
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'public', 'uploads')));
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'FrioService Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development',
        version: '1.0.0'
    });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/services', serviceRoutes_1.default);
app.use('/api/clients', clientRoutes_1.default);
app.use('/api/equipment', equipmentRoutes_1.default);
app.use('/api/quotes', quoteRoutes_1.default);
app.use('/api/technicians', technicianRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
app.get('/api', (_req, res) => {
    res.status(200).json({
        message: 'FrioService API v1.0.0',
        documentation: '/api/docs',
        health: '/health',
        endpoints: {
            auth: '/api/auth',
            services: '/api/services',
            clients: '/api/clients',
            technicians: '/api/technicians',
            equipment: '/api/equipment',
            quotes: '/api/quotes',
            stats: '/api/stats'
        }
    });
});
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack })
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map