import { PrismaClient, QuoteStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Interface para crear cotización
export interface CreateQuoteData {
  serviceId?: string;
  clientId: string;
  title: string;
  description?: string;
  amount: number;
  validUntil: Date;
  notes?: string;
}

// Interface para actualizar cotización
export interface UpdateQuoteData {
  title?: string;
  description?: string;
  amount?: number;
  status?: QuoteStatus;
  validUntil?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  notes?: string;
}

// Interface para filtros de búsqueda
export interface QuoteFilters {
  status?: QuoteStatus;
  clientId?: string;
  serviceId?: string;
}

export class QuoteService {
  /**
   * Crear nueva cotización
   */
  static async createQuote(data: CreateQuoteData) {
    try {
      // Verificar que el cliente existe
      const client = await prisma.client.findUnique({
        where: { id: data.clientId }
      });

      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      // Verificar que el servicio existe (si se proporciona)
      if (data.serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: data.serviceId }
        });

        if (!service) {
          throw new Error('Servicio no encontrado');
        }
      }

      const quote = await prisma.quote.create({
        data: {
          serviceId: data.serviceId ?? null,
          clientId: data.clientId,
          title: data.title,
          description: data.description ?? null,
          amount: data.amount,
          validUntil: data.validUntil,
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
          },
          service: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true
            }
          }
        }
      });

      return quote;
    } catch (error) {
      console.error('Error en QuoteService.createQuote:', error);
      throw error;
    }
  }

  /**
   * Obtener cotizaciones con filtros opcionales
   */
  static async getQuotes(filters: QuoteFilters = {}, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      // Construir where clause basado en filtros
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.clientId) {
        where.clientId = filters.clientId;
      }

      if (filters.serviceId) {
        where.serviceId = filters.serviceId;
      }

      const [quotes, total] = await Promise.all([
        prisma.quote.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { status: 'asc' },
            { validUntil: 'asc' },
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
            service: {
              select: {
                id: true,
                title: true,
                description: true,
                status: true
              }
            }
          }
        }),
        prisma.quote.count({ where })
      ]);

      return {
        quotes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error en QuoteService.getQuotes:', error);
      throw error;
    }
  }

  /**
   * Obtener cotización por ID
   */
  static async getQuoteById(id: string) {
    try {
      const quote = await prisma.quote.findUnique({
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
          service: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              scheduledDate: true
            }
          }
        }
      });

      return quote;
    } catch (error) {
      console.error('Error en QuoteService.getQuoteById:', error);
      throw error;
    }
  }

  /**
   * Actualizar cotización
   */
  static async updateQuote(id: string, data: UpdateQuoteData) {
    try {
      // Verificar que la cotización existe
      const existingQuote = await prisma.quote.findUnique({
        where: { id }
      });

      if (!existingQuote) {
        return null;
      }

      const quote = await prisma.quote.update({
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
          },
          service: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true
            }
          }
        }
      });

      return quote;
    } catch (error) {
      console.error('Error en QuoteService.updateQuote:', error);
      throw error;
    }
  }

  /**
   * Eliminar cotización
   */
  static async deleteQuote(id: string) {
    try {
      const quote = await prisma.quote.findUnique({
        where: { id }
      });

      if (!quote) {
        return false;
      }

      await prisma.quote.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Error en QuoteService.deleteQuote:', error);
      throw error;
    }
  }

  /**
   * Aprobar cotización
   */
  static async approveQuote(id: string) {
    try {
      const quote = await this.updateQuote(id, {
        status: QuoteStatus.APPROVED,
        approvedAt: new Date()
      });

      return quote;
    } catch (error) {
      console.error('Error en QuoteService.approveQuote:', error);
      throw error;
    }
  }

  /**
   * Rechazar cotización
   */
  static async rejectQuote(id: string) {
    try {
      const quote = await this.updateQuote(id, {
        status: QuoteStatus.REJECTED,
        rejectedAt: new Date()
      });

      return quote;
    } catch (error) {
      console.error('Error en QuoteService.rejectQuote:', error);
      throw error;
    }
  }

  /**
   * Obtener cotizaciones expiradas
   */
  static async getExpiredQuotes(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      const now = new Date();

      const where = {
        validUntil: {
          lt: now
        },
        status: QuoteStatus.PENDING
      };

      const [quotes, total] = await Promise.all([
        prisma.quote.findMany({
          where,
          skip,
          take: limit,
          orderBy: { validUntil: 'desc' },
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
            service: {
              select: {
                id: true,
                title: true,
                description: true,
                status: true
              }
            }
          }
        }),
        prisma.quote.count({ where })
      ]);

      // Actualizar automáticamente las cotizaciones expiradas
      if (quotes.length > 0) {
        await prisma.quote.updateMany({
          where: {
            id: {
              in: quotes.map(q => q.id)
            }
          },
          data: {
            status: QuoteStatus.EXPIRED
          }
        });

        // Actualizar el status en los resultados
        quotes.forEach(quote => {
          quote.status = QuoteStatus.EXPIRED;
        });
      }

      return {
        quotes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error en QuoteService.getExpiredQuotes:', error);
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
      console.error('Error en QuoteService.getClientByUserId:', error);
      throw error;
    }
  }
}