import { PrismaClient, ServiceStatus, ServiceType, ServicePriority } from '@prisma/client';

const prisma = new PrismaClient();

// Interface para crear servicio
export interface CreateServiceData {
  title: string;
  description?: string;
  clientId: string;
  technicianId?: string;
  type: ServiceType;
  priority?: ServicePriority;
  scheduledDate: Date;
  estimatedDuration?: number;
  equipmentIds?: string[];
  address: string;
  contactPhone: string;
  emergencyContact?: string;
  accessInstructions?: string;
  clientNotes?: string;
}

// Interface para actualizar servicio
export interface UpdateServiceData {
  title?: string;
  description?: string;
  technicianId?: string;
  status?: ServiceStatus;
  type?: ServiceType;
  priority?: ServicePriority;
  scheduledDate?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  equipmentIds?: string[];
  address?: string;
  contactPhone?: string;
  emergencyContact?: string;
  accessInstructions?: string;
  clientNotes?: string;
  workPerformed?: string;
  timeSpent?: number;
  materialsUsed?: any;
  technicianNotes?: string;
  clientSignature?: string;
  images?: string[];
  notes?: string;
}

// Interface para filtros de búsqueda
export interface ServiceFilters {
  status?: ServiceStatus;
  type?: ServiceType;
  priority?: ServicePriority;
  clientId?: string;
  technicianId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class ServiceService {
  /**
   * Crear un nuevo servicio
   */
  static async createService(data: CreateServiceData) {
    try {
      // Verificar que el cliente existe
      const client = await prisma.client.findUnique({
        where: { id: data.clientId }
      });

      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      // Verificar que el técnico existe (si se proporciona)
      if (data.technicianId) {
        const technician = await prisma.technician.findUnique({
          where: { id: data.technicianId }
        });

        if (!technician) {
          throw new Error('Técnico no encontrado');
        }
      }

      const service = await prisma.service.create({
        data: {
          title: data.title,
          description: data.description || null,
          clientId: data.clientId,
          technicianId: data.technicianId || null,
          type: data.type,
          priority: data.priority || ServicePriority.MEDIUM,
          scheduledDate: data.scheduledDate,
          estimatedDuration: data.estimatedDuration || null,
          equipmentIds: data.equipmentIds || [],
          address: data.address,
          contactPhone: data.contactPhone,
          emergencyContact: data.emergencyContact || null,
          accessInstructions: data.accessInstructions || null,
          clientNotes: data.clientNotes || null,
        },
        include: {
          client: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true
                }
              }
            }
          },
          technician: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return service;
    } catch (error) {
      console.error('Error en ServiceService.createService:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los servicios con filtros opcionales
   */
  static async getServices(filters: ServiceFilters = {}, page: number = 1, limit: number = 20) {
    try {
      console.log('🔥 ServiceService.getServices - Starting with filters:', filters);
      console.log('🔥 ServiceService.getServices - Page:', page, 'Limit:', limit);
      
      const skip = (page - 1) * limit;

      // Construir where clause basado en filtros
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.clientId) {
        where.clientId = filters.clientId;
      }

      if (filters.technicianId) {
        where.technicianId = filters.technicianId;
      }

      if (filters.startDate && filters.endDate) {
        where.scheduledDate = {
          gte: filters.startDate,
          lte: filters.endDate
        };
      } else if (filters.startDate) {
        where.scheduledDate = {
          gte: filters.startDate
        };
      } else if (filters.endDate) {
        where.scheduledDate = {
          lte: filters.endDate
        };
      }

      console.log('🔥 ServiceService.getServices - Final where clause:', where);
      console.log('🔥 ServiceService.getServices - Skip:', skip, 'Take:', limit);

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { priority: 'desc' },
            { scheduledDate: 'asc' },
            { createdAt: 'desc' }
          ],
          include: {
            client: {
              include: {
                user: {
                  select: {
                    username: true,
                    email: true
                  }
                }
              }
            },
            technician: {
              include: {
                user: {
                  select: {
                    username: true,
                    email: true
                  }
                }
              }
            }
          }
        }),
        prisma.service.count({ where })
      ]);
      
      console.log('🔥 ServiceService.getServices - Services found:', services.length);
      console.log('🔥 ServiceService.getServices - Total count:', total);

      return {
        services,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error en ServiceService.getServices:', error);
      throw error;
    }
  }

  /**
   * Obtener un servicio por ID
   */
  static async getServiceById(id: string) {
    try {
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          client: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true
                }
              }
            }
          },
          technician: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true
                }
              }
            }
          },
          quotes: true
        }
      });

      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      return service;
    } catch (error) {
      console.error('Error en ServiceService.getServiceById:', error);
      throw error;
    }
  }

  /**
   * Actualizar un servicio
   */
  static async updateService(id: string, data: UpdateServiceData) {
    try {
      // Verificar que el servicio existe
      const existingService = await prisma.service.findUnique({
        where: { id }
      });

      if (!existingService) {
        throw new Error('Servicio no encontrado');
      }

      // Verificar que el técnico existe (si se proporciona)
      if (data.technicianId) {
        const technician = await prisma.technician.findUnique({
          where: { id: data.technicianId }
        });

        if (!technician) {
          throw new Error('Técnico no encontrado');
        }
      }

      // Si se completa el servicio, establecer completedAt
      const updateData: any = { ...data };
      if (data.status === ServiceStatus.COMPLETED && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }


      const service = await prisma.service.update({
        where: { id },
        data: updateData,
        include: {
          client: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true
                }
              }
            }
          },
          technician: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return service;
    } catch (error) {
      console.error('Error en ServiceService.updateService:', error);
      throw error;
    }
  }

  /**
   * Eliminar un servicio
   */
  static async deleteService(id: string) {
    try {
      const service = await prisma.service.findUnique({
        where: { id }
      });

      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      await prisma.service.delete({
        where: { id }
      });

      return { message: 'Servicio eliminado exitosamente' };
    } catch (error) {
      console.error('Error en ServiceService.deleteService:', error);
      throw error;
    }
  }

  /**
   * Asignar técnico a un servicio
   */
  static async assignTechnician(serviceId: string, technicianId: string) {
    try {
      const service = await this.updateService(serviceId, {
        technicianId,
        status: ServiceStatus.IN_PROGRESS
      });

      return service;
    } catch (error) {
      console.error('Error en ServiceService.assignTechnician:', error);
      throw error;
    }
  }

  /**
   * Completar un servicio
   */
  static async completeService(serviceId: string, completionData: {
    workPerformed?: string;
    timeSpent?: number;
    materialsUsed?: any;
    technicianNotes?: string;
    clientSignature?: string;
    images?: string[];
  }) {
    try {
      const updateData: any = {
        status: ServiceStatus.COMPLETED,
        completedAt: new Date()
      };

      // Guardar trabajo realizado
      if (completionData.workPerformed) {
        updateData.workPerformed = completionData.workPerformed;
      }

      // Guardar tiempo gastado
      if (typeof completionData.timeSpent === 'number') {
        updateData.actualDuration = completionData.timeSpent;
        updateData.timeSpent = completionData.timeSpent; // Agregar campo timeSpent también
      }

      // Guardar materiales utilizados
      if (completionData.materialsUsed) {
        updateData.materialsUsed = Array.isArray(completionData.materialsUsed) 
          ? completionData.materialsUsed 
          : JSON.stringify(completionData.materialsUsed);
      }

      // Guardar notas del técnico
      if (completionData.technicianNotes) {
        updateData.technicianNotes = completionData.technicianNotes;
      }

      // Guardar firma del cliente
      if (completionData.clientSignature) {
        updateData.clientSignature = completionData.clientSignature;
      }

      // Guardar imágenes si las hay
      if (completionData.images && Array.isArray(completionData.images)) {
        updateData.images = completionData.images;
      }

      console.log('🔥 ServiceService.completeService - Datos a actualizar:', updateData);

      const service = await this.updateService(serviceId, updateData);

      console.log('🔥 ServiceService.completeService - Servicio actualizado:', service);

      return service;
    } catch (error) {
      console.error('Error en ServiceService.completeService:', error);
      throw error;
    }
  }

  /**
   * Obtener servicios por cliente
   */
  static async getServicesByClient(clientId: string) {
    try {
      const services = await prisma.service.findMany({
        where: { clientId },
        orderBy: { scheduledDate: 'desc' },
        include: {
          technician: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return services;
    } catch (error) {
      console.error('Error en ServiceService.getServicesByClient:', error);
      throw error;
    }
  }

  /**
   * Obtener servicios por técnico
   */
  static async getServicesByTechnician(technicianId: string) {
    try {
      const services = await prisma.service.findMany({
        where: { technicianId },
        orderBy: { scheduledDate: 'asc' },
        include: {
          client: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return services;
    } catch (error) {
      console.error('Error en ServiceService.getServicesByTechnician:', error);
      throw error;
    }
  }

  /**
   * Get client by user ID
   */
  static async getClientByUserId(userId: string) {
    try {
      const client = await prisma.client.findUnique({
        where: { userId }
      });
      return client;
    } catch (error) {
      console.error('Error en ServiceService.getClientByUserId:', error);
      throw error;
    }
  }

  /**
   * Get evaluations for a specific technician
   * Returns completed services with ratings and comments
   */
  static async getTechnicianEvaluations(userIdOrTechnicianId: string) {
    try {
      // First try to find technician by direct ID
      let technician = await prisma.technician.findUnique({
        where: { id: userIdOrTechnicianId }
      });

      // If not found, try to find by userId
      if (!technician) {
        technician = await prisma.technician.findUnique({
          where: { userId: userIdOrTechnicianId }
        });
      }

      if (!technician) {
        throw new Error('Técnico no encontrado');
      }

      // Get completed services with evaluations using the technician ID
      const evaluations = await prisma.service.findMany({
        where: {
          technicianId: technician.id,
          status: ServiceStatus.COMPLETED,
          clientRating: {
            not: null
          }
        },
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              clientType: true
            }
          }
        },
        orderBy: {
          ratedAt: 'desc'
        }
      });

      // Transform data to match frontend expectations
      const formattedEvaluations = evaluations.map(service => ({
        id: service.id,
        clientName: service.client.companyName || service.client.contactPerson || 'Cliente',
        date: service.ratedAt ? service.ratedAt.toLocaleDateString('es-ES') : service.completedAt?.toLocaleDateString('es-ES') || '',
        rating: service.clientRating || 0,
        comment: service.clientComment || '',
        serviceType: service.type,
        equipment: 'Equipo de refrigeración', // Could be enhanced with actual equipment data
        serviceDate: service.completedAt ? service.completedAt.toLocaleDateString('es-ES') : '',
        title: service.title
      }));

      return formattedEvaluations;
    } catch (error) {
      console.error('Error en ServiceService.getTechnicianEvaluations:', error);
      throw error;
    }
  }

  /**
   * Rate a completed service
   * Adds client rating and comment to a service
   */
  static async rateService(serviceId: string, ratingData: {
    rating: number;
    comment?: string | null;
  }) {
    try {
      // Verify service exists
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
          client: true,
          technician: true
        }
      });

      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      // Verify service is completed
      if (service.status !== ServiceStatus.COMPLETED) {
        throw new Error('Solo se pueden evaluar servicios completados');
      }

      // Verify service hasn't been rated yet
      if (service.clientRating !== null) {
        throw new Error('Este servicio ya ha sido evaluado');
      }

      // Validate rating range
      if (ratingData.rating < 1 || ratingData.rating > 5) {
        throw new Error('La calificación debe estar entre 1 y 5');
      }

      // Update service with rating
      const updatedService = await prisma.service.update({
        where: { id: serviceId },
        data: {
          clientRating: ratingData.rating,
          clientComment: ratingData.comment ? ratingData.comment : null,
          ratedAt: new Date()
        },
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true
            }
          },
          technician: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Update technician's average rating
      if (service.technicianId) {
        await this.updateTechnicianAverageRating(service.technicianId);
      }

      return updatedService;
    } catch (error) {
      console.error('Error en ServiceService.rateService:', error);
      throw error;
    }
  }

  /**
   * Update technician's average rating based on all their service ratings
   */
  static async updateTechnicianAverageRating(technicianId: string) {
    try {
      // Get all rated services for this technician
      const ratedServices = await prisma.service.findMany({
        where: {
          technicianId: technicianId,
          clientRating: {
            not: null
          }
        },
        select: {
          clientRating: true
        }
      });

      if (ratedServices.length === 0) {
        return;
      }

      // Calculate average rating
      const totalRating = ratedServices.reduce((sum, service) => sum + (service.clientRating || 0), 0);
      const averageRating = totalRating / ratedServices.length;

      // Update technician's rating
      await prisma.technician.update({
        where: { id: technicianId },
        data: {
          rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
        }
      });

      console.log(`Updated technician ${technicianId} rating to ${averageRating.toFixed(1)}`);
    } catch (error) {
      console.error('Error updating technician average rating:', error);
      // Don't throw error here as this is a secondary operation
    }
  }
}