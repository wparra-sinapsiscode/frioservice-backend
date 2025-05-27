"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class EquipmentService {
    static async createEquipment(data) {
        try {
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
                    status: data.status ?? client_1.EquipmentStatus.ACTIVE,
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
        }
        catch (error) {
            console.error('Error en EquipmentService.createEquipment:', error);
            throw error;
        }
    }
    static async getEquipment(filters = {}, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const where = {};
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
        }
        catch (error) {
            console.error('Error en EquipmentService.getEquipment:', error);
            throw error;
        }
    }
    static async getEquipmentById(id) {
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
        }
        catch (error) {
            console.error('Error en EquipmentService.getEquipmentById:', error);
            throw error;
        }
    }
    static async updateEquipment(id, data) {
        try {
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
        }
        catch (error) {
            console.error('Error en EquipmentService.updateEquipment:', error);
            throw error;
        }
    }
    static async deleteEquipment(id) {
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
        }
        catch (error) {
            console.error('Error en EquipmentService.deleteEquipment:', error);
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
            console.error('Error en EquipmentService.getClientByUserId:', error);
            throw error;
        }
    }
}
exports.EquipmentService = EquipmentService;
//# sourceMappingURL=equipmentService.js.map