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
        completedAt: new Date(),
        notes: completionData.technicianNotes
      };

      if (typeof completionData.timeSpent === 'number') {
        updateData.actualDuration = completionData.timeSpent;
      }

      const service = await this.updateService(serviceId, updateData);

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
}