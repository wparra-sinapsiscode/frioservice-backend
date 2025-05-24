import { PrismaClient, ClientType, ClientStatus, Client } from '@prisma/client';

const prisma = new PrismaClient();

// Types for client operations
export interface CreateClientData {
  userId: string;
  companyName?: string;
  contactPerson?: string;
  businessRegistration?: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  clientType: ClientType;
  preferredSchedule?: string;
  notes?: string;
  isVip?: boolean;
  discount?: number;
}

export interface UpdateClientData {
  companyName?: string;
  contactPerson?: string;
  businessRegistration?: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  clientType?: ClientType;
  status?: ClientStatus;
  preferredSchedule?: string;
  nextServiceDate?: Date;
  notes?: string;
  isVip?: boolean;
  discount?: number;
}

export interface ClientFilters {
  status?: ClientStatus;
  clientType?: ClientType;
  city?: string;
  isVip?: boolean;
  search?: string; // For searching by name, email, or company
}

export interface ClientWithRelations extends Client {
  user: {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
  };
  services: Array<{
    id: string;
    title: string;
    status: string;
    scheduledDate: Date;
    type: string;
  }>;
  equipment: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
  }>;
  _count: {
    services: number;
    equipment: number;
    quotes: number;
  };
}

export class ClientService {
  /**
   * Create a new client profile
   */
  static async createClient(data: CreateClientData): Promise<Client> {
    try {
      // Validate that user exists and is a CLIENT
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { client: true }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.client) {
        throw new Error('El usuario ya tiene un perfil de cliente');
      }

      if (user.role !== 'CLIENT') {
        throw new Error('El usuario debe tener rol de cliente');
      }

      // Create client profile
      const client = await prisma.client.create({
        data: {
          userId: data.userId,
          companyName: data.companyName ?? null,
          contactPerson: data.contactPerson ?? null,
          businessRegistration: data.businessRegistration ?? null,
          phone: data.phone ?? null,
          email: data.email ?? user.email,
          emergencyContact: data.emergencyContact ?? null,
          address: data.address ?? null,
          city: data.city ?? null,
          postalCode: data.postalCode ?? null,
          clientType: data.clientType,
          preferredSchedule: data.preferredSchedule ?? null,
          notes: data.notes ?? null,
          isVip: data.isVip ?? false,
          discount: data.discount ?? 0.0
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true
            }
          }
        }
      });

      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  /**
   * Get all clients with filtering and pagination
   */
  static async getClients(
    filters: ClientFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.clientType) {
        where.clientType = filters.clientType;
      }

      if (filters.city) {
        where.city = {
          contains: filters.city,
          mode: 'insensitive'
        };
      }

      if (filters.isVip !== undefined) {
        where.isVip = filters.isVip;
      }

      if (filters.search) {
        where.OR = [
          {
            companyName: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            contactPerson: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            user: {
              username: {
                contains: filters.search,
                mode: 'insensitive'
              }
            }
          }
        ];
      }

      // Get clients with relations
      const [clients, totalClients] = await Promise.all([
        prisma.client.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                isActive: true
              }
            },
            services: {
              select: {
                id: true,
                title: true,
                status: true,
                scheduledDate: true,
                type: true
              },
              orderBy: {
                scheduledDate: 'desc'
              },
              take: 5 // Latest 5 services
            },
            equipment: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true
              },
              take: 5 // Latest 5 equipment
            },
            _count: {
              select: {
                services: true,
                equipment: true,
                quotes: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.client.count({ where })
      ]);

      const totalPages = Math.ceil(totalClients / limit);

      return {
        clients,
        totalClients,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  /**
   * Get client by ID with full details
   */
  static async getClientById(id: string): Promise<ClientWithRelations | null> {
    try {
      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true
            }
          },
          services: {
            select: {
              id: true,
              title: true,
              status: true,
              scheduledDate: true,
              type: true,
              priority: true,
              estimatedDuration: true
            },
            orderBy: {
              scheduledDate: 'desc'
            }
          },
          equipment: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              brand: true,
              model: true
            }
          },
          quotes: {
            select: {
              id: true,
              title: true,
              amount: true,
              status: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: {
              services: true,
              equipment: true,
              quotes: true
            }
          }
        }
      });

      return client as ClientWithRelations | null;
    } catch (error) {
      console.error('Error fetching client by ID:', error);
      throw error;
    }
  }

  /**
   * Get client by user ID
   */
  static async getClientByUserId(userId: string): Promise<ClientWithRelations | null> {
    try {
      const client = await prisma.client.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true
            }
          },
          services: {
            select: {
              id: true,
              title: true,
              status: true,
              scheduledDate: true,
              type: true
            },
            orderBy: {
              scheduledDate: 'desc'
            },
            take: 10
          },
          equipment: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true
            }
          },
          _count: {
            select: {
              services: true,
              equipment: true,
              quotes: true
            }
          }
        }
      });

      return client as ClientWithRelations | null;
    } catch (error) {
      console.error('Error fetching client by user ID:', error);
      throw error;
    }
  }

  /**
   * Update client profile
   */
  static async updateClient(id: string, data: UpdateClientData): Promise<Client | null> {
    try {
      const existingClient = await prisma.client.findUnique({
        where: { id }
      });

      if (!existingClient) {
        return null;
      }

      // Update total services count if needed
      const updateData: any = { ...data };
      
      const client = await prisma.client.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true
            }
          }
        }
      });

      return client;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  /**
   * Delete client (soft delete by setting status to INACTIVE)
   */
  static async deleteClient(id: string): Promise<boolean> {
    try {
      const existingClient = await prisma.client.findUnique({
        where: { id }
      });

      if (!existingClient) {
        return false;
      }

      // Soft delete by updating status
      await prisma.client.update({
        where: { id },
        data: {
          status: ClientStatus.INACTIVE
        }
      });

      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  /**
   * Get client statistics
   */
  static async getClientStats(clientId: string) {
    try {
      const [client, services, equipment, quotes] = await Promise.all([
        prisma.client.findUnique({
          where: { id: clientId },
          select: {
            totalServices: true,
            nextServiceDate: true,
            createdAt: true
          }
        }),
        prisma.service.groupBy({
          by: ['status'],
          where: { clientId },
          _count: {
            status: true
          }
        }),
        prisma.equipment.count({
          where: { clientId }
        }),
        prisma.quote.groupBy({
          by: ['status'],
          where: { clientId },
          _count: {
            status: true
          }
        })
      ]);

      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      const serviceStats = services.reduce((acc, service) => {
        acc[service.status.toLowerCase()] = service._count.status;
        return acc;
      }, {} as Record<string, number>);

      const quoteStats = quotes.reduce((acc, quote) => {
        acc[quote.status.toLowerCase()] = quote._count.status;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalServices: client.totalServices,
        equipmentCount: equipment,
        nextServiceDate: client.nextServiceDate,
        memberSince: client.createdAt,
        servicesByStatus: serviceStats,
        quotesByStatus: quoteStats
      };
    } catch (error) {
      console.error('Error fetching client stats:', error);
      throw error;
    }
  }

  /**
   * Update service count for client
   */
  static async updateServiceCount(clientId: string): Promise<void> {
    try {
      const serviceCount = await prisma.service.count({
        where: { clientId }
      });

      await prisma.client.update({
        where: { id: clientId },
        data: { totalServices: serviceCount }
      });
    } catch (error) {
      console.error('Error updating service count:', error);
      throw error;
    }
  }

  /**
   * Update next service date for client
   */
  static async updateNextServiceDate(clientId: string): Promise<void> {
    try {
      const nextService = await prisma.service.findFirst({
        where: {
          clientId,
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          scheduledDate: {
            gte: new Date()
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        },
        select: {
          scheduledDate: true
        }
      });

      await prisma.client.update({
        where: { id: clientId },
        data: {
          nextServiceDate: nextService?.scheduledDate || null
        }
      });
    } catch (error) {
      console.error('Error updating next service date:', error);
      throw error;
    }
  }
}