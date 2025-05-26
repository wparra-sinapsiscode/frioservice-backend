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

// En src/services/clientService.ts (al principio del archivo, con tus otras interfaces)

export interface UpdateClientData {
  // Campos del Perfil del Cliente
  companyName?: string;
  contactPerson?: string; // Asegúrate que tu frontend pueda enviar esto si es diferente al nombre del usuario
  businessRegistration?: string; // El backend lo llenará con ruc o dni
  phone?: string;
  email?: string; // Email de contacto del perfil (si es diferente al del usuario)
  emergencyContact?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  clientType?: ClientType;
  status?: ClientStatus;
  preferredSchedule?: string;
  nextServiceDate?: Date;
  notes?: string;
  isVip?: boolean;
  discount?: number;
  name?: string; // Nombre general si lo usas para mapear companyName o firstName
  sector?: string;

  // Campos que vienen del frontend y que necesitan mapeo
  ruc?: string;  // Para mapear a businessRegistration si es COMPANY
  dni?: string;  // Para mapear a businessRegistration si es PERSONAL
  firstName?: string; // Para mapear a name/contactPerson si es PERSONAL
  lastName?: string;  // Para mapear a contactPerson si es PERSONAL

  // Campos OPCIONALES para actualizar el USUARIO asociado al cliente
  user?: {
    username?: string;
    email?: string; // Email de login del usuario
    password?: string; // Nueva contraseña (debe hashearse)
    isActive?: boolean;
  };
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
  static async adminCreatesClientWithUser(payload: AdminCreateClientAndUserPayload): Promise<ClientWithRelations> {
    try {
      if (!payload.newUser.password) {
        throw new Error('La contraseña es requerida para el nuevo usuario del cliente.');
      }
      const hashedPassword = await hashPassword(payload.newUser.password);

      console.log(">>> [SERVICE] Creando nuevo usuario para cliente con datos:", payload.newUser.username, payload.newUser.email);
      const newClientUser = await prisma.user.create({
        data: {
          username: payload.newUser.username,
          email: payload.newUser.email,
          passwordHash: hashedPassword, // Confirma que 'passwordHash' es el nombre en tu schema.prisma
          role: UserRole.CLIENT,
          isActive: true,
        }
      });
      console.log("<<< [SERVICE] Usuario para cliente CREADO:", JSON.stringify(newClientUser, null, 2));

      const clientDataForDb: any = {
        userId: newClientUser.id,
        clientType: payload.clientProfile.clientType,
        phone: payload.clientProfile.phone,
        email: payload.clientProfile.email || payload.newUser.email,
        address: payload.clientProfile.address,
        city: payload.clientProfile.city,
        district: payload.clientProfile.district, // Correcto si ya lo añadiste al schema
        status: ClientStatus.ACTIVE,
        // contactPerson y companyName se asignarán abajo
        businessRegistration: null, // Se establecerá abajo
        emergencyContact: payload.clientProfile.emergencyContact ?? null,
        postalCode: payload.clientProfile.postalCode ?? null,
        preferredSchedule: payload.clientProfile.preferredSchedule ?? null,
        notes: payload.clientProfile.notes ?? null,
        isVip: payload.clientProfile.isVip ?? false,
        discount: payload.clientProfile.discount ?? 0.0,
        sector: null, // Se establecerá abajo si aplica y existe en el schema
      };

      if (payload.clientProfile.clientType === ClientType.COMPANY) {
        // Para empresas, el nombre va a 'companyName'
        clientDataForDb.companyName = payload.clientProfile.companyName || payload.clientProfile.name;
        clientDataForDb.businessRegistration = payload.clientProfile.ruc;
        // Solo asigna 'sector' si realmente existe en tu modelo Client
        if (payload.clientProfile.sector !== undefined) { // Y si el campo existe en el schema
          clientDataForDb.sector = payload.clientProfile.sector;
        }
        // El contactPerson para una empresa es opcional y puede venir del formulario
        clientDataForDb.contactPerson = payload.clientProfile.contactPerson ?? null;

      } else { // PERSONAL
        // Para personas, el nombre completo va a 'contactPerson'
        let fullName = '';
        if (payload.clientProfile.firstName || payload.clientProfile.lastName) {
          fullName = `${payload.clientProfile.firstName || ''} ${payload.clientProfile.lastName || ''}`.trim();
        } else if (payload.clientProfile.name) { // Usar 'name' del payload si firstName/lastName no están
          fullName = payload.clientProfile.name;
        }
        clientDataForDb.contactPerson = fullName || payload.clientProfile.contactPerson || null;

        clientDataForDb.businessRegistration = payload.clientProfile.dni;
        // Asegurarse de que companyName y sector sean null para clientes personales
        clientDataForDb.companyName = null;
        clientDataForDb.sector = null;
      }


      console.log(">>> [SERVICE] Creando perfil de cliente con datos (clientDataForDb):", JSON.stringify(clientDataForDb, null, 2));
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
      console.log("<<< [SERVICE] Perfil de cliente CREADO:", JSON.stringify(client, null, 2));

      return client as unknown as ClientWithRelations;
    } catch (error: any) {
      console.error('### ERROR CAPTURADO en adminCreatesClientWithUser (clientService.ts):', error);
      // ... (tu manejo de errores P2002 existente) ...
      if (error.code === 'P2002' && error.meta?.target) {
        const field = (error.meta.target as string[]).join(', ');
        if (field.includes('username')) throw new Error(`El nombre de usuario '${payload.newUser.username}' ya existe.`);
        if (field.includes('email')) throw new Error(`El email '${payload.newUser.email}' ya está registrado.`);
        throw new Error(`El campo '${field}' ya existe y debe ser único.`);
      }
      // Para otros errores de Prisma o errores generales
      const prismaError = error.message?.match(/Unknown argument `(\w+)`/);
      if (prismaError && prismaError[1]) {
        throw new Error(`Error de Prisma: El campo '${prismaError[1]}' es desconocido en el modelo Client.`);
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
  // En src/services/clientService.ts (dentro de la clase ClientService)

  // ... (asegúrate de tener los imports de Prisma y hashPassword) ...

  static async updateClient(clientId: string, dataFromController: UpdateClientData): Promise<ClientWithRelations | null> {
    try {
      const { user: userDataToUpdate, ...clientProfilePayload } = dataFromController;

      console.log(">>> [SERVICE UPDATE] Datos de perfil recibidos:", JSON.stringify(clientProfilePayload, null, 2));
      if (userDataToUpdate) {
        console.log(">>> [SERVICE UPDATE] Datos de usuario recibidos:", JSON.stringify(userDataToUpdate, null, 2));
      }

      const updatedClient = await prisma.$transaction(async (tx) => {
        const existingClient = await tx.client.findUnique({
          where: { id: clientId },
          include: { user: true }
        });

        if (!existingClient) {
          throw new Error('Cliente no encontrado para actualizar.');
        }

        // 1. Actualizar el Usuario si se proporcionaron datos de usuario
        if (userDataToUpdate && Object.keys(userDataToUpdate).length > 0) {
          const userUpdateData: any = {};
          if (userDataToUpdate.username) userUpdateData.username = userDataToUpdate.username;
          if (userDataToUpdate.email) userUpdateData.email = userDataToUpdate.email;
          if (userDataToUpdate.password) {
            if (userDataToUpdate.password.length < 6) { // Ejemplo de validación
              throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
            }
            userUpdateData.passwordHash = await hashPassword(userDataToUpdate.password); // Asume campo passwordHash
          }
          if (userDataToUpdate.isActive !== undefined) userUpdateData.isActive = userDataToUpdate.isActive;

          if (Object.keys(userUpdateData).length > 0) {
            console.log(">>> [SERVICE - TX UPDATE] Actualizando usuario con:", JSON.stringify(userUpdateData, null, 2));
            await tx.user.update({
              where: { id: existingClient.userId },
              data: userUpdateData,
            });
            console.log("<<< [SERVICE - TX UPDATE] Usuario actualizado.");
          }
        }

        // 2. Preparar y Actualizar el Perfil del Cliente
        const clientDataForDbUpdate: any = {};

        // Asignar campos directos del perfil que SÍ existen en el modelo Client
        // y que vienen en clientProfilePayload
        if (clientProfilePayload.phone !== undefined) clientDataForDbUpdate.phone = clientProfilePayload.phone;
        // El email del perfil del cliente (diferente al email de login del usuario si es necesario)
        if (clientProfilePayload.email !== undefined) clientDataForDbUpdate.email = clientProfilePayload.email;
        if (clientProfilePayload.address !== undefined) clientDataForDbUpdate.address = clientProfilePayload.address;
        if (clientProfilePayload.city !== undefined) clientDataForDbUpdate.city = clientProfilePayload.city;
        if (clientProfilePayload.district !== undefined) clientDataForDbUpdate.district = clientProfilePayload.district;
        if (clientProfilePayload.postalCode !== undefined) clientDataForDbUpdate.postalCode = clientProfilePayload.postalCode;
        if (clientProfilePayload.clientType !== undefined) clientDataForDbUpdate.clientType = clientProfilePayload.clientType;
        if (clientProfilePayload.status !== undefined) clientDataForDbUpdate.status = clientProfilePayload.status;
        if (clientProfilePayload.preferredSchedule !== undefined) clientDataForDbUpdate.preferredSchedule = clientProfilePayload.preferredSchedule;
        if (clientProfilePayload.nextServiceDate !== undefined) clientDataForDbUpdate.nextServiceDate = clientProfilePayload.nextServiceDate;
        if (clientProfilePayload.notes !== undefined) clientDataForDbUpdate.notes = clientProfilePayload.notes;
        if (clientProfilePayload.isVip !== undefined) clientDataForDbUpdate.isVip = clientProfilePayload.isVip;
        if (clientProfilePayload.discount !== undefined) clientDataForDbUpdate.discount = clientProfilePayload.discount;
        if (clientProfilePayload.contactPerson !== undefined) clientDataForDbUpdate.contactPerson = clientProfilePayload.contactPerson;
        // No incluimos businessRegistration aquí directamente, se setea abajo

        // Lógica de mapeo para companyName, name, ruc, dni, sector
        const typeToUse = clientProfilePayload.clientType || existingClient.clientType;

        if (typeToUse === ClientType.COMPANY) {
          if (clientProfilePayload.companyName !== undefined || clientProfilePayload.name !== undefined) {
            clientDataForDbUpdate.companyName = clientProfilePayload.companyName || clientProfilePayload.name;
          }
          if (clientProfilePayload.ruc !== undefined) {
            clientDataForDbUpdate.businessRegistration = clientProfilePayload.ruc;
          }
          if (clientProfilePayload.sector !== undefined && existingClient.sector !== undefined) { // Solo si el campo 'sector' existe en el modelo Client
            clientDataForDbUpdate.sector = clientProfilePayload.sector;
          }
        } else if (typeToUse === ClientType.PERSONAL) {
          // Para personal, el nombre principal va a contactPerson o name (según tu modelo)
          let fullNameForContact = clientDataForDbUpdate.contactPerson; // Mantener si ya se asignó arriba
          if (clientProfilePayload.firstName || clientProfilePayload.lastName) {
            fullNameForContact = `${clientProfilePayload.firstName || ''} ${clientProfilePayload.lastName || ''}`.trim();
          } else if (clientProfilePayload.name) {
            fullNameForContact = clientProfilePayload.name;
          }
          if (fullNameForContact) clientDataForDbUpdate.contactPerson = fullNameForContact; // Solo si hay algo que poner

          // Si tu modelo Client tiene un campo 'name' para personas:
          // clientDataForDbUpdate.name = clientProfilePayload.firstName || clientProfilePayload.name;

          if (clientProfilePayload.dni !== undefined) {
            clientDataForDbUpdate.businessRegistration = clientProfilePayload.dni;
          }
        }

        console.log(">>> [SERVICE - TX UPDATE] Actualizando perfil de cliente con (clientDataForDbUpdate):", JSON.stringify(clientDataForDbUpdate, null, 2));
        const client = await tx.client.update({
          where: { id: clientId },
          data: clientDataForDbUpdate,
          include: {
            user: {
              select: { id: true, username: true, email: true, isActive: true, role: true }
            },
            _count: { select: { services: true, equipment: true, quotes: true } }
          }
        });
        console.log("<<< [SERVICE - TX UPDATE] Perfil de cliente actualizado.");
        return client;
      });

      return updatedClient as ClientWithRelations;
    } catch (error: any) {
      console.error('### ERROR CAPTURADO en updateClient (clientService.ts):', error);
      if (error.code === 'P2002' && error.meta?.target) {
        const field = (error.meta.target as string[]).join(', ');
        throw new Error(`Error de unicidad al actualizar: el campo '${field}' ya existe.`);
      }
      // Para otros errores de Prisma
      const prismaError = error.message?.match(/Unknown argument `(\w+)`/);
      if (prismaError && prismaError[1]) {
        throw new Error(`Error de Prisma en Update: El campo '${prismaError[1]}' es desconocido en el modelo Client.`);
      }
      throw new Error(error.message || 'Error al actualizar el cliente.');
    }
  }

  /**
   * Delete client (soft delete by setting status to INACTIVE)
   */
  // static async deleteClient(id: string): Promise<boolean> {
  //   try {
  //     const existingClient = await prisma.client.findUnique({
  //       where: { id }
  //     });

  //     if (!existingClient) {
  //       return false;
  //     }

  //     await prisma.client.update({
  //       where: { id },
  //       data: {
  //         status: ClientStatus.INACTIVE
  //       }
  //     });
  //     return true;
  //   } catch (error) {
  //     console.error('Error deleting client:', error);
  //     throw error;
  //   }
  // }

  /**
 * PERMANENTLY delete a client AND its associated user (if the user has CLIENT role).
 * ¡CUIDADO! Esta acción es irreversible.
 */
  static async deleteClient(id: string): Promise<boolean> {
    try {
      const clientToDelete = await prisma.client.findUnique({
        where: { id },
        select: { userId: true } // Obtenemos el userId para saber qué usuario borrar
      });

      if (!clientToDelete) {
        console.log(`[SERVICE_DELETE] Cliente con ID ${id} no encontrado.`);
        return false; // Cliente no encontrado, nada que eliminar
      }

      console.log(`[SERVICE_DELETE] Iniciando eliminación para cliente ID: ${id}, usuario asociado ID: ${clientToDelete.userId}`);

      await prisma.$transaction(async (tx) => {
        // 1. Intentar eliminar el perfil del cliente primero.
        // Si hay relaciones (servicios, cotizaciones) que no tienen onDelete: Cascade,
        // esto podría fallar aquí si esos registros relacionados existen.
        console.log(`[SERVICE_DELETE - TX] Intentando eliminar perfil del cliente ID: ${id}`);
        await tx.client.delete({
          where: { id },
        });
        console.log(`[SERVICE_DELETE - TX] Perfil del cliente ID: ${id} eliminado.`);

        // 2. Eliminar el registro de Usuario asociado al cliente.
        const userAssociated = await tx.user.findUnique({
          where: { id: clientToDelete.userId }
        });

        if (userAssociated) {
          // Condición de seguridad: Solo borrar el usuario si es un 'CLIENT'.
          // Esto previene borrar accidentalmente un ADMIN o TECHNICIAN si por error
          // un perfil de cliente se asoció a uno de ellos.
          if (userAssociated.role === 'CLIENT') { // O UserRole.CLIENT si usas el enum
            console.log(`[SERVICE_DELETE - TX] Intentando eliminar usuario asociado ID: ${clientToDelete.userId}, Username: ${userAssociated.username}`);
            await tx.user.delete({
              where: { id: clientToDelete.userId },
            });
            console.log(`[SERVICE_DELETE - TX] Usuario asociado ID: ${clientToDelete.userId} eliminado.`);
          } else {
            console.warn(`[SERVICE_DELETE - TX] El usuario ${userAssociated.username} (ID: ${clientToDelete.userId}) asociado al cliente ${id} no es ROL CLIENTE (su rol es ${userAssociated.role}). No se eliminará el usuario.`);
          }
        } else {
          console.warn(`[SERVICE_DELETE - TX] No se encontró un usuario asociado con ID: ${clientToDelete.userId} para el cliente ${id}. Solo se eliminó el perfil del cliente.`);
        }
      });

      console.log(`[SERVICE_DELETE] Eliminación completa y exitosa para cliente ID: ${id}`);
      return true;
    } catch (error: any) {
      console.error('### ERROR CAPTURADO en deleteClient (clientService.ts):', error);
      if (error.code === 'P2003' || (error.message && error.message.toLowerCase().includes('foreign key constraint'))) {
        // Error P2003: Foreign key constraint failed on the field: `...`
        // Esto significa que hay otros registros (ej. Servicios, Cotizaciones) que dependen de este Cliente.
        throw new Error('No se puede eliminar el cliente porque tiene registros asociados (ej. servicios, cotizaciones). Primero debe eliminar o reasignar esos registros.');
      }
      throw new Error('Error al eliminar el cliente: ' + error.message);
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