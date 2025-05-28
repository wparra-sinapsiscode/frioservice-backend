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
   * Obtiene estadísticas de servicios por equipo
   */
  static async getServicesByEquipment() {
    try {
      console.log('🔍 getServicesByEquipment: Iniciando consulta...');
      
      // Obtener todos los servicios con equipos
      const servicesWithEquipment = await prisma.service.findMany({
        where: {
          equipmentIds: {
            isEmpty: false
          }
        },
        select: {
          equipmentIds: true,
          status: true,
          type: true,
          completedAt: true
        }
      });

      console.log(`🔍 getServicesByEquipment: Encontrados ${servicesWithEquipment.length} servicios con equipos`);

      // Si no hay servicios con equipos, devolver estructura vacía pero válida
      if (servicesWithEquipment.length === 0) {
        console.log('⚠️ getServicesByEquipment: No hay servicios con equipmentIds');
        return {
          equipmentStats: [],
          servicesByEquipmentType: [],
          totalEquipmentsWithServices: 0,
          totalServices: 0
        };
      }

      // Obtener información de equipos
      const allEquipmentIds = [...new Set(servicesWithEquipment.flatMap(s => s.equipmentIds))];
      console.log(`🔍 getServicesByEquipment: Equipment IDs únicos: ${allEquipmentIds.length}`);
      
      const equipments = await prisma.equipment.findMany({
        where: { id: { in: allEquipmentIds } },
        select: {
          id: true,
          name: true,
          type: true,
          brand: true,
          status: true,
          client: {
            select: {
              companyName: true,
              contactPerson: true
            }
          }
        }
      });

      // Analizar servicios por equipo
      const equipmentStats = allEquipmentIds.map(equipmentId => {
        const equipment = equipments.find(e => e.id === equipmentId);
        const servicesForEquipment = servicesWithEquipment.filter(s => 
          s.equipmentIds.includes(equipmentId)
        );

        const completedServices = servicesForEquipment.filter(s => s.status === 'COMPLETED');
        const pendingServices = servicesForEquipment.filter(s => 
          ['PENDING', 'IN_PROGRESS'].includes(s.status)
        );

        return {
          equipmentId,
          equipment: equipment ? {
            name: equipment.name,
            type: equipment.type,
            brand: equipment.brand,
            status: equipment.status,
            client: equipment.client?.companyName || equipment.client?.contactPerson || 'N/A'
          } : null,
          totalServices: servicesForEquipment.length,
          completedServices: completedServices.length,
          pendingServices: pendingServices.length,
          lastServiceDate: completedServices.length > 0 
            ? Math.max(...completedServices.map(s => s.completedAt ? new Date(s.completedAt).getTime() : 0))
            : null
        };
      }).filter(stat => stat.equipment !== null)
        .sort((a, b) => b.totalServices - a.totalServices);

      // Estadísticas por tipo de equipo
      const servicesByEquipmentType = equipments.reduce((acc, equipment) => {
        const servicesForEquipment = servicesWithEquipment.filter(s => 
          s.equipmentIds.includes(equipment.id)
        );
        
        if (!acc[equipment.type]) {
          acc[equipment.type] = {
            type: equipment.type,
            equipmentCount: 0,
            totalServices: 0,
            completedServices: 0,
            pendingServices: 0
          };
        }
        
        acc[equipment.type].equipmentCount++;
        acc[equipment.type].totalServices += servicesForEquipment.length;
        acc[equipment.type].completedServices += servicesForEquipment.filter(s => s.status === 'COMPLETED').length;
        acc[equipment.type].pendingServices += servicesForEquipment.filter(s => 
          ['PENDING', 'IN_PROGRESS'].includes(s.status)
        ).length;
        
        return acc;
      }, {} as Record<string, any>);

      return {
        equipmentStats: equipmentStats.slice(0, 10), // Top 10 equipos con más servicios
        servicesByEquipmentType: Object.values(servicesByEquipmentType),
        totalEquipmentsWithServices: equipmentStats.length,
        totalServices: servicesWithEquipment.length
      };

    } catch (error) {
      console.error('Error fetching services by equipment:', error);
      throw new Error('Error al obtener estadísticas de servicios por equipo');
    }
  }

  /**
   * Obtiene estadísticas de eficiencia de técnicos (SIMPLIFICADO)
   */
  static async getTechnicianEfficiency(technicianId?: string) {
    try {
      console.log(`🔍 getTechnicianEfficiency: Obteniendo datos simples${technicianId ? ` para técnico ${technicianId}` : ' para todos los técnicos'}...`);
      
      // SIMPLE: Solo leer datos básicos de la tabla technicians
      const whereClause = technicianId ? { id: technicianId } : {};
      
      const technicians = await prisma.technician.findMany({
        where: whereClause,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          servicesCompleted: true,
          averageTime: true,
          rating: true,
          specialty: true
        }
      });

      console.log(`🔍 getTechnicianEfficiency: Encontrados ${technicians.length} técnicos`);

      // Formatear respuesta simple
      const efficiencyData = technicians.map(tech => ({
        name: `${tech.firstName} ${tech.lastName}`,
        specialty: tech.specialty,
        servicesCompleted: tech.servicesCompleted,
        averageTime: tech.averageTime || 'N/A',
        rating: Number((tech.rating || 0).toFixed(1))
      }));

      return {
        technicians: efficiencyData,
        total: technicians.length
      };

    } catch (error) {
      console.error('Error fetching technician efficiency:', error);
      throw new Error('Error al obtener estadísticas de eficiencia de técnicos');
    }
  }

  /**
   * Obtiene rankings de clientes
   */
  static async getClientRankings() {
    try {
      const [
        topByServices,
        topByIncome,
        mostActiveClients
      ] = await Promise.all([
        // Top clientes por número de servicios
        prisma.service.groupBy({
          by: ['clientId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),

        // Top clientes por ingresos generados (cotizaciones aprobadas)
        prisma.quote.groupBy({
          by: ['clientId'],
          where: { status: 'APPROVED' },
          _sum: { amount: true },
          _count: { id: true },
          orderBy: { _sum: { amount: 'desc' } },
          take: 10
        }),

        // Clientes más activos (servicios recientes)
        prisma.service.groupBy({
          by: ['clientId'],
          where: {
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) // Últimos 3 meses
            }
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        })
      ]);

      // Obtener información completa de clientes
      const allClientIds = [...new Set([
        ...topByServices.map(item => item.clientId),
        ...topByIncome.map(item => item.clientId),
        ...mostActiveClients.map(item => item.clientId)
      ])];

      const clients = await prisma.client.findMany({
        where: { id: { in: allClientIds } },
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          clientType: true,
          sector: true,
          isVip: true,
          createdAt: true
        }
      });

      // Procesar rankings
      const processRanking = (data: any[], clients: any[], type: 'services' | 'income' | 'activity') => {
        return data.map((item, index) => {
          const client = clients.find(c => c.id === item.clientId);
          const baseData = {
            rank: index + 1,
            clientId: item.clientId,
            clientName: client?.companyName || client?.contactPerson || 'Cliente desconocido',
            clientType: client?.clientType || 'N/A',
            sector: client?.sector || 'N/A',
            isVip: client?.isVip || false
          };

          switch (type) {
            case 'services':
              return {
                ...baseData,
                totalServices: item._count.id,
                metric: item._count.id
              };
            case 'income':
              return {
                ...baseData,
                totalIncome: Number(item._sum.amount || 0),
                totalQuotes: item._count.id,
                metric: Number(item._sum.amount || 0)
              };
            case 'activity':
              return {
                ...baseData,
                recentServices: item._count.id,
                metric: item._count.id
              };
            default:
              return baseData;
          }
        });
      };

      // Calcular estadísticas adicionales
      const totalClients = await prisma.client.count({ where: { status: 'ACTIVE' } });
      const vipClients = clients.filter(c => c.isVip).length;
      const averageServicesPerClient = topByServices.length > 0 
        ? topByServices.reduce((sum, item) => sum + item._count.id, 0) / topByServices.length 
        : 0;

      return {
        topByServices: processRanking(topByServices, clients, 'services'),
        topByIncome: processRanking(topByIncome, clients, 'income'),
        mostActiveClients: processRanking(mostActiveClients, clients, 'activity'),
        summary: {
          totalActiveClients: totalClients,
          vipClients,
          averageServicesPerClient: Number(averageServicesPerClient.toFixed(2))
        }
      };

    } catch (error) {
      console.error('Error fetching client rankings:', error);
      throw new Error('Error al obtener rankings de clientes');
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
  static async getIncomeStats(period: 'day' | 'month' | 'quarter' | 'year' = 'month') {
    try {
      const now = new Date();
      let startDate: Date;
      let previousStartDate: Date;
      let previousEndDate: Date;

      // Configurar fechas según el período
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          previousStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          previousEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
          break;
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
        incomeByMonth,
        incomeByDay,
        incomeByYear
      ] = await Promise.all([
        // Ingresos del período actual
        prisma.quote.aggregate({
          where: {
            status: 'APPROVED',
            approvedAt: {
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
            approvedAt: {
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
          by: ['approvedAt'],
          where: {
            status: 'APPROVED',
            approvedAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
            }
          },
          _sum: { amount: true }
        }),

        // Ingresos diarios (últimos 7 días)
        prisma.quote.groupBy({
          by: ['approvedAt'],
          where: {
            status: 'APPROVED',
            approvedAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7))
            }
          },
          _sum: { amount: true }
        }),

        // Ingresos anuales (últimos 3 años)
        prisma.quote.groupBy({
          by: ['approvedAt'],
          where: {
            status: 'APPROVED',
            approvedAt: {
              gte: new Date(new Date().setFullYear(new Date().getFullYear() - 3))
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
        incomeByMonth: this.processMonthlyIncomeData(incomeByMonth),
        incomeByDay: this.processDailyIncomeData(incomeByDay),
        incomeByYear: this.processYearlyIncomeData(incomeByYear)
      };

    } catch (error) {
      console.error('Error fetching income stats:', error);
      throw new Error('Error al obtener estadísticas de ingresos');
    }
  }

  /**
   * Obtiene rankings de técnicos (SIMPLIFICADO - solo datos de la tabla)
   */
  static async getTechnicianRankings() {
    try {
      console.log('🔍 getTechnicianRankings: Obteniendo datos directos de la tabla técnicos...');
      
      // SIMPLE: Solo leer la tabla technicians y ordenar por servicesCompleted
      const topTechnicians = await prisma.technician.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          servicesCompleted: true,
          averageTime: true,
          rating: true,
          specialty: true
        },
        orderBy: { servicesCompleted: 'desc' },
        take: 10
      });

      console.log(`🔍 getTechnicianRankings: Encontrados ${topTechnicians.length} técnicos`);

      // Formatear respuesta simple
      const formattedTechnicians = topTechnicians.map((tech, index) => ({
        rank: index + 1,
        name: `${tech.firstName} ${tech.lastName}`,
        servicesCompleted: tech.servicesCompleted,
        averageTime: tech.averageTime || 'N/A',
        rating: Number((tech.rating || 0).toFixed(1)),
        specialty: tech.specialty
      }));

      return {
        topTechnicians: formattedTechnicians,
        total: topTechnicians.length
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
      const date = new Date(item.approvedAt);
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
   * Procesa datos de ingresos diarios
   */
  private static processDailyIncomeData(data: any[]) {
    const dailyMap = new Map();
    
    data.forEach(item => {
      const date = new Date(item.approvedAt);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, dailyMap.get(dayKey) + Number(item._sum.amount || 0));
      } else {
        dailyMap.set(dayKey, Number(item._sum.amount || 0));
      }
    });

    return Array.from(dailyMap.entries()).map(([day, income]) => ({
      day,
      income,
      label: this.getDayLabel(day)
    }));
  }

  /**
   * Procesa datos de ingresos anuales
   */
  private static processYearlyIncomeData(data: any[]) {
    const yearlyMap = new Map();
    
    data.forEach(item => {
      const date = new Date(item.approvedAt);
      const yearKey = date.getFullYear().toString();
      
      if (yearlyMap.has(yearKey)) {
        yearlyMap.set(yearKey, yearlyMap.get(yearKey) + Number(item._sum.amount || 0));
      } else {
        yearlyMap.set(yearKey, Number(item._sum.amount || 0));
      }
    });

    return Array.from(yearlyMap.entries()).map(([year, income]) => ({
      year,
      income,
      label: year
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
    if (!monthKey || !monthKey.includes('-')) {
      console.log('⚠️ getMonthLabel: monthKey inválido:', monthKey);
      return 'Mes desconocido';
    }
    
    const [year, month] = monthKey.split('-');
    const monthNumber = parseInt(month, 10);
    const yearNumber = parseInt(year, 10);
    
    if (isNaN(monthNumber) || isNaN(yearNumber)) {
      console.log('⚠️ getMonthLabel: Error parseando fecha:', { year, month, monthKey });
      return 'Fecha inválida';
    }
    
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    const monthIndex = monthNumber - 1;
    if (monthIndex < 0 || monthIndex >= 12) {
      console.log('⚠️ getMonthLabel: Índice de mes inválido:', monthIndex);
      return 'Mes inválido';
    }
    
    return `${monthNames[monthIndex]} ${yearNumber}`;
  }

  /**
   * Convierte clave de día a etiqueta legible
   */
  private static getDayLabel(dayKey: string): string {
    if (!dayKey || dayKey.split('-').length !== 3) {
      console.log('⚠️ getDayLabel: dayKey inválido:', dayKey);
      return 'Día desconocido';
    }
    
    const [year, month, day] = dayKey.split('-');
    const dayNumber = parseInt(day, 10);
    const monthNumber = parseInt(month, 10);
    const yearNumber = parseInt(year, 10);
    
    if (isNaN(dayNumber) || isNaN(monthNumber) || isNaN(yearNumber)) {
      console.log('⚠️ getDayLabel: Error parseando fecha:', { year, month, day, dayKey });
      return 'Fecha inválida';
    }
    
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    const monthIndex = monthNumber - 1;
    if (monthIndex < 0 || monthIndex >= 12) {
      console.log('⚠️ getDayLabel: Índice de mes inválido:', monthIndex);
      return 'Mes inválido';
    }
    
    return `${dayNumber} ${monthNames[monthIndex]}`;
  }

  /**
   * Obtiene número de días en el período especificado
   */
  private static getDaysInPeriod(period: 'day' | 'month' | 'quarter' | 'year'): number {
    const now = new Date();
    switch (period) {
      case 'day':
        return 1;
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