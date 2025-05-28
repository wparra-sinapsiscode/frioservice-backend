import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StatsService {
  
  /**
   * Obtiene KPIs generales del sistema para el dashboard
   * @returns Promise<DashboardStats>
   */
  static async getDashboardStats() {
    try {
      // Fecha actual y primer día del mes
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Ejecutar todas las consultas en paralelo para optimizar performance
      const [
        servicesByStatus,
        clientsCount,
        techniciansAvailable,
        servicesThisMonth,
        servicesPrevMonth,
        quotesCount,
        monthlyIncome,
        prevMonthIncome,
        monthlyTransactions,
        prevMonthTransactions
      ] = await Promise.all([
        // Servicios agrupados por estado
        prisma.service.groupBy({
          by: ['status'],
          _count: { status: true }
        }),

        // Total clientes activos
        prisma.client.count({
          where: { status: 'ACTIVE' }
        }),

        // Total técnicos disponibles
        prisma.technician.count({
          where: { isAvailable: true }
        }),

        // Servicios completados este mes
        prisma.service.count({
          where: {
            status: 'COMPLETED',
            completedAt: {
              gte: firstDayOfMonth,
              lte: now
            }
          }
        }),

        // Servicios completados mes anterior (para comparación)
        prisma.service.count({
          where: {
            status: 'COMPLETED',
            completedAt: {
              gte: firstDayOfPrevMonth,
              lte: lastDayOfPrevMonth
            }
          }
        }),

        // Cotizaciones pendientes
        prisma.quote.count({
          where: { status: 'PENDING' }
        }),

        // Ingresos del mes actual (suma de cotizaciones aprobadas)
        prisma.quote.aggregate({
          where: {
            status: 'APPROVED',
            createdAt: {
              gte: firstDayOfMonth,
              lte: now
            }
          },
          _sum: { amount: true }
        }),

        // Ingresos del mes anterior
        prisma.quote.aggregate({
          where: {
            status: 'APPROVED',
            createdAt: {
              gte: firstDayOfPrevMonth,
              lte: lastDayOfPrevMonth
            }
          },
          _sum: { amount: true }
        }),

        // Ingresos por transacciones este mes (materiales, etc.)
        prisma.transaction.aggregate({
          where: {
            createdAt: {
              gte: firstDayOfMonth,
              lte: now
            }
          },
          _sum: { amount: true }
        }),

        // Ingresos por transacciones mes anterior
        prisma.transaction.aggregate({
          where: {
            createdAt: {
              gte: firstDayOfPrevMonth,
              lte: lastDayOfPrevMonth
            }
          },
          _sum: { amount: true }
        })
      ]);

      // Procesar servicios por estado
      const servicesStats = servicesByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>);

      // Calcular tendencias
      const servicesGrowth = servicesPrevMonth > 0 
        ? ((servicesThisMonth - servicesPrevMonth) / servicesPrevMonth) * 100 
        : 0;

      // Calcular ingresos totales (cotizaciones + transacciones)
      const totalMonthlyIncome = Number(monthlyIncome._sum.amount || 0) + Number(monthlyTransactions._sum.amount || 0);
      const totalPrevMonthIncome = Number(prevMonthIncome._sum.amount || 0) + Number(prevMonthTransactions._sum.amount || 0);

      const incomeGrowth = totalPrevMonthIncome > 0 
        ? ((totalMonthlyIncome - totalPrevMonthIncome) / totalPrevMonthIncome) * 100 
        : 0;

      return {
        totalServices: {
          total: Object.values(servicesStats).reduce((sum, count) => sum + count, 0),
          byStatus: {
            pending: servicesStats['PENDING'] || 0,
            inProgress: servicesStats['IN_PROGRESS'] || 0,
            completed: servicesStats['COMPLETED'] || 0,
            cancelled: servicesStats['CANCELLED'] || 0,
            onHold: servicesStats['ON_HOLD'] || 0,
            scheduled: servicesStats['SCHEDULED'] || 0
          }
        },
        totalClients: clientsCount,
        totalTechnicians: techniciansAvailable,
        monthlyIncome: {
          current: totalMonthlyIncome,
          previous: totalPrevMonthIncome,
          growth: Number(incomeGrowth.toFixed(2)),
          breakdown: {
            quotes: Number(monthlyIncome._sum.amount || 0),
            materials: Number(monthlyTransactions._sum.amount || 0)
          }
        },
        completedServicesThisMonth: {
          current: servicesThisMonth,
          previous: servicesPrevMonth,
          growth: Number(servicesGrowth.toFixed(2))
        },
        pendingQuotes: quotesCount,
        lastUpdated: now.toISOString()
      };

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Error al obtener estadísticas del dashboard');
    }
  }

  /**
   * Obtener transacciones recientes
   */
  static async getRecentTransactions(limit = 10) {
    try {
      const transactions = await prisma.transaction.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: {
            include: {
              client: {
                select: {
                  companyName: true,
                  contactPerson: true
                }
              },
              technician: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      return transactions;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw new Error('Error al obtener transacciones recientes');
    }
  }

  /**
   * Obtiene estadísticas detalladas de servicios
   * @param filters Filtros opcionales para la consulta
   * @returns Promise<ServiceStats>
   */
  static async getServiceStats(filters: {
    startDate?: Date;
    endDate?: Date;
    technicianId?: string;
    clientId?: string;
  } = {}) {
    try {
      const { startDate, endDate, technicianId, clientId } = filters;

      // Construir filtros de fecha
      const dateFilter = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate })
      };

      // Filtros adicionales
      const whereClause = {
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        ...(technicianId && { technicianId }),
        ...(clientId && { clientId })
      };

      // Ejecutar consultas en paralelo
      const [
        servicesByType,
        servicesByStatus,
        servicesByMonth,
        avgCompletionTime
      ] = await Promise.all([
        // Servicios por tipo
        prisma.service.groupBy({
          by: ['type'],
          where: whereClause,
          _count: { type: true }
        }),

        // Servicios por estado
        prisma.service.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { status: true }
        }),

        // Servicios por mes (últimos 6 meses)
        prisma.service.groupBy({
          by: ['createdAt'],
          where: {
            ...whereClause,
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          },
          _count: { id: true }
        }),

        // Tiempo promedio de resolución (servicios completados)
        prisma.service.aggregate({
          where: {
            ...whereClause,
            status: 'COMPLETED',
            completedAt: { not: null }
          },
          _avg: { timeSpent: true }
        })
      ]);

      // Procesar servicios por mes
      const monthlyData = this.processMonthlyData(servicesByMonth);

      return {
        servicesByType: servicesByType.map(item => ({
          type: item.type,
          count: item._count.type,
          label: this.getServiceTypeLabel(item.type)
        })),
        servicesByStatus: servicesByStatus.map(item => ({
          status: item.status,
          count: item._count.status,
          label: this.getServiceStatusLabel(item.status)
        })),
        servicesByMonth: monthlyData,
        averageCompletionTime: Number(avgCompletionTime._avg.timeSpent || 0),
        totalServices: servicesByType.reduce((sum, item) => sum + item._count.type, 0)
      };

    } catch (error) {
      console.error('Error fetching service stats:', error);
      throw new Error('Error al obtener estadísticas de servicios');
    }
  }

  /**
   * Obtiene estadísticas de ingresos por período
   * @param period Período de análisis ('month', 'quarter', 'year')
   * @returns Promise<IncomeStats>
   */
  static async getIncomeStats(period: 'month' | 'quarter' | 'year' = 'month') {
    try {
      const now = new Date();
      let startDate: Date;
      let previousStartDate: Date;
      let previousEndDate: Date;

      // Configurar fechas según el período
      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          previousStartDate = new Date(now.getFullYear(), quarterStart - 3, 1);
          previousEndDate = new Date(now.getFullYear(), quarterStart, 0);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
          previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
          break;
      }

      const [
        currentIncome,
        previousIncome,
        incomeByType,
        incomeByMonth
      ] = await Promise.all([
        // Ingresos del período actual
        prisma.quote.aggregate({
          where: {
            status: 'APPROVED',
            createdAt: {
              gte: startDate,
              lte: now
            }
          },
          _sum: { amount: true },
          _count: { id: true }
        }),

        // Ingresos del período anterior
        prisma.quote.aggregate({
          where: {
            status: 'APPROVED',
            createdAt: {
              gte: previousStartDate,
              lte: previousEndDate
            }
          },
          _sum: { amount: true }
        }),

        // Ingresos por tipo de servicio (a través de la relación con Service)
        prisma.quote.groupBy({
          by: ['serviceId'],
          where: {
            status: 'APPROVED',
            createdAt: {
              gte: startDate,
              lte: now
            },
            serviceId: { not: null }
          },
          _sum: { amount: true },
          _count: { id: true }
        }).then(async (groupedQuotes) => {
          // Obtener los tipos de servicio para cada serviceId (filtrar nulls)
          const serviceIds = groupedQuotes.map(item => item.serviceId).filter((id): id is string => id !== null);
          const services = await prisma.service.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true, type: true }
          });
          
          // Agrupar por tipo de servicio
          const incomeByServiceType: Record<string, { income: number, count: number }> = {};
          
          groupedQuotes.forEach(quote => {
            const service = services.find(s => s.id === quote.serviceId);
            if (service) {
              const type = service.type;
              if (!incomeByServiceType[type]) {
                incomeByServiceType[type] = { income: 0, count: 0 };
              }
              incomeByServiceType[type].income += Number(quote._sum.amount || 0);
              incomeByServiceType[type].count += quote._count.id;
            }
          });
          
          return Object.entries(incomeByServiceType).map(([type, data]) => ({
            type,
            _sum: { amount: data.income },
            _count: { id: data.count }
          }));
        }),

        // Ingresos mensuales (últimos 12 meses)
        prisma.quote.groupBy({
          by: ['createdAt'],
          where: {
            status: 'APPROVED',
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
            }
          },
          _sum: { amount: true }
        })
      ]);

      // Calcular crecimiento
      const growth = previousIncome._sum.amount 
        ? ((Number(currentIncome._sum.amount || 0) - Number(previousIncome._sum.amount)) / Number(previousIncome._sum.amount)) * 100
        : 0;

      // Calcular proyección simple basada en días transcurridos
      const daysInPeriod = this.getDaysInPeriod(period);
      const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const projectedIncome = daysPassed > 0 
        ? (Number(currentIncome._sum.amount || 0) / daysPassed) * daysInPeriod
        : 0;

      const resolvedIncomeByType = await incomeByType;
      
      return {
        currentPeriod: {
          income: Number(currentIncome._sum.amount || 0),
          transactions: currentIncome._count.id,
          period: period
        },
        previousPeriod: {
          income: Number(previousIncome._sum.amount || 0),
          growth: Number(growth.toFixed(2))
        },
        projection: Number(projectedIncome.toFixed(2)),
        incomeByType: resolvedIncomeByType.map(item => ({
          type: item.type,
          income: Number(item._sum.amount || 0),
          transactions: item._count.id,
          label: this.getServiceTypeLabel(item.type)
        })),
        incomeByMonth: this.processMonthlyIncomeData(incomeByMonth)
      };

    } catch (error) {
      console.error('Error fetching income stats:', error);
      throw new Error('Error al obtener estadísticas de ingresos');
    }
  }

  /**
   * Obtiene rankings de técnicos
   * @returns Promise<TechnicianRankings>
   */
  static async getTechnicianRankings() {
    try {
      const [
        topByServices,
        topByRating,
        efficiencyData
      ] = await Promise.all([
        // Top 5 por servicios completados
        prisma.technician.findMany({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            servicesCompleted: true,
            specialty: true
          },
          orderBy: { servicesCompleted: 'desc' },
          take: 5
        }),

        // Top 5 por calificación
        prisma.technician.findMany({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
            servicesCompleted: true,
            specialty: true
          },
          where: {
            rating: { gt: 0 }
          },
          orderBy: { rating: 'desc' },
          take: 5
        }),

        // Datos de eficiencia (servicios/tiempo promedio)
        prisma.technician.findMany({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            servicesCompleted: true,
            averageTime: true,
            rating: true,
            specialty: true
          },
          where: {
            averageTime: { not: null },
            servicesCompleted: { gt: 0 }
          }
        })
      ]);

      // Calcular eficiencia (servicios por hora)
      const efficiency = efficiencyData
        .map(tech => {
          // Convertir averageTime (que puede estar en minutos) a número
          let avgTimeInMinutes = 0;
          if (tech.averageTime) {
            // Si averageTime es un número, lo usamos directamente
            if (typeof tech.averageTime === 'number') {
              avgTimeInMinutes = tech.averageTime;
            } else {
              // Si es string, parseamos (asumiendo que está en minutos)
              avgTimeInMinutes = parseFloat(tech.averageTime.toString()) || 0;
            }
          }
          
          return {
            id: tech.id,
            firstName: tech.firstName,
            lastName: tech.lastName,
            servicesCompleted: tech.servicesCompleted,
            averageTime: avgTimeInMinutes,
            efficiency: avgTimeInMinutes > 0 ? tech.servicesCompleted / (avgTimeInMinutes / 60) : 0,
            rating: tech.rating || 0,
            specialty: tech.specialty
          };
        })
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 5);

      return {
        topByServices: topByServices.map(tech => ({
          id: tech.id,
          name: `${tech.firstName} ${tech.lastName}`,
          servicesCompleted: tech.servicesCompleted,
          specialty: tech.specialty
        })),
        topByRating: topByRating.map(tech => ({
          id: tech.id,
          name: `${tech.firstName} ${tech.lastName}`,
          rating: Number((tech.rating || 0).toFixed(2)),
          servicesCompleted: tech.servicesCompleted,
          specialty: tech.specialty
        })),
        topByEfficiency: efficiency.map(tech => ({
          id: tech.id,
          name: `${tech.firstName} ${tech.lastName}`,
          efficiency: Number(tech.efficiency.toFixed(2)),
          servicesPerHour: Number((tech.efficiency).toFixed(1)),
          averageTime: tech.averageTime,
          specialty: tech.specialty
        }))
      };

    } catch (error) {
      console.error('Error fetching technician rankings:', error);
      throw new Error('Error al obtener rankings de técnicos');
    }
  }

  // MÉTODOS AUXILIARES

  /**
   * Procesa datos mensuales para gráficos
   */
  private static processMonthlyData(data: any[]) {
    const monthlyMap = new Map();
    
    data.forEach(item => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, monthlyMap.get(monthKey) + item._count.id);
      } else {
        monthlyMap.set(monthKey, item._count.id);
      }
    });

    return Array.from(monthlyMap.entries()).map(([month, count]) => ({
      month,
      count,
      label: this.getMonthLabel(month)
    }));
  }

  /**
   * Procesa datos de ingresos mensuales
   */
  private static processMonthlyIncomeData(data: any[]) {
    const monthlyMap = new Map();
    
    data.forEach(item => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, monthlyMap.get(monthKey) + Number(item._sum.amount || 0));
      } else {
        monthlyMap.set(monthKey, Number(item._sum.amount || 0));
      }
    });

    return Array.from(monthlyMap.entries()).map(([month, income]) => ({
      month,
      income,
      label: this.getMonthLabel(month)
    }));
  }

  /**
   * Obtiene etiquetas legibles para tipos de servicio
   */
  private static getServiceTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'MAINTENANCE': 'Mantenimiento',
      'REPAIR': 'Reparación',
      'INSTALLATION': 'Instalación',
      'INSPECTION': 'Inspección',
      'EMERGENCY': 'Emergencia',
      'CLEANING': 'Limpieza',
      'CONSULTATION': 'Consultoría'
    };
    return labels[type] || type;
  }

  /**
   * Obtiene etiquetas legibles para estados de servicio
   */
  private static getServiceStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'SCHEDULED': 'Programado',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado',
      'ON_HOLD': 'En Espera'
    };
    return labels[status] || status;
  }

  /**
   * Convierte clave de mes a etiqueta legible
   */
  private static getMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }

  /**
   * Obtiene número de días en el período especificado
   */
  private static getDaysInPeriod(period: 'month' | 'quarter' | 'year'): number {
    const now = new Date();
    switch (period) {
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      case 'quarter':
        return 90; // Aproximadamente
      case 'year':
        return 365;
      default:
        return 30;
    }
  }
}