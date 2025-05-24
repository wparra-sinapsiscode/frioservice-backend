import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Routes
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import clientRoutes from './routes/clientRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import quoteRoutes from './routes/quoteRoutes';
import uploadRoutes from './routes/uploadRoutes';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuración
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Logging middleware
if (process.env['NODE_ENV'] === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true 
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Trust proxy (for production behind reverse proxy)
app.set('trust proxy', 1);

// Servir archivos estáticos desde la carpeta public/uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'FrioService Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/upload', uploadRoutes);

// API info endpoint
app.get('/api', (_req, res) => {
  res.status(200).json({
    message: 'FrioService API v1.0.0',
    documentation: '/api/docs',
    health: '/health',
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      clients: '/api/clients',
      equipment: '/api/equipment',
      quotes: '/api/quotes',
      upload: '/api/upload'
    }
  });
});

// 404 handler - Temporarily disabled for debugging
// app.all('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Endpoint no encontrado',
//     path: req.originalUrl,
//     method: req.method
//   });
// });

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack })
  });
});

export default app;