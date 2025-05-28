import { Router } from 'express';
import { StatsController } from '../controllers/statsController';
import { authenticate, authorize } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Esquemas de validación con Zod para query parameters

// Schema para filtros de estadísticas de servicios
const ServiceStatsQuerySchema = z.object({
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  technicianId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional()
}).optional();

// Schema para período de estadísticas de ingresos
const IncomeStatsQuerySchema = z.object({
  period: z.enum(['month', 'quarter', 'year']).optional()
}).optional();

// Schema vacío para endpoints sin query params
const EmptyQuerySchema = z.object({}).optional();

/**
 * Obtiene estadísticas generales para el dashboard
 * GET /api/stats/dashboard
 * Requiere: ADMIN
 */
router.get('/dashboard',
  authorize('ADMIN'),
  validateQuery(EmptyQuerySchema),
  StatsController.getDashboardStats
);

/**
 * Obtiene estadísticas detalladas de servicios con filtros opcionales
 * GET /api/stats/services?startDate=2025-01-01&endDate=2025-12-31&technicianId=xxx&clientId=yyy
 * Requiere: ADMIN
 */
router.get('/services',
  authorize('ADMIN'),
  validateQuery(ServiceStatsQuerySchema),
  StatsController.getServiceStats
);

/**
 * Obtiene estadísticas de ingresos por período
 * GET /api/stats/income?period=month|quarter|year
 * Requiere: ADMIN
 */
router.get('/income',
  authorize('ADMIN'),
  validateQuery(IncomeStatsQuerySchema),
  StatsController.getIncomeStats
);

/**
 * Obtiene rankings de técnicos (top performers)
 * GET /api/stats/technicians/rankings
 * Requiere: ADMIN
 */
router.get('/technicians/rankings',
  authorize('ADMIN'),
  validateQuery(EmptyQuerySchema),
  StatsController.getTechnicianRankings
);

/**
 * Obtiene overview general del sistema (dashboard + top técnicos)
 * GET /api/stats/overview
 * Requiere: ADMIN
 */
router.get('/overview',
  authorize('ADMIN'),
  validateQuery(EmptyQuerySchema),
  StatsController.getSystemOverview
);

/**
 * Obtiene transacciones recientes
 * GET /api/stats/transactions/recent?limit=10
 * Requiere: ADMIN
 */
router.get('/transactions/recent',
  authorize('ADMIN'),
  validateQuery(z.object({ limit: z.string().optional() }).optional()),
  StatsController.getRecentTransactions
);

/**
 * Obtiene métricas en tiempo real
 * GET /api/stats/realtime
 * Requiere: ADMIN
 */
router.get('/realtime',
  authorize('ADMIN'),
  validateQuery(EmptyQuerySchema),
  StatsController.getRealtimeMetrics
);

export default router;