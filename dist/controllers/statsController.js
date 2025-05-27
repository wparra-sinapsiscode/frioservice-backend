"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const statsService_1 = require("../services/statsService");
class StatsController {
    static async getDashboardStats(_req, res) {
        try {
            console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo estadísticas del dashboard');
            console.log('🔥🔥🔥 User requesting dashboard stats:', _req.user?.role, _req.user?.userId);
            const stats = await statsService_1.StatsService.getDashboardStats();
            console.log('🔥🔥🔥 2. STATS CONTROLLER: Estadísticas del dashboard obtenidas exitosamente');
            console.log('🔥🔥🔥 Dashboard stats preview:', {
                totalServices: stats.totalServices.total,
                totalClients: stats.totalClients,
                totalTechnicians: stats.totalTechnicians,
                monthlyIncome: stats.monthlyIncome.current,
                pendingQuotes: stats.pendingQuotes
            });
            res.status(200).json({
                success: true,
                message: 'Estadísticas del dashboard obtenidas exitosamente',
                data: stats
            });
        }
        catch (error) {
            console.error('🔥🔥🔥 ERROR en getDashboardStats:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener estadísticas del dashboard',
                error: error.message || 'Unknown error'
            });
        }
    }
    static async getServiceStats(req, res) {
        try {
            const { startDate, endDate, technicianId, clientId } = req.query;
            console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo estadísticas de servicios');
            console.log('🔥🔥🔥 Service stats filters:', {
                startDate,
                endDate,
                technicianId,
                clientId,
                userRole: req.user?.role
            });
            const filters = {};
            if (startDate) {
                try {
                    filters.startDate = new Date(startDate);
                    console.log('🔥🔥🔥 Start date parsed:', filters.startDate);
                }
                catch (error) {
                    console.error('🔥🔥🔥 Error parsing startDate:', error);
                    res.status(400).json({
                        success: false,
                        message: 'Formato de fecha de inicio inválido. Use formato ISO (YYYY-MM-DD)'
                    });
                    return;
                }
            }
            if (endDate) {
                try {
                    filters.endDate = new Date(endDate);
                    console.log('🔥🔥🔥 End date parsed:', filters.endDate);
                }
                catch (error) {
                    console.error('🔥🔥🔥 Error parsing endDate:', error);
                    res.status(400).json({
                        success: false,
                        message: 'Formato de fecha de fin inválido. Use formato ISO (YYYY-MM-DD)'
                    });
                    return;
                }
            }
            if (technicianId && typeof technicianId === 'string') {
                filters.technicianId = technicianId;
            }
            if (clientId && typeof clientId === 'string') {
                filters.clientId = clientId;
            }
            const stats = await statsService_1.StatsService.getServiceStats(filters);
            console.log('🔥🔥🔥 2. STATS CONTROLLER: Estadísticas de servicios obtenidas exitosamente');
            console.log('🔥🔥🔥 Service stats preview:', {
                totalServices: stats.totalServices,
                servicesByType: stats.servicesByType.length,
                servicesByStatus: stats.servicesByStatus.length,
                averageCompletionTime: stats.averageCompletionTime
            });
            res.status(200).json({
                success: true,
                message: 'Estadísticas de servicios obtenidas exitosamente',
                data: stats,
                filters: filters
            });
        }
        catch (error) {
            console.error('🔥🔥🔥 ERROR en getServiceStats:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener estadísticas de servicios',
                error: error.message || 'Unknown error'
            });
        }
    }
    static async getIncomeStats(req, res) {
        try {
            const { period } = req.query;
            console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo estadísticas de ingresos');
            console.log('🔥🔥🔥 Income stats period:', period, 'userRole:', req.user?.role);
            const validPeriods = ['month', 'quarter', 'year'];
            const selectedPeriod = period || 'month';
            if (!validPeriods.includes(selectedPeriod)) {
                console.error('🔥🔥🔥 Invalid period provided:', selectedPeriod);
                res.status(400).json({
                    success: false,
                    message: `Período inválido. Valores válidos: ${validPeriods.join(', ')}`
                });
                return;
            }
            const stats = await statsService_1.StatsService.getIncomeStats(selectedPeriod);
            console.log('🔥🔥🔥 2. STATS CONTROLLER: Estadísticas de ingresos obtenidas exitosamente');
            console.log('🔥🔥🔥 Income stats preview:', {
                period: selectedPeriod,
                currentIncome: stats.currentPeriod.income,
                previousIncome: stats.previousPeriod.income,
                growth: stats.previousPeriod.growth,
                projection: stats.projection,
                incomeByTypeCount: stats.incomeByType.length
            });
            res.status(200).json({
                success: true,
                message: `Estadísticas de ingresos del ${selectedPeriod === 'month' ? 'mes' : selectedPeriod === 'quarter' ? 'trimestre' : 'año'} obtenidas exitosamente`,
                data: stats,
                period: selectedPeriod
            });
        }
        catch (error) {
            console.error('🔥🔥🔥 ERROR en getIncomeStats:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener estadísticas de ingresos',
                error: error.message || 'Unknown error'
            });
        }
    }
    static async getTechnicianRankings(_req, res) {
        try {
            console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo rankings de técnicos');
            console.log('🔥🔥🔥 User requesting technician rankings:', _req.user?.role, _req.user?.userId);
            const rankings = await statsService_1.StatsService.getTechnicianRankings();
            console.log('🔥🔥🔥 2. STATS CONTROLLER: Rankings de técnicos obtenidos exitosamente');
            console.log('🔥🔥🔥 Technician rankings preview:', {
                topByServicesCount: rankings.topByServices.length,
                topByRatingCount: rankings.topByRating.length,
                topByEfficiencyCount: rankings.topByEfficiency.length,
                topPerformer: rankings.topByServices[0]?.name || 'N/A',
                topRated: rankings.topByRating[0]?.name || 'N/A',
                mostEfficient: rankings.topByEfficiency[0]?.name || 'N/A'
            });
            res.status(200).json({
                success: true,
                message: 'Rankings de técnicos obtenidos exitosamente',
                data: rankings
            });
        }
        catch (error) {
            console.error('🔥🔥🔥 ERROR en getTechnicianRankings:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener rankings de técnicos',
                error: error.message || 'Unknown error'
            });
        }
    }
    static async getSystemOverview(_req, res) {
        try {
            console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo overview del sistema');
            console.log('🔥🔥🔥 User requesting system overview:', _req.user?.role);
            const [dashboardStats, technicianRankings] = await Promise.all([
                statsService_1.StatsService.getDashboardStats(),
                statsService_1.StatsService.getTechnicianRankings()
            ]);
            const overview = {
                dashboard: dashboardStats,
                topTechnicians: technicianRankings.topByServices.slice(0, 3),
                quickStats: {
                    totalServices: dashboardStats.totalServices.total,
                    activeClients: dashboardStats.totalClients,
                    availableTechnicians: dashboardStats.totalTechnicians,
                    monthlyIncome: dashboardStats.monthlyIncome.current,
                    completedThisMonth: dashboardStats.completedServicesThisMonth.current,
                    pendingQuotes: dashboardStats.pendingQuotes
                },
                lastUpdated: new Date().toISOString()
            };
            console.log('🔥🔥🔥 2. STATS CONTROLLER: Overview del sistema obtenido exitosamente');
            console.log('🔥🔥🔥 System overview quick stats:', overview.quickStats);
            res.status(200).json({
                success: true,
                message: 'Overview del sistema obtenido exitosamente',
                data: overview
            });
        }
        catch (error) {
            console.error('🔥🔥🔥 ERROR en getSystemOverview:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener overview del sistema',
                error: error.message || 'Unknown error'
            });
        }
    }
    static async getRealtimeMetrics(_req, res) {
        try {
            console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo métricas en tiempo real');
            const realtimeData = {
                timestamp: new Date().toISOString(),
                status: 'active'
            };
            console.log('🔥🔥🔥 2. STATS CONTROLLER: Métricas en tiempo real obtenidas');
            res.status(200).json({
                success: true,
                message: 'Métricas en tiempo real obtenidas exitosamente',
                data: realtimeData
            });
        }
        catch (error) {
            console.error('🔥🔥🔥 ERROR en getRealtimeMetrics:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener métricas en tiempo real',
                error: error.message || 'Unknown error'
            });
        }
    }
}
exports.StatsController = StatsController;
//# sourceMappingURL=statsController.js.map