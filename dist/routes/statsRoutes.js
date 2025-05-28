"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = require("../controllers/statsController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const ServiceStatsQuerySchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    endDate: zod_1.z.string().datetime().optional().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    technicianId: zod_1.z.string().cuid().optional(),
    clientId: zod_1.z.string().cuid().optional()
}).optional();
const IncomeStatsQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['month', 'quarter', 'year']).optional()
}).optional();
const EmptyQuerySchema = zod_1.z.object({}).optional();
router.get('/dashboard', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(EmptyQuerySchema), statsController_1.StatsController.getDashboardStats);
router.get('/services', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(ServiceStatsQuerySchema), statsController_1.StatsController.getServiceStats);
router.get('/income', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(IncomeStatsQuerySchema), statsController_1.StatsController.getIncomeStats);
router.get('/technicians/rankings', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(EmptyQuerySchema), statsController_1.StatsController.getTechnicianRankings);
router.get('/overview', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(EmptyQuerySchema), statsController_1.StatsController.getSystemOverview);
router.get('/transactions/recent', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(zod_1.z.object({ limit: zod_1.z.string().optional() }).optional()), statsController_1.StatsController.getRecentTransactions);
router.get('/equipment/services', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(EmptyQuerySchema), statsController_1.StatsController.getServicesByEquipment);
router.get('/technicians/efficiency', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(zod_1.z.object({ technicianId: zod_1.z.string().cuid().optional() }).optional()), statsController_1.StatsController.getTechnicianEfficiency);
router.get('/clients/rankings', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(EmptyQuerySchema), statsController_1.StatsController.getClientRankings);
router.get('/realtime', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(EmptyQuerySchema), statsController_1.StatsController.getRealtimeMetrics);
exports.default = router;
//# sourceMappingURL=statsRoutes.js.map