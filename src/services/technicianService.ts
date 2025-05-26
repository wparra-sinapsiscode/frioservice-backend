import { PrismaClient, UserRole, Technician } from '@prisma/client';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Interfaces para operaciones de técnico
export interface CreateTechnicianData {
  userId: string; // Se refiere al ID de un usuario existente con rol TECHNICIAN
  specialty: string;
  experienceYears: number;
  phone?: string;
  rating?: number;
  isAvailable?: boolean;
  averageTime?: string;
}

export interface UpdateTechnicianData {
  // Campos del Perfil del Técnico
  specialty?: string;
  experienceYears?: number;
  phone?: string;
  rating?: number;
  isAvailable?: boolean;
  servicesCompleted?: number;
  averageTime?: string;

  // Campos OPCIONALES para actualizar el USUARIO asociado al técnico
  user?: {
    username?: string;
    email?: string;
    password?: string; // Nueva contraseña (debe hashearse)
    isActive?: boolean;
  };
}

export interface TechnicianFilters {
  specialty?: string;
  isAvailable?: boolean;
  minRating?: number;
  search?: string;
}

export interface TechnicianWithRelations extends Technician {
  user: {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    role: UserRole;
  };
  services: Array<{
    id: string;
    title: string;
    status: string;
    scheduledDate: Date;
    type: string;
  }>;
  _count: {
    services: number;
  };
}

// --- NUEVA INTERFAZ AÑADIDA ---
// Payload para cuando un administrador crea un técnico y su usuario asociado
export interface AdminCreateTechnicianAndUserPayload {
  newUser: {
    username: string;
    email: string;
    password: string; // Obligatorio para la creación
  };
  technicianProfile: {
    specialty: string; // Campo obligatorio del modelo
    experienceYears: number; // Campo obligatorio
    phone?: string;
    rating?: number; // Default 0.0
    isAvailable?: boolean; // Default true
    averageTime?: string;
    servicesCompleted?: number;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
}
// --- FIN DE LA NUEVA INTERFAZ ---

export class TechnicianService {
  static async adminCreatesTechnicianWithUser(payload: AdminCreateTechnicianAndUserPayload): Promise<TechnicianWithRelations> {
    try {
      if (!payload.newUser.password) {
        throw new Error('La contraseña es requerida para el nuevo usuario del técnico.');
      }

      // Validaciones específicas para técnicos
      if (!payload.technicianProfile.specialty?.trim()) {
        throw new Error('La especialidad es requerida para el técnico.');
      }
      if (payload.technicianProfile.experienceYears < 0 || payload.technicianProfile.experienceYears > 50) {
        throw new Error('Los años de experiencia deben estar entre 0 y 50.');
      }

      const hashedPassword = await hashPassword(payload.newUser.password);

      console.log("🚨 [SERVICE] PAYLOAD RECIBIDO:", JSON.stringify(payload, null, 2));
      console.log("🚨 [SERVICE] RATING en payload:", payload.technicianProfile.rating, "tipo:", typeof payload.technicianProfile.rating);
      console.log("🚨 [SERVICE] AVERAGETIME en payload:", payload.technicianProfile.averageTime, "tipo:", typeof payload.technicianProfile.averageTime);
      console.log(">>> [SERVICE] Creando nuevo usuario para técnico con datos:", payload.newUser.username, payload.newUser.email);
      
      const result = await prisma.$transaction(async (tx) => {
        // 1. Crear el usuario
        const newTechnicianUser = await tx.user.create({
          data: {
            username: payload.newUser.username,
            email: payload.newUser.email,
            passwordHash: hashedPassword,
            role: UserRole.TECHNICIAN,
            isActive: true,
          }
        });
        console.log("<<< [SERVICE] Usuario para técnico CREADO:", JSON.stringify(newTechnicianUser, null, 2));

        // 2. Preparar datos del técnico
        const technicianDataForDb = {
          userId: newTechnicianUser.id,
          specialty: payload.technicianProfile.specialty.trim(),
          experienceYears: payload.technicianProfile.experienceYears,
          phone: payload.technicianProfile.phone || null,
          rating: payload.technicianProfile.rating !== undefined && payload.technicianProfile.rating !== null 
            ? Number(payload.technicianProfile.rating) 
            : 0.0,
          isAvailable: payload.technicianProfile.isAvailable ?? true,
          servicesCompleted: payload.technicianProfile.servicesCompleted !== undefined ? payload.technicianProfile.servicesCompleted : 0,
          averageTime: payload.technicianProfile.averageTime && payload.technicianProfile.averageTime.trim() 
            ? payload.technicianProfile.averageTime.trim() 
            : null,
          firstName: payload.technicianProfile.firstName || null,
          lastName: payload.technicianProfile.lastName || null,
          name: payload.technicianProfile.name || null,
        };

        console.log("🚨 [SERVICE] DATOS PARA DB - RATING:", technicianDataForDb.rating, "tipo:", typeof technicianDataForDb.rating);
        console.log("🚨 [SERVICE] DATOS PARA DB - AVERAGETIME:", technicianDataForDb.averageTime, "tipo:", typeof technicianDataForDb.averageTime);
        console.log(">>> [SERVICE] Creando perfil de técnico con datos:", JSON.stringify(technicianDataForDb, null, 2));
        
        // 3. Crear el perfil del técnico
        console.log("🚨 [SERVICE] JUSTO ANTES DE LLAMAR A PRISMA CREATE - technicianDataForDb:", JSON.stringify(technicianDataForDb, null, 2));
        
        const technician = await tx.technician.create({
          data: technicianDataForDb,
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
            _count: { 
              select: { services: true } 
            }
          }
        });
        
        console.log("🚨 [SERVICE] RESULTADO DE PRISMA CREATE - rating:", technician.rating, "averageTime:", technician.averageTime);
        console.log("<<< [SERVICE] Perfil de técnico CREADO:", JSON.stringify(technician, null, 2));

        return technician;
      });

      return result as TechnicianWithRelations;
    } catch (error: any) {
      console.error('### ERROR CAPTURADO en adminCreatesTechnicianWithUser (technicianService.ts):', error);
      
      // Manejo de errores específicos de Prisma
      if (error.code === 'P2002' && error.meta?.target) {
        const field = (error.meta.target as string[]).join(', ');
        if (field.includes('username')) throw new Error(`El nombre de usuario '${payload.newUser.username}' ya existe.`);
        if (field.includes('email')) throw new Error(`El email '${payload.newUser.email}' ya está registrado.`);
        throw new Error(`El campo '${field}' ya existe y debe ser único.`);
      }
      
      // Para otros errores de Prisma o errores generales
      const prismaError = error.message?.match(/Unknown argument `(\w+)`/);
      if (prismaError && prismaError[1]) {
        throw new Error(`Error de Prisma: El campo '${prismaError[1]}' es desconocido en el modelo Technician.`);
      }
      
      throw new Error('Error al crear el técnico y su usuario: ' + (error.message || error));
    }
  }

  /**
   * Create a new technician profile (Método Original)
   * Este método asume que el userId proporcionado YA ES UN USUARIO CON ROL TECHNICIAN.
   */
  static async createTechnician(data: CreateTechnicianData): Promise<Technician> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { technician: true }
      });

      if (!user) {
        throw new Error('Usuario no encontrado para asociar al perfil.');
      }
      if (user.technician) {
        throw new Error('El usuario proporcionado ya tiene un perfil de técnico asociado.');
      }
      if (user.role !== UserRole.TECHNICIAN) {
        throw new Error('El usuario que se asocia al perfil debe tener rol de TECHNICIAN.');
      }

      // Validaciones específicas
      if (!data.specialty?.trim()) {
        throw new Error('La especialidad es requerida.');
      }
      if (data.experienceYears < 0 || data.experienceYears > 50) {
        throw new Error('Los años de experiencia deben estar entre 0 y 50.');
      }

      const prismaData = {
        userId: data.userId,
        specialty: data.specialty.trim(),
        experienceYears: data.experienceYears,
        phone: data.phone || null,
        rating: data.rating ?? 0.0,
        isAvailable: data.isAvailable ?? true,
        servicesCompleted: 0,
        averageTime: data.averageTime || null,
      };

      const technician = await prisma.technician.create({
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
      
      return technician;
    } catch (error: any) {
      console.error('Error en el método original createTechnician:', error);
      throw new Error('Fallo al crear el perfil de técnico: ' + error.message);
    }
  }

  /**
   * Get all technicians with filtering and pagination
   */
  static async getTechnicians(
    filters: TechnicianFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (filters.specialty) {
        where.specialty = {
          contains: filters.specialty,
          mode: 'insensitive'
        };
      }
      if (filters.isAvailable !== undefined) {
        where.isAvailable = filters.isAvailable;
      }
      if (filters.minRating !== undefined) {
        where.rating = {
          gte: filters.minRating
        };
      }
      if (filters.search) {
        where.OR = [
          { specialty: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
          { user: { username: { contains: filters.search, mode: 'insensitive' } } },
          { user: { email: { contains: filters.search, mode: 'insensitive' } } }
        ];
      }

      const [techniciansFromDb, totalTechnicians] = await Promise.all([
        prisma.technician.findMany({
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
            _count: {
              select: {
                services: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.technician.count({ where })
      ]);

      const totalPages = Math.ceil(totalTechnicians / limit);

      return {
        technicians: techniciansFromDb as TechnicianWithRelations[],
        totalTechnicians,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }
  }

  /**
   * Get technician by ID with full details
   */
  static async getTechnicianById(id: string): Promise<TechnicianWithRelations | null> {
    try {
      const technician = await prisma.technician.findUnique({
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
          _count: {
            select: {
              services: true
            }
          }
        }
      });
      return technician as TechnicianWithRelations | null;
    } catch (error) {
      console.error('Error fetching technician by ID:', error);
      throw error;
    }
  }

  /**
   * Get technician by user ID
   */
  static async getTechnicianByUserId(userId: string): Promise<TechnicianWithRelations | null> {
    try {
      const technician = await prisma.technician.findUnique({
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
          _count: {
            select: {
              services: true
            }
          }
        }
      });
      return technician as TechnicianWithRelations | null;
    } catch (error) {
      console.error('Error fetching technician by user ID:', error);
      throw error;
    }
  }

  /**
   * Update technician profile
   */
  static async updateTechnician(technicianId: string, dataFromController: UpdateTechnicianData): Promise<TechnicianWithRelations | null> {
    try {
      const { user: userDataToUpdate, ...technicianProfilePayload } = dataFromController;

      console.log(">>> [SERVICE UPDATE] Datos de perfil de técnico recibidos:", JSON.stringify(technicianProfilePayload, null, 2));
      if (userDataToUpdate) {
        console.log(">>> [SERVICE UPDATE] Datos de usuario recibidos:", JSON.stringify(userDataToUpdate, null, 2));
      }

      const updatedTechnician = await prisma.$transaction(async (tx) => {
        const existingTechnician = await tx.technician.findUnique({
          where: { id: technicianId },
          include: { user: true }
        });

        if (!existingTechnician) {
          throw new Error('Técnico no encontrado para actualizar.');
        }

        // 1. Actualizar el Usuario si se proporcionaron datos de usuario
        if (userDataToUpdate && Object.keys(userDataToUpdate).length > 0) {
          const userUpdateData: any = {};
          if (userDataToUpdate.username) userUpdateData.username = userDataToUpdate.username;
          if (userDataToUpdate.email) userUpdateData.email = userDataToUpdate.email;
          if (userDataToUpdate.password) {
            if (userDataToUpdate.password.length < 6) {
              throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
            }
            userUpdateData.passwordHash = await hashPassword(userDataToUpdate.password);
          }
          if (userDataToUpdate.isActive !== undefined) userUpdateData.isActive = userDataToUpdate.isActive;

          if (Object.keys(userUpdateData).length > 0) {
            console.log(">>> [SERVICE - TX UPDATE] Actualizando usuario con:", JSON.stringify(userUpdateData, null, 2));
            await tx.user.update({
              where: { id: existingTechnician.userId },
              data: userUpdateData,
            });
            console.log("<<< [SERVICE - TX UPDATE] Usuario actualizado.");
          }
        }

        // 2. Preparar y Actualizar el Perfil del Técnico
        const technicianDataForDbUpdate: any = {};

        // Validaciones antes de actualizar
        if (technicianProfilePayload.specialty !== undefined) {
          if (!technicianProfilePayload.specialty.trim()) {
            throw new Error('La especialidad no puede estar vacía.');
          }
          technicianDataForDbUpdate.specialty = technicianProfilePayload.specialty.trim();
        }
        if (technicianProfilePayload.experienceYears !== undefined) {
          if (technicianProfilePayload.experienceYears < 0 || technicianProfilePayload.experienceYears > 50) {
            throw new Error('Los años de experiencia deben estar entre 0 y 50.');
          }
          technicianDataForDbUpdate.experienceYears = technicianProfilePayload.experienceYears;
        }
        if (technicianProfilePayload.rating !== undefined) {
          if (technicianProfilePayload.rating < 0 || technicianProfilePayload.rating > 5) {
            throw new Error('La calificación debe estar entre 0 y 5.');
          }
          technicianDataForDbUpdate.rating = technicianProfilePayload.rating;
        }

        // Asignar campos directos del perfil
        if (technicianProfilePayload.phone !== undefined) technicianDataForDbUpdate.phone = technicianProfilePayload.phone;
        if (technicianProfilePayload.isAvailable !== undefined) technicianDataForDbUpdate.isAvailable = technicianProfilePayload.isAvailable;
        if (technicianProfilePayload.servicesCompleted !== undefined) technicianDataForDbUpdate.servicesCompleted = technicianProfilePayload.servicesCompleted;
        if (technicianProfilePayload.averageTime !== undefined) technicianDataForDbUpdate.averageTime = technicianProfilePayload.averageTime;

        console.log(">>> [SERVICE - TX UPDATE] Actualizando perfil de técnico con:", JSON.stringify(technicianDataForDbUpdate, null, 2));
        const technician = await tx.technician.update({
          where: { id: technicianId },
          data: technicianDataForDbUpdate,
          include: {
            user: {
              select: { id: true, username: true, email: true, isActive: true, role: true }
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
            _count: { select: { services: true } }
          }
        });
        console.log("<<< [SERVICE - TX UPDATE] Perfil de técnico actualizado.");
        return technician;
      });

      return updatedTechnician as TechnicianWithRelations;
    } catch (error: any) {
      console.error('### ERROR CAPTURADO en updateTechnician (technicianService.ts):', error);
      if (error.code === 'P2002' && error.meta?.target) {
        const field = (error.meta.target as string[]).join(', ');
        throw new Error(`Error de unicidad al actualizar: el campo '${field}' ya existe.`);
      }
      // Para otros errores de Prisma
      const prismaError = error.message?.match(/Unknown argument `(\w+)`/);
      if (prismaError && prismaError[1]) {
        throw new Error(`Error de Prisma en Update: El campo '${prismaError[1]}' es desconocido en el modelo Technician.`);
      }
      throw new Error(error.message || 'Error al actualizar el técnico.');
    }
  }

  /**
   * PERMANENTLY delete a technician AND its associated user (if the user has TECHNICIAN role).
   * ¡CUIDADO! Esta acción es irreversible.
   */
  static async deleteTechnician(id: string): Promise<boolean> {
    try {
      const technicianToDelete = await prisma.technician.findUnique({
        where: { id },
        select: { 
          userId: true,
          servicesCompleted: true,
          services: {
            where: {
              status: {
                in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
              }
            },
            select: { id: true }
          }
        }
      });

      if (!technicianToDelete) {
        console.log(`[SERVICE_DELETE] Técnico con ID ${id} no encontrado.`);
        return false;
      }

      // Verificar que no tenga servicios activos
      if (technicianToDelete.services.length > 0) {
        throw new Error('No se puede eliminar el técnico porque tiene servicios activos o pendientes. Primero debe completar o reasignar esos servicios.');
      }

      console.log(`[SERVICE_DELETE] Iniciando eliminación para técnico ID: ${id}, usuario asociado ID: ${technicianToDelete.userId}`);

      await prisma.$transaction(async (tx) => {
        // 1. Eliminar el perfil del técnico
        console.log(`[SERVICE_DELETE - TX] Intentando eliminar perfil del técnico ID: ${id}`);
        await tx.technician.delete({
          where: { id },
        });
        console.log(`[SERVICE_DELETE - TX] Perfil del técnico ID: ${id} eliminado.`);

        // 2. Eliminar el registro de Usuario asociado al técnico
        const userAssociated = await tx.user.findUnique({
          where: { id: technicianToDelete.userId }
        });

        if (userAssociated) {
          // Condición de seguridad: Solo borrar el usuario si es un 'TECHNICIAN'
          if (userAssociated.role === 'TECHNICIAN') {
            console.log(`[SERVICE_DELETE - TX] Intentando eliminar usuario asociado ID: ${technicianToDelete.userId}, Username: ${userAssociated.username}`);
            await tx.user.delete({
              where: { id: technicianToDelete.userId },
            });
            console.log(`[SERVICE_DELETE - TX] Usuario asociado ID: ${technicianToDelete.userId} eliminado.`);
          } else {
            console.warn(`[SERVICE_DELETE - TX] El usuario ${userAssociated.username} (ID: ${technicianToDelete.userId}) asociado al técnico ${id} no es ROL TECHNICIAN (su rol es ${userAssociated.role}). No se eliminará el usuario.`);
          }
        } else {
          console.warn(`[SERVICE_DELETE - TX] No se encontró un usuario asociado con ID: ${technicianToDelete.userId} para el técnico ${id}. Solo se eliminó el perfil del técnico.`);
        }
      });

      console.log(`[SERVICE_DELETE] Eliminación completa y exitosa para técnico ID: ${id}`);
      return true;
    } catch (error: any) {
      console.error('### ERROR CAPTURADO en deleteTechnician (technicianService.ts):', error);
      if (error.code === 'P2003' || (error.message && error.message.toLowerCase().includes('foreign key constraint'))) {
        throw new Error('No se puede eliminar el técnico porque tiene registros asociados. Primero debe eliminar o reasignar esos registros.');
      }
      throw new Error('Error al eliminar el técnico: ' + error.message);
    }
  }

  /**
   * Get technician statistics
   */
  static async getTechnicianStats(technicianId: string) {
    try {
      const [technicianData, services] = await Promise.all([
        prisma.technician.findUnique({
          where: { id: technicianId },
          select: {
            servicesCompleted: true,
            rating: true,
            averageTime: true,
            createdAt: true
          }
        }),
        prisma.service.groupBy({
          by: ['status'],
          where: { technicianId },
          _count: {
            status: true
          }
        })
      ]);

      if (!technicianData) {
        throw new Error('Técnico no encontrado para estadísticas.');
      }

      const serviceStats = services.reduce((acc, service) => {
        acc[service.status.toLowerCase()] = service._count.status;
        return acc;
      }, {} as Record<string, number>);

      return {
        servicesCompleted: technicianData.servicesCompleted,
        rating: technicianData.rating,
        averageTime: technicianData.averageTime,
        memberSince: technicianData.createdAt,
        servicesByStatus: serviceStats
      };
    } catch (error) {
      console.error('Error fetching technician stats:', error);
      throw error;
    }
  }

  /**
   * Update service count for technician
   */
  static async updateServiceCount(technicianId: string): Promise<void> {
    try {
      const serviceCount = await prisma.service.count({
        where: { 
          technicianId,
          status: 'COMPLETED'
        }
      });

      await prisma.technician.update({
        where: { id: technicianId },
        data: { servicesCompleted: serviceCount }
      });
    } catch (error) {
      console.error('Error updating service count:', error);
      throw error;
    }
  }

  /**
   * Update technician rating
   */
  static async updateTechnicianRating(technicianId: string, newRating: number): Promise<void> {
    try {
      if (newRating < 0 || newRating > 5) {
        throw new Error('La calificación debe estar entre 0 y 5.');
      }

      await prisma.technician.update({
        where: { id: technicianId },
        data: { rating: newRating }
      });
    } catch (error) {
      console.error('Error updating technician rating:', error);
      throw error;
    }
  }

  /**
   * Get available technicians for a specific date and time
   */
  static async getAvailableTechnicians(date: Date, specialty?: string) {
    try {
      const where: any = {
        isAvailable: true,
        user: {
          isActive: true
        }
      };

      if (specialty) {
        where.specialty = {
          contains: specialty,
          mode: 'insensitive'
        };
      }

      // Buscar técnicos que no tengan servicios programados en esa fecha
      const technicians = await prisma.technician.findMany({
        where: {
          ...where,
          services: {
            none: {
              scheduledDate: {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
              },
              status: {
                in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
              }
            }
          }
        },
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
          _count: {
            select: {
              services: true
            }
          }
        },
        orderBy: [
          { rating: 'desc' },
          { servicesCompleted: 'desc' }
        ]
      });

      return technicians as TechnicianWithRelations[];
    } catch (error) {
      console.error('Error fetching available technicians:', error);
      throw error;
    }
  }

  /**
   * Get technicians with public information only (for clients)
   */
  static async getTechniciansPublicInfo(filters: any = {}, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {
        user: {
          isActive: true
        }
      };

      // Apply filters
      if (filters.specialty) {
        where.specialty = {
          contains: filters.specialty,
          mode: 'insensitive'
        };
      }

      if (filters.isAvailable !== undefined) {
        where.isAvailable = filters.isAvailable;
      }

      if (filters.experienceYears) {
        where.experienceYears = {
          gte: filters.experienceYears
        };
      }

      if (filters.search) {
        where.OR = [
          {
            firstName: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            name: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            specialty: {
              contains: filters.search,
              mode: 'insensitive'
            }
          }
        ];
      }

      const [technicians, total] = await Promise.all([
        prisma.technician.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            specialty: true,
            experienceYears: true,
            rating: true,
            isAvailable: true,
            servicesCompleted: true
          },
          orderBy: [
            { isAvailable: 'desc' },
            { rating: 'desc' },
            { servicesCompleted: 'desc' }
          ]
        }),
        prisma.technician.count({ where })
      ]);

      return {
        technicians,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTechnicians: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('Error in getTechniciansPublicInfo:', error);
      throw error;
    }
  }
}