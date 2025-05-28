"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const client_1 = require("@prisma/client");
const auth_1 = require("../utils/auth");
const prisma = new client_1.PrismaClient();
class ClientService {
    static async adminCreatesClientWithUser(payload) {
        try {
            if (!payload.newUser.password) {
                throw new Error('La contraseña es requerida para el nuevo usuario del cliente.');
            }
            const hashedPassword = await (0, auth_1.hashPassword)(payload.newUser.password);
            console.log(">>> [SERVICE] Creando nuevo usuario para cliente con datos:", payload.newUser.username, payload.newUser.email);
            const newClientUser = await prisma.user.create({
                data: {
                    username: payload.newUser.username,
                    email: payload.newUser.email,
                    passwordHash: hashedPassword,
                    role: client_1.UserRole.CLIENT,
                    isActive: true,
                }
            });
            console.log("<<< [SERVICE] Usuario para cliente CREADO:", JSON.stringify(newClientUser, null, 2));
            const clientDataForDb = {
                userId: newClientUser.id,
                clientType: payload.clientProfile.clientType,
                phone: payload.clientProfile.phone,
                email: payload.clientProfile.email || payload.newUser.email,
                address: payload.clientProfile.address,
                city: payload.clientProfile.city,
                district: payload.clientProfile.district,
                status: client_1.ClientStatus.ACTIVE,
                businessRegistration: null,
                emergencyContact: payload.clientProfile.emergencyContact ?? null,
                postalCode: payload.clientProfile.postalCode ?? null,
                preferredSchedule: payload.clientProfile.preferredSchedule ?? null,
                notes: payload.clientProfile.notes ?? null,
                isVip: payload.clientProfile.isVip ?? false,
                discount: payload.clientProfile.discount ?? 0.0,
                sector: null,
            };
            if (payload.clientProfile.clientType === client_1.ClientType.COMPANY) {
                clientDataForDb.companyName = payload.clientProfile.companyName || payload.clientProfile.name;
                clientDataForDb.businessRegistration = payload.clientProfile.ruc;
                if (payload.clientProfile.sector !== undefined) {
                    clientDataForDb.sector = payload.clientProfile.sector;
                }
                clientDataForDb.contactPerson = payload.clientProfile.contactPerson ?? null;
            }
            else {
                let fullName = '';
                if (payload.clientProfile.firstName || payload.clientProfile.lastName) {
                    fullName = `${payload.clientProfile.firstName || ''} ${payload.clientProfile.lastName || ''}`.trim();
                }
                else if (payload.clientProfile.name) {
                    fullName = payload.clientProfile.name;
                }
                clientDataForDb.contactPerson = fullName || payload.clientProfile.contactPerson || null;
                clientDataForDb.businessRegistration = payload.clientProfile.dni;
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
            return client;
        }
        catch (error) {
            console.error('### ERROR CAPTURADO en adminCreatesClientWithUser (clientService.ts):', error);
            if (error.code === 'P2002' && error.meta?.target) {
                const field = error.meta.target.join(', ');
                if (field.includes('username'))
                    throw new Error(`El nombre de usuario '${payload.newUser.username}' ya existe.`);
                if (field.includes('email'))
                    throw new Error(`El email '${payload.newUser.email}' ya está registrado.`);
                throw new Error(`El campo '${field}' ya existe y debe ser único.`);
            }
            const prismaError = error.message?.match(/Unknown argument `(\w+)`/);
            if (prismaError && prismaError[1]) {
                throw new Error(`Error de Prisma: El campo '${prismaError[1]}' es desconocido en el modelo Client.`);
            }
            throw new Error('Error al crear el cliente y su usuario: ' + (error.message || error));
        }
    }
    static async createClient(data) {
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
            if (user.role !== client_1.UserRole.CLIENT) {
                throw new Error('El usuario que se asocia al perfil debe tener rol de CLIENTE.');
            }
            const prismaData = {
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
                status: client_1.ClientStatus.ACTIVE,
            };
            if (data.clientType === client_1.ClientType.COMPANY) {
                prismaData.name = data.companyName || data.name;
                prismaData.ruc = data.ruc;
                prismaData.sector = data.sector;
            }
            else {
                prismaData.name = data.name || data.contactPerson;
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
        }
        catch (error) {
            console.error('Error en el método original createClient:', error);
            throw new Error('Fallo al crear el perfil de cliente: ' + error.message);
        }
    }
    static async getClients(filters = {}, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const where = {};
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
                clients: clientsFromDb,
                totalClients,
                totalPages,
                currentPage: page,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
        }
        catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    }
    static async getClientById(id) {
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
            return client;
        }
        catch (error) {
            console.error('Error fetching client by ID:', error);
            throw error;
        }
    }
    static async getClientByUserId(userId) {
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
            return client;
        }
        catch (error) {
            console.error('Error fetching client by user ID:', error);
            throw error;
        }
    }
    static async updateClient(clientId, dataFromController) {
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
                if (userDataToUpdate && Object.keys(userDataToUpdate).length > 0) {
                    const userUpdateData = {};
                    if (userDataToUpdate.username)
                        userUpdateData.username = userDataToUpdate.username;
                    if (userDataToUpdate.email)
                        userUpdateData.email = userDataToUpdate.email;
                    if (userDataToUpdate.password) {
                        if (userDataToUpdate.password.length < 6) {
                            throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
                        }
                        userUpdateData.passwordHash = await (0, auth_1.hashPassword)(userDataToUpdate.password);
                    }
                    if (userDataToUpdate.isActive !== undefined)
                        userUpdateData.isActive = userDataToUpdate.isActive;
                    if (Object.keys(userUpdateData).length > 0) {
                        console.log(">>> [SERVICE - TX UPDATE] Actualizando usuario con:", JSON.stringify(userUpdateData, null, 2));
                        await tx.user.update({
                            where: { id: existingClient.userId },
                            data: userUpdateData,
                        });
                        console.log("<<< [SERVICE - TX UPDATE] Usuario actualizado.");
                    }
                }
                const clientDataForDbUpdate = {};
                if (clientProfilePayload.phone !== undefined)
                    clientDataForDbUpdate.phone = clientProfilePayload.phone;
                if (clientProfilePayload.email !== undefined)
                    clientDataForDbUpdate.email = clientProfilePayload.email;
                if (clientProfilePayload.address !== undefined)
                    clientDataForDbUpdate.address = clientProfilePayload.address;
                if (clientProfilePayload.city !== undefined)
                    clientDataForDbUpdate.city = clientProfilePayload.city;
                if (clientProfilePayload.district !== undefined)
                    clientDataForDbUpdate.district = clientProfilePayload.district;
                if (clientProfilePayload.postalCode !== undefined)
                    clientDataForDbUpdate.postalCode = clientProfilePayload.postalCode;
                if (clientProfilePayload.clientType !== undefined)
                    clientDataForDbUpdate.clientType = clientProfilePayload.clientType;
                if (clientProfilePayload.status !== undefined)
                    clientDataForDbUpdate.status = clientProfilePayload.status;
                if (clientProfilePayload.preferredSchedule !== undefined)
                    clientDataForDbUpdate.preferredSchedule = clientProfilePayload.preferredSchedule;
                if (clientProfilePayload.nextServiceDate !== undefined)
                    clientDataForDbUpdate.nextServiceDate = clientProfilePayload.nextServiceDate;
                if (clientProfilePayload.notes !== undefined)
                    clientDataForDbUpdate.notes = clientProfilePayload.notes;
                if (clientProfilePayload.isVip !== undefined)
                    clientDataForDbUpdate.isVip = clientProfilePayload.isVip;
                if (clientProfilePayload.discount !== undefined)
                    clientDataForDbUpdate.discount = clientProfilePayload.discount;
                if (clientProfilePayload.contactPerson !== undefined)
                    clientDataForDbUpdate.contactPerson = clientProfilePayload.contactPerson;
                const typeToUse = clientProfilePayload.clientType || existingClient.clientType;
                if (typeToUse === client_1.ClientType.COMPANY) {
                    if (clientProfilePayload.companyName !== undefined || clientProfilePayload.name !== undefined) {
                        clientDataForDbUpdate.companyName = clientProfilePayload.companyName || clientProfilePayload.name;
                    }
                    if (clientProfilePayload.ruc !== undefined) {
                        clientDataForDbUpdate.businessRegistration = clientProfilePayload.ruc;
                    }
                    if (clientProfilePayload.sector !== undefined && existingClient.sector !== undefined) {
                        clientDataForDbUpdate.sector = clientProfilePayload.sector;
                    }
                }
                else if (typeToUse === client_1.ClientType.PERSONAL) {
                    let fullNameForContact = clientDataForDbUpdate.contactPerson;
                    if (clientProfilePayload.firstName || clientProfilePayload.lastName) {
                        fullNameForContact = `${clientProfilePayload.firstName || ''} ${clientProfilePayload.lastName || ''}`.trim();
                    }
                    else if (clientProfilePayload.name) {
                        fullNameForContact = clientProfilePayload.name;
                    }
                    if (fullNameForContact)
                        clientDataForDbUpdate.contactPerson = fullNameForContact;
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
            return updatedClient;
        }
        catch (error) {
            console.error('### ERROR CAPTURADO en updateClient (clientService.ts):', error);
            if (error.code === 'P2002' && error.meta?.target) {
                const field = error.meta.target.join(', ');
                throw new Error(`Error de unicidad al actualizar: el campo '${field}' ya existe.`);
            }
            const prismaError = error.message?.match(/Unknown argument `(\w+)`/);
            if (prismaError && prismaError[1]) {
                throw new Error(`Error de Prisma en Update: El campo '${prismaError[1]}' es desconocido en el modelo Client.`);
            }
            throw new Error(error.message || 'Error al actualizar el cliente.');
        }
    }
    static async deleteClient(id) {
        try {
            const clientToDelete = await prisma.client.findUnique({
                where: { id },
                select: { userId: true }
            });
            if (!clientToDelete) {
                console.log(`[SERVICE_DELETE] Cliente con ID ${id} no encontrado.`);
                return false;
            }
            console.log(`[SERVICE_DELETE] Iniciando eliminación para cliente ID: ${id}, usuario asociado ID: ${clientToDelete.userId}`);
            await prisma.$transaction(async (tx) => {
                console.log(`[SERVICE_DELETE - TX] Intentando eliminar perfil del cliente ID: ${id}`);
                await tx.client.delete({
                    where: { id },
                });
                console.log(`[SERVICE_DELETE - TX] Perfil del cliente ID: ${id} eliminado.`);
                const userAssociated = await tx.user.findUnique({
                    where: { id: clientToDelete.userId }
                });
                if (userAssociated) {
                    if (userAssociated.role === 'CLIENT') {
                        console.log(`[SERVICE_DELETE - TX] Intentando eliminar usuario asociado ID: ${clientToDelete.userId}, Username: ${userAssociated.username}`);
                        await tx.user.delete({
                            where: { id: clientToDelete.userId },
                        });
                        console.log(`[SERVICE_DELETE - TX] Usuario asociado ID: ${clientToDelete.userId} eliminado.`);
                    }
                    else {
                        console.warn(`[SERVICE_DELETE - TX] El usuario ${userAssociated.username} (ID: ${clientToDelete.userId}) asociado al cliente ${id} no es ROL CLIENTE (su rol es ${userAssociated.role}). No se eliminará el usuario.`);
                    }
                }
                else {
                    console.warn(`[SERVICE_DELETE - TX] No se encontró un usuario asociado con ID: ${clientToDelete.userId} para el cliente ${id}. Solo se eliminó el perfil del cliente.`);
                }
            });
            console.log(`[SERVICE_DELETE] Eliminación completa y exitosa para cliente ID: ${id}`);
            return true;
        }
        catch (error) {
            console.error('### ERROR CAPTURADO en deleteClient (clientService.ts):', error);
            if (error.code === 'P2003' || (error.message && error.message.toLowerCase().includes('foreign key constraint'))) {
                throw new Error('No se puede eliminar el cliente porque tiene registros asociados (ej. servicios, cotizaciones). Primero debe eliminar o reasignar esos registros.');
            }
            throw new Error('Error al eliminar el cliente: ' + error.message);
        }
    }
    static async getClientStats(clientId) {
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
            }, {});
            const quoteStats = quotes.reduce((acc, quote) => {
                acc[quote.status.toLowerCase()] = quote._count.status;
                return acc;
            }, {});
            return {
                totalServices: clientData.totalServices,
                equipmentCount: equipmentCount,
                nextServiceDate: clientData.nextServiceDate,
                memberSince: clientData.createdAt,
                servicesByStatus: serviceStats,
                quotesByStatus: quoteStats
            };
        }
        catch (error) {
            console.error('Error fetching client stats:', error);
            throw error;
        }
    }
    static async updateServiceCount(clientId) {
        try {
            const serviceCount = await prisma.service.count({
                where: { clientId }
            });
            await prisma.client.update({
                where: { id: clientId },
                data: { totalServices: serviceCount }
            });
        }
        catch (error) {
            console.error('Error updating service count:', error);
            throw error;
        }
    }
    static async updateNextServiceDate(clientId) {
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
        }
        catch (error) {
            console.error('Error updating next service date:', error);
            throw error;
        }
    }
    static async getQuoteOptions(clientId) {
        try {
            const activeServices = await prisma.service.findMany({
                where: {
                    clientId,
                    status: {
                        in: ['PENDING', 'IN_PROGRESS']
                    }
                },
                include: {
                    technician: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            specialty: true,
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            });
            const technicianMap = new Map();
            activeServices.forEach(service => {
                if (service.technician && service.technician.user) {
                    const tech = service.technician;
                    const user = tech.user;
                    technicianMap.set(tech.id, {
                        id: tech.id,
                        name: `${tech.firstName} ${tech.lastName}`,
                        specialty: tech.specialty,
                        email: user.email
                    });
                }
            });
            const assignedTechnicians = Array.from(technicianMap.values());
            const servicesByTechnician = {};
            activeServices.forEach(service => {
                if (service.technicianId) {
                    if (!servicesByTechnician[service.technicianId]) {
                        servicesByTechnician[service.technicianId] = [];
                    }
                    servicesByTechnician[service.technicianId].push({
                        id: service.id,
                        title: service.title,
                        type: service.type,
                        scheduledDate: service.scheduledDate
                    });
                }
            });
            return {
                assignedTechnicians,
                servicesByTechnician
            };
        }
        catch (error) {
            console.error('Error fetching quote options:', error);
            throw error;
        }
    }
}
exports.ClientService = ClientService;
//# sourceMappingURL=clientService.js.map