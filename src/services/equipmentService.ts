import { PrismaClient, EquipmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Interface para crear equipo
export interface CreateEquipmentData {
  clientId: string;
  name: string;
  model?: string;
  brand?: string;
  serialNumber?: string;
  type: string;
  location?: string;
  installDate?: Date;
  warrantyExpiry?: Date;
  notes?: string;
}

// Interface para actualizar equipo
export interface UpdateEquipmentData {
  name?: string;
  model?: string;
  brand?: string;
  serialNumber?: string;
  type?: string;
  location?: string;
  installDate?: Date;
  warrantyExpiry?: Date;
  status?: EquipmentStatus;
  notes?: string;
}

// Interface para filtros de búsqueda
export interface EquipmentFilters {
  clientId?: string;
  status?: EquipmentStatus;
  type?: string;
  brand?: string;
}

export class EquipmentService {
  /**
   * Crear nuevo equipo
   */
  static async createEquipment(data: CreateEquipmentData) {
    try {
      // Verificar que el cliente existe
      const client = await prisma.client.findUnique({
        where: { id: data.clientId }
      });

      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      const equipment = await prisma.equipment.create({
        data: {
          clientId: data.clientId,
          name: data.name,
          model: data.model ?? null,
          brand: data.brand ?? null,
          serialNumber: data.serialNumber ?? null,
          type: data.type,
          location: data.location ?? null,
          installDate: data.installDate ?? null,
          warrantyExpiry: data.warrantyExpiry ?? null,
          notes: data.notes ?? null
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
          }
        }
      });

      return equipment;
    } catch (error) {
      console.error('Error en EquipmentService.createEquipment:', error);
      throw error;
    }
  }

  /**
   * Obtener equipos con filtros opcionales
   */
  static async getEquipment(filters: EquipmentFilters = {}, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      // Construir where clause basado en filtros
      const where: any = {};

      if (filters.clientId) {
        where.clientId = filters.clientId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.type) {
        where.type = {
          contains: filters.type,
          mode: 'insensitive'
        };
      }

      if (filters.brand) {
        where.brand = {
          contains: filters.brand,
          mode: 'insensitive'
        };
      }

      const [equipment, total] = await Promise.all([
        prisma.equipment.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { status: 'asc' },
            { installDate: 'desc' },
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
            }
          }
        }),
        prisma.equipment.count({ where })
      ]);

      return {
        equipment,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error en EquipmentService.getEquipment:', error);
      throw error;
    }
  }

  /**
   * Obtener equipo por ID
   */
  static async getEquipmentById(id: string) {
    try {
      const equipment = await prisma.equipment.findUnique({
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
          }
        }
      });

      return equipment;
    } catch (error) {
      console.error('Error en EquipmentService.getEquipmentById:', error);
      throw error;
    }
  }

  /**
   * Actualizar equipo
   */
  static async updateEquipment(id: string, data: UpdateEquipmentData) {
    try {
      // Verificar que el equipo existe
      const existingEquipment = await prisma.equipment.findUnique({
        where: { id }
      });

      if (!existingEquipment) {
        return null;
      }

      const equipment = await prisma.equipment.update({
        where: { id },
        data,
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

      return equipment;
    } catch (error) {
      console.error('Error en EquipmentService.updateEquipment:', error);
      throw error;
    }
  }

  /**
   * Eliminar equipo
   */
  static async deleteEquipment(id: string) {
    try {
      const equipment = await prisma.equipment.findUnique({
        where: { id }
      });

      if (!equipment) {
        return false;
      }

      await prisma.equipment.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Error en EquipmentService.deleteEquipment:', error);
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
      console.error('Error en EquipmentService.getClientByUserId:', error);
      throw error;
    }
  }
}