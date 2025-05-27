"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class QuoteService {
    static async createQuote(data) {
        try {
            const client = await prisma.client.findUnique({
                where: { id: data.clientId }
            });
            if (!client) {
                throw new Error('Cliente no encontrado');
            }
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
        }
        catch (error) {
            console.error('Error en QuoteService.createQuote:', error);
            throw error;
        }
    }
    static async getQuotes(filters = {}, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const where = {};
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
        }
        catch (error) {
            console.error('Error en QuoteService.getQuotes:', error);
            throw error;
        }
    }
    static async getQuoteById(id) {
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
        }
        catch (error) {
            console.error('Error en QuoteService.getQuoteById:', error);
            throw error;
        }
    }
    static async updateQuote(id, data) {
        try {
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
        }
        catch (error) {
            console.error('Error en QuoteService.updateQuote:', error);
            throw error;
        }
    }
    static async deleteQuote(id) {
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
        }
        catch (error) {
            console.error('Error en QuoteService.deleteQuote:', error);
            throw error;
        }
    }
    static async approveQuote(id) {
        try {
            const quote = await this.updateQuote(id, {
                status: client_1.QuoteStatus.APPROVED,
                approvedAt: new Date()
            });
            return quote;
        }
        catch (error) {
            console.error('Error en QuoteService.approveQuote:', error);
            throw error;
        }
    }
    static async rejectQuote(id) {
        try {
            const quote = await this.updateQuote(id, {
                status: client_1.QuoteStatus.REJECTED,
                rejectedAt: new Date()
            });
            return quote;
        }
        catch (error) {
            console.error('Error en QuoteService.rejectQuote:', error);
            throw error;
        }
    }
    static async getExpiredQuotes(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const now = new Date();
            const where = {
                validUntil: {
                    lt: now
                },
                status: client_1.QuoteStatus.PENDING
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
            if (quotes.length > 0) {
                await prisma.quote.updateMany({
                    where: {
                        id: {
                            in: quotes.map(q => q.id)
                        }
                    },
                    data: {
                        status: client_1.QuoteStatus.EXPIRED
                    }
                });
                quotes.forEach(quote => {
                    quote.status = client_1.QuoteStatus.EXPIRED;
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
        }
        catch (error) {
            console.error('Error en QuoteService.getExpiredQuotes:', error);
            throw error;
        }
    }
    static async getClientByUserId(userId) {
        try {
            const client = await prisma.client.findUnique({
                where: { userId }
            });
            return client;
        }
        catch (error) {
            console.error('Error en QuoteService.getClientByUserId:', error);
            throw error;
        }
    }
}
exports.QuoteService = QuoteService;
//# sourceMappingURL=quoteService.js.map