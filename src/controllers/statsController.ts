import { Request, Response } from 'express';
import { StatsService } from '../services/statsService';

export class StatsController {
  
  /**
   * Obtiene estadísticas generales para el dashboard
   * GET /api/stats/dashboard
   */
  static async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo estadísticas del dashboard');
      console.log('🔥🔥🔥 User requesting dashboard stats:', (_req as any).user?.role, (_req as any).user?.userId);
      
      const stats = await StatsService.getDashboardStats();
      
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

    } catch (error: any) {
      console.error('🔥🔥🔥 ERROR en getDashboardStats:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas del dashboard',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Obtiene transacciones recientes
   * GET /api/stats/transactions/recent
   */
  static async getRecentTransactions(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query['limit'] as string) || 10;
      const transactions = await StatsService.getRecentTransactions(limit);

      res.status(200).json({
        success: true,
        message: 'Transacciones recientes obtenidas exitosamente',
        data: transactions
      });
    } catch (error: any) {
      console.error('Error en getRecentTransactions:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener transacciones',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Obtiene estadísticas de servicios por equipo
   * GET /api/stats/equipment/services
   */
  static async getServicesByEquipment(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await StatsService.getServicesByEquipment();

      res.status(200).json({
        success: true,
        message: 'Estadísticas de servicios por equipo obtenidas exitosamente',
        data: stats
      });
    } catch (error: any) {
      console.error('Error en getServicesByEquipment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas de equipos',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Obtiene estadísticas de eficiencia de técnicos
   * GET /api/stats/technicians/efficiency?technicianId=xxx
   */
  static async getTechnicianEfficiency(req: Request, res: Response): Promise<void> {
    try {
      const technicianId = req.query['technicianId'] as string;
      const stats = await StatsService.getTechnicianEfficiency(technicianId);

      res.status(200).json({
        success: true,
        message: 'Estadísticas de eficiencia de técnicos obtenidas exitosamente',
        data: stats
      });
    } catch (error: any) {
      console.error('Error en getTechnicianEfficiency:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas de eficiencia',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Obtiene rankings de clientes
   * GET /api/stats/clients/rankings
   */
  static async getClientRankings(_req: Request, res: Response): Promise<void> {
    try {
      const rankings = await StatsService.getClientRankings();

      res.status(200).json({
        success: true,
        message: 'Rankings de clientes obtenidos exitosamente',
        data: rankings
      });
    } catch (error: any) {
      console.error('Error en getClientRankings:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener rankings de clientes',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Obtiene estadísticas detalladas de servicios con filtros
   * GET /api/stats/services?startDate=&endDate=&technicianId=&clientId=
   */
  static async getServiceStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, technicianId, clientId } = req.query;
      
      console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo estadísticas de servicios');
      console.log('🔥🔥🔥 Service stats filters:', {
        startDate,
        endDate,
        technicianId,
        clientId,
        userRole: (req as any).user?.role
      });

      // Construir filtros
      const filters: any = {};
      
      if (startDate) {
        try {
          filters.startDate = new Date(startDate as string);
          console.log('🔥🔥🔥 Start date parsed:', filters.startDate);
        } catch (error) {
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
          filters.endDate = new Date(endDate as string);
          console.log('🔥🔥🔥 End date parsed:', filters.endDate);
        } catch (error) {
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

      const stats = await StatsService.getServiceStats(filters);
      
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
        filters: filters // Incluir filtros aplicados en la respuesta
      });

    } catch (error: any) {
      console.error('🔥🔥🔥 ERROR en getServiceStats:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas de servicios',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Obtiene estadísticas de ingresos por período
   * GET /api/stats/income?period=month|quarter|year
   */
  static async getIncomeStats(req: Request, res: Response): Promise<void> {
    try {
      const { period } = req.query;
      
      console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo estadísticas de ingresos');
      console.log('🔥🔥🔥 Income stats period:', period, 'userRole:', (req as any).user?.role);

      // Validar período
      const validPeriods = ['month', 'quarter', 'year'];
      const selectedPeriod = period as string || 'month';
      
      if (!validPeriods.includes(selectedPeriod)) {
        console.error('🔥🔥🔥 Invalid period provided:', selectedPeriod);
        res.status(400).json({
          success: false,
          message: `Período inválido. Valores válidos: ${validPeriods.join(', ')}`
        });
        return;
      }

      const stats = await StatsService.getIncomeStats(selectedPeriod as 'month' | 'quarter' | 'year');
      
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

    } catch (error: any) {
      console.error('🔥🔥🔥 ERROR en getIncomeStats:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas de ingresos',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Obtiene rankings de técnicos (top performers)
   * GET /api/stats/technicians/rankings
   */
  static async getTechnicianRankings(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo rankings de técnicos');
      console.log('🔥🔥🔥 User requesting technician rankings:', (_req as any).user?.role, (_req as any).user?.userId);
      
      const rankings = await StatsService.getTechnicianRankings();
      
      console.log('🔥🔥🔥 2. STATS CONTROLLER: Rankings de técnicos obtenidos exitosamente');
      console.log('🔥🔥🔥 Technician rankings preview:', {
        totalTechnicians: rankings.total,
        topPerformer: rankings.topTechnicians[0]?.name || 'N/A',
        topServices: rankings.topTechnicians[0]?.servicesCompleted || 0
      });

      res.status(200).json({
        success: true,
        message: 'Rankings de técnicos obtenidos exitosamente',
        data: rankings
      });

    } catch (error: any) {
      console.error('🔥🔥🔥 ERROR en getTechnicianRankings:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener rankings de técnicos',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Endpoint adicional para obtener estadísticas generales del sistema
   * GET /api/stats/overview
   */
  static async getSystemOverview(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo overview del sistema');
      console.log('🔥🔥🔥 User requesting system overview:', (_req as any).user?.role);
      
      // Obtener estadísticas combinadas en paralelo
      const [dashboardStats, technicianRankings] = await Promise.all([
        StatsService.getDashboardStats(),
        StatsService.getTechnicianRankings()
      ]);

      const overview = {
        dashboard: dashboardStats,
        topTechnicians: technicianRankings.topTechnicians.slice(0, 3), // Top 3 técnicos
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

    } catch (error: any) {
      console.error('🔥🔥🔥 ERROR en getSystemOverview:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener overview del sistema',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Endpoint para obtener métricas en tiempo real (para actualizaciones automáticas)
   * GET /api/stats/realtime
   */
  static async getRealtimeMetrics(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥🔥🔥 1. STATS CONTROLLER: Obteniendo métricas en tiempo real');
      
      // Métricas básicas que se actualizan frecuentemente
      const realtimeData = {
        timestamp: new Date().toISOString(),
        // Se pueden agregar más métricas específicas en tiempo real aquí
        status: 'active'
      };
      
      console.log('🔥🔥🔥 2. STATS CONTROLLER: Métricas en tiempo real obtenidas');

      res.status(200).json({
        success: true,
        message: 'Métricas en tiempo real obtenidas exitosamente',
        data: realtimeData
      });

    } catch (error: any) {
      console.error('🔥🔥🔥 ERROR en getRealtimeMetrics:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener métricas en tiempo real',
        error: error.message || 'Unknown error'
      });
    }
  }
}