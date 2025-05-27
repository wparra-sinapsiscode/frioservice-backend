"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ServiceService {
    static async createService(data) {
        try {
            const client = await prisma.client.findUnique({
                where: { id: data.clientId }
            });
            if (!client) {
                throw new Error('Cliente no encontrado');
            }
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
                    priority: data.priority || client_1.ServicePriority.MEDIUM,
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
        }
        catch (error) {
            console.error('Error en ServiceService.createService:', error);
            throw error;
        }
    }
    static async getServices(filters = {}, page = 1, limit = 20) {
        try {
            console.log('🔥 ServiceService.getServices - Starting with filters:', filters);
            console.log('🔥 ServiceService.getServices - Page:', page, 'Limit:', limit);
            const skip = (page - 1) * limit;
            const where = {};
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
            }
            else if (filters.startDate) {
                where.scheduledDate = {
                    gte: filters.startDate
                };
            }
            else if (filters.endDate) {
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
        }
        catch (error) {
            console.error('Error en ServiceService.getServices:', error);
            throw error;
        }
    }
    static async getServiceById(id) {
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
        }
        catch (error) {
            console.error('Error en ServiceService.getServiceById:', error);
            throw error;
        }
    }
    static async updateService(id, data) {
        try {
            const existingService = await prisma.service.findUnique({
                where: { id }
            });
            if (!existingService) {
                throw new Error('Servicio no encontrado');
            }
            if (data.technicianId) {
                const technician = await prisma.technician.findUnique({
                    where: { id: data.technicianId }
                });
                if (!technician) {
                    throw new Error('Técnico no encontrado');
                }
            }
            const updateData = { ...data };
            if (data.status === client_1.ServiceStatus.COMPLETED && !updateData.completedAt) {
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
        }
        catch (error) {
            console.error('Error en ServiceService.updateService:', error);
            throw error;
        }
    }
    static async deleteService(id) {
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
        }
        catch (error) {
            console.error('Error en ServiceService.deleteService:', error);
            throw error;
        }
    }
    static async assignTechnician(serviceId, technicianId) {
        try {
            const service = await this.updateService(serviceId, {
                technicianId,
                status: client_1.ServiceStatus.IN_PROGRESS
            });
            return service;
        }
        catch (error) {
            console.error('Error en ServiceService.assignTechnician:', error);
            throw error;
        }
    }
    static async completeService(serviceId, completionData) {
        try {
            const updateData = {
                status: client_1.ServiceStatus.COMPLETED,
                completedAt: new Date()
            };
            if (completionData.workPerformed) {
                updateData.workPerformed = completionData.workPerformed;
            }
            if (typeof completionData.timeSpent === 'number') {
                updateData.actualDuration = completionData.timeSpent;
                updateData.timeSpent = completionData.timeSpent;
            }
            if (completionData.materialsUsed) {
                updateData.materialsUsed = Array.isArray(completionData.materialsUsed)
                    ? completionData.materialsUsed
                    : JSON.stringify(completionData.materialsUsed);
            }
            if (completionData.technicianNotes) {
                updateData.technicianNotes = completionData.technicianNotes;
            }
            if (completionData.clientSignature) {
                updateData.clientSignature = completionData.clientSignature;
            }
            if (completionData.images && Array.isArray(completionData.images)) {
                updateData.images = completionData.images;
            }
            console.log('🔥 ServiceService.completeService - Datos a actualizar:', updateData);
            const service = await this.updateService(serviceId, updateData);
            console.log('🔥 ServiceService.completeService - Servicio actualizado:', service);
            return service;
        }
        catch (error) {
            console.error('Error en ServiceService.completeService:', error);
            throw error;
        }
    }
    static async getServicesByClient(clientId) {
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
        }
        catch (error) {
            console.error('Error en ServiceService.getServicesByClient:', error);
            throw error;
        }
    }
    static async getServicesByTechnician(technicianId) {
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
        }
        catch (error) {
            console.error('Error en ServiceService.getServicesByTechnician:', error);
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
            console.error('Error en ServiceService.getClientByUserId:', error);
            throw error;
        }
    }
    static async getTechnicianEvaluations(userIdOrTechnicianId) {
        try {
            let technician = await prisma.technician.findUnique({
                where: { id: userIdOrTechnicianId }
            });
            if (!technician) {
                technician = await prisma.technician.findUnique({
                    where: { userId: userIdOrTechnicianId }
                });
            }
            if (!technician) {
                throw new Error('Técnico no encontrado');
            }
            const evaluations = await prisma.service.findMany({
                where: {
                    technicianId: technician.id,
                    status: client_1.ServiceStatus.COMPLETED,
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
            const formattedEvaluations = evaluations.map(service => ({
                id: service.id,
                clientName: service.client.companyName || service.client.contactPerson || 'Cliente',
                date: service.ratedAt ? service.ratedAt.toLocaleDateString('es-ES') : service.completedAt?.toLocaleDateString('es-ES') || '',
                rating: service.clientRating || 0,
                comment: service.clientComment || '',
                serviceType: service.type,
                equipment: 'Equipo de refrigeración',
                serviceDate: service.completedAt ? service.completedAt.toLocaleDateString('es-ES') : '',
                title: service.title
            }));
            return formattedEvaluations;
        }
        catch (error) {
            console.error('Error en ServiceService.getTechnicianEvaluations:', error);
            throw error;
        }
    }
    static async rateService(serviceId, ratingData) {
        try {
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
            if (service.status !== client_1.ServiceStatus.COMPLETED) {
                throw new Error('Solo se pueden evaluar servicios completados');
            }
            if (service.clientRating !== null) {
                throw new Error('Este servicio ya ha sido evaluado');
            }
            if (ratingData.rating < 1 || ratingData.rating > 5) {
                throw new Error('La calificación debe estar entre 1 y 5');
            }
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
            if (service.technicianId) {
                await this.updateTechnicianAverageRating(service.technicianId);
            }
            return updatedService;
        }
        catch (error) {
            console.error('Error en ServiceService.rateService:', error);
            throw error;
        }
    }
    static async updateTechnicianAverageRating(technicianId) {
        try {
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
            const totalRating = ratedServices.reduce((sum, service) => sum + (service.clientRating || 0), 0);
            const averageRating = totalRating / ratedServices.length;
            await prisma.technician.update({
                where: { id: technicianId },
                data: {
                    rating: Math.round(averageRating * 10) / 10
                }
            });
            console.log(`Updated technician ${technicianId} rating to ${averageRating.toFixed(1)}`);
        }
        catch (error) {
            console.error('Error updating technician average rating:', error);
        }
    }
}
exports.ServiceService = ServiceService;
//# sourceMappingURL=serviceService.js.map