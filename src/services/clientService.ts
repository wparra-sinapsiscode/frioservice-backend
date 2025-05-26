import { PrismaClient, ClientType, ClientStatus, Client, UserRole } from '@prisma/client';
import { hashPassword } from '../utils/auth'; // Ruta que confirmaste para hashPassword

const prisma = new PrismaClient();

// Tipos originales para operaciones de cliente
export interface CreateClientData {
  userId: string; // Se refiere al ID de un usuario existente con rol CLIENTE para este método
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
  // Campos que tu frontend podría estar enviando y que tu modelo Client podría tener
  name?: string;
  ruc?: string;
  dni?: string;
  sector?: string;
  lastName?: string;
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
  // Campos que tu frontend podría estar enviando y que tu modelo Client podría tener
  name?: string;
  ruc?: string;
  dni?: string;
  sector?: string;
  lastName?: string;
}

export interface ClientFilters {
  status?: ClientStatus;
  clientType?: ClientType;
  city?: string;
  isVip?: boolean;
  search?: string;
}

export interface ClientWithRelations extends Client {
  user: {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    role: UserRole; // Añadido para consistencia
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

// --- NUEVA INTERFAZ AÑADIDA ---
// Payload para cuando un administrador crea un cliente y su usuario asociado
export interface AdminCreateClientAndUserPayload {
  newUser: {
    username: string;
    email: string;
    password?: string; // Obligatorio para la creación
  };
  clientProfile: {
    clientType: ClientType; // 'COMPANY' o 'PERSONAL'
    companyName?: string;   // Si es COMPANY
    firstName?: string;     // Nombre si es PERSONAL
    lastName?: string;      // Apellido si es PERSONAL
    name?: string;          // Nombre general que el frontend podría enviar
    ruc?: string;
    dni?: string;
    phone?: string;
    address?: string;
    city?: string;
    district?: string;
    sector?: string;
    email?: string; // Email de contacto del perfil
    contactPerson?: string;
    businessRegistration?: string;
    emergencyContact?: string;
    postalCode?: string;
    preferredSchedule?: string;
    notes?: string;
    isVip?: boolean;
    discount?: number;
  };
}
// --- FIN DE LA NUEVA INTERFAZ ---

export class ClientService {
  // --- MÉTODO NUEVO AÑADIDO ---
  /**
   * Crea un nuevo cliente Y su cuenta de usuario. Usado por un administrador.
   */
  static async adminCreatesClientWithUser(payload: AdminCreateClientAndUserPayload): Promise<ClientWithRelations> {
    try {
      if (!payload.newUser.password) {
        throw new Error('La contraseña es requerida para el nuevo usuario del cliente.');
      }
      const hashedPassword = await hashPassword(payload.newUser.password);

      const newClientUser = await prisma.user.create({
        data: {
          username: payload.newUser.username,
          email: payload.newUser.email,
          passwordHash: hashedPassword, // Asumiendo que tu campo en schema.prisma se llama 'passwordHash'
          role: UserRole.CLIENT,
          isActive: true,
        }
      });

      const clientDataForDb: any = {
        userId: newClientUser.id,
        clientType: payload.clientProfile.clientType,
        phone: payload.clientProfile.phone,
        email: payload.clientProfile.email || payload.newUser.email,
        address: payload.clientProfile.address,
        city: payload.clientProfile.city,
        district: payload.clientProfile.district,
        status: ClientStatus.ACTIVE,
        // contactPerson: payload.clientProfile.contactPerson ?? null, // Se manejará abajo
        businessRegistration: payload.clientProfile.businessRegistration ?? null, // Se manejará abajo
        emergencyContact: payload.clientProfile.emergencyContact ?? null,
        postalCode: payload.clientProfile.postalCode ?? null,
        preferredSchedule: payload.clientProfile.preferredSchedule ?? null,
        notes: payload.clientProfile.notes ?? null,
        isVip: payload.clientProfile.isVip ?? false,
        discount: payload.clientProfile.discount ?? 0.0,
        // ELIMINAMOS: name: payload.clientProfile.name ?? null, 
      };

      if (payload.clientProfile.clientType === ClientType.COMPANY) {
        // Para empresas, el nombre va a 'companyName'
        clientDataForDb.companyName = payload.clientProfile.companyName || payload.clientProfile.name;
        clientDataForDb.businessRegistration = payload.clientProfile.ruc;
        clientDataForDb.sector = payload.clientProfile.sector;
        // Puedes establecer contactPerson si viene en el payload, sino será null
        clientDataForDb.contactPerson = payload.clientProfile.contactPerson ?? null;

      } else { // PERSONAL
        // Para personas, el nombre completo o el nombre principal va a 'contactPerson'
        // y no usamos 'companyName'.
        let fullName = '';
        if (payload.clientProfile.firstName || payload.clientProfile.lastName) {
          fullName = `${payload.clientProfile.firstName || ''} ${payload.clientProfile.lastName || ''}`.trim();
        } else if (payload.clientProfile.name) {
          fullName = payload.clientProfile.name;
        }
        clientDataForDb.contactPerson = fullName || payload.clientProfile.contactPerson || null;

        clientDataForDb.businessRegistration = payload.clientProfile.dni;
        // Asegúrate de que companyName sea null o no se defina para clientes personales si no aplica
        clientDataForDb.companyName = null;
      }

      const client = await prisma.client.create({
        data: clientDataForDb,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true,
              role: true
            }
          },
          _count: { select: { services: true, equipment: true, quotes: true } }
        }
      });
      return client as unknown as ClientWithRelations;
    } catch (error: any) {
      console.error('Error en adminCreatesClientWithUser:', error);
      if (error.code === 'P2002' && error.meta?.target) {
        const field = (error.meta.target as string[]).join(', ');
        if (field.includes('username')) throw new Error(`El nombre de usuario '${payload.newUser.username}' ya existe.`);
        if (field.includes('email')) throw new Error(`El email '${payload.newUser.email}' ya está registrado.`);
        throw new Error(`El campo '${field}' ya existe y debe ser único.`);
      }
      throw new Error('Error al crear el cliente y su usuario: ' + (error.message || error));
    }
  }
  // --- FIN DEL MÉTODO NUEVO ---

  /**
   * Create a new client profile (Método Original)
   * Este método asume que el userId proporcionado YA ES UN USUARIO CON ROL CLIENTE.
   */
  static async createClient(data: CreateClientData): Promise<Client> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { client: true }
      });

      if (!user) {
        throw new Error('Usuario no encontrado para asociar al perfil.');
      }
      if (user.client) {
        throw new Error('El usuario proporcionado ya tiene un perfil de cliente asociado.');
      }
      if (user.role !== UserRole.CLIENT) {
        throw new Error('El usuario que se asocia al perfil debe tener rol de CLIENTE.');
      }

      // Aseguramos que los datos para Prisma sean correctos, incluyendo el status por defecto
      const prismaData: any = {
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
        discount: data.discount ?? 0.0,
        status: ClientStatus.ACTIVE, // Estado por defecto si no se especifica
      };

      // Lógica para 'name', 'ruc', 'dni', 'sector', 'lastName' basada en clientType
      if (data.clientType === ClientType.COMPANY) {
        prismaData.name = data.companyName || data.name; // Prioriza companyName, usa name si está
        prismaData.ruc = data.ruc;
        prismaData.sector = data.sector;
      } else { // PERSONAL
        prismaData.name = data.name || data.contactPerson; // Usa name (para nombre) o contactPerson
        prismaData.dni = data.dni;
        prismaData.lastName = data.lastName;
      }

      const client = await prisma.client.create({
        data: prismaData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true,
              role: true
            }
          }
        }
      });
      return client;
    } catch (error: any) {
      console.error('Error en el método original createClient:', error);
      throw new Error('Fallo al crear el perfil de cliente: ' + error.message);
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
          { companyName: { contains: filters.search, mode: 'insensitive' } },
          { contactPerson: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { user: { username: { contains: filters.search, mode: 'insensitive' } } }
        ];
      }

      const [clientsFromDb, totalClients] = await Promise.all([
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
                isActive: true,
                role: true
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
              orderBy: { scheduledDate: 'desc' },
              take: 5
            },
            equipment: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true
              },
              take: 5
            },
            _count: {
              select: {
                services: true,
                equipment: true,
                quotes: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.client.count({ where })
      ]);

      const totalPages = Math.ceil(totalClients / limit);

      return {
        clients: clientsFromDb as ClientWithRelations[],
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
              isActive: true,
              role: true
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
            orderBy: { scheduledDate: 'desc' }
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
            orderBy: { createdAt: 'desc' }
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
              isActive: true,
              role: true
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
            orderBy: { scheduledDate: 'desc' },
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

      const client = await prisma.client.update({
        where: { id },
        data: data,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true,
              role: true
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
      const [clientData, services, equipmentCount, quotes] = await Promise.all([
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

      if (!clientData) {
        throw new Error('Cliente no encontrado para estadísticas.');
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
        totalServices: clientData.totalServices,
        equipmentCount: equipmentCount,
        nextServiceDate: clientData.nextServiceDate,
        memberSince: clientData.createdAt,
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