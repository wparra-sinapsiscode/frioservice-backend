"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentController = void 0;
const equipmentService_1 = require("../services/equipmentService");
class EquipmentController {
    static async create(req, res) {
        try {
            const { clientId, name, model, brand, serialNumber, type, location, installDate, warrantyExpiry, status, notes } = req.body;
            let finalClientId = clientId;
            if (req.user?.role === 'CLIENT') {
                const userId = req.user?.userId || req.user?.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                const client = await equipmentService_1.EquipmentService.getClientByUserId(userId);
                if (!client) {
                    res.status(404).json({
                        success: false,
                        message: 'Perfil de cliente no encontrado'
                    });
                    return;
                }
                finalClientId = client.id;
                if (clientId && clientId !== client.id) {
                    res.status(403).json({
                        success: false,
                        message: 'No puedes crear equipos para otros clientes'
                    });
                    return;
                }
            }
            const equipmentData = {
                clientId: finalClientId,
                name,
                model,
                brand,
                serialNumber,
                type,
                location,
                status,
                notes
            };
            if (installDate) {
                equipmentData.installDate = new Date(installDate);
            }
            if (warrantyExpiry) {
                equipmentData.warrantyExpiry = new Date(warrantyExpiry);
            }
            const equipment = await equipmentService_1.EquipmentService.createEquipment(equipmentData);
            res.status(201).json({
                success: true,
                message: 'Equipo creado exitosamente',
                data: equipment
            });
        }
        catch (error) {
            console.error('Error creating equipment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getAll(req, res) {
        try {
            const { clientId, status, type, brand, page = '1', limit = '20' } = req.query;
            const filters = {
                ...(clientId && { clientId: clientId }),
                ...(status && { status: status }),
                ...(type && { type: type }),
                ...(brand && { brand: brand })
            };
            if (req.user?.role === 'CLIENT') {
                const userId = req.user?.userId || req.user?.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                const client = await equipmentService_1.EquipmentService.getClientByUserId(userId);
                if (client) {
                    filters.clientId = client.id;
                }
                else {
                    res.status(200).json({
                        success: true,
                        message: 'Equipos obtenidos exitosamente',
                        data: [],
                        pagination: {
                            currentPage: 1,
                            totalPages: 0,
                            totalEquipment: 0,
                            hasNext: false,
                            hasPrev: false
                        }
                    });
                    return;
                }
            }
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const result = await equipmentService_1.EquipmentService.getEquipment(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: 'Equipos obtenidos exitosamente',
                data: result.equipment,
                pagination: {
                    currentPage: pageNumber,
                    totalPages: result.pagination.totalPages,
                    totalEquipment: result.pagination.total,
                    hasNext: pageNumber < result.pagination.totalPages,
                    hasPrev: pageNumber > 1
                }
            });
        }
        catch (error) {
            console.error('Error fetching equipment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const equipment = await equipmentService_1.EquipmentService.getEquipmentById(id);
            if (!equipment) {
                res.status(404).json({
                    success: false,
                    message: 'Equipo no encontrado'
                });
                return;
            }
            if (req.user?.role === 'CLIENT') {
                const userId = req.user?.userId || req.user?.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                const client = await equipmentService_1.EquipmentService.getClientByUserId(userId);
                if (!client || equipment.clientId !== client.id) {
                    res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para ver este equipo'
                    });
                    return;
                }
            }
            res.status(200).json({
                success: true,
                message: 'Equipo obtenido exitosamente',
                data: equipment
            });
        }
        catch (error) {
            console.error('Error fetching equipment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getByClient(req, res) {
        try {
            const { clientId } = req.params;
            const { status, page = '1', limit = '20' } = req.query;
            const filters = {
                clientId,
                ...(status && { status: status })
            };
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const result = await equipmentService_1.EquipmentService.getEquipment(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: 'Equipos del cliente obtenidos exitosamente',
                data: result.equipment,
                pagination: {
                    currentPage: pageNumber,
                    totalPages: result.pagination.totalPages,
                    totalEquipment: result.pagination.total,
                    hasNext: pageNumber < result.pagination.totalPages,
                    hasPrev: pageNumber > 1
                }
            });
        }
        catch (error) {
            console.error('Error fetching client equipment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const existingEquipment = await equipmentService_1.EquipmentService.getEquipmentById(id);
            if (!existingEquipment) {
                res.status(404).json({
                    success: false,
                    message: 'Equipo no encontrado'
                });
                return;
            }
            if (req.user?.role === 'CLIENT') {
                const userId = req.user?.userId || req.user?.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                const client = await equipmentService_1.EquipmentService.getClientByUserId(userId);
                if (!client || existingEquipment.clientId !== client.id) {
                    res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para modificar este equipo'
                    });
                    return;
                }
            }
            if (updateData.installDate) {
                updateData.installDate = new Date(updateData.installDate);
            }
            if (updateData.warrantyExpiry) {
                updateData.warrantyExpiry = new Date(updateData.warrantyExpiry);
            }
            const equipment = await equipmentService_1.EquipmentService.updateEquipment(id, updateData);
            res.status(200).json({
                success: true,
                message: 'Equipo actualizado exitosamente',
                data: equipment
            });
        }
        catch (error) {
            console.error('Error updating equipment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const success = await equipmentService_1.EquipmentService.deleteEquipment(id);
            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Equipo no encontrado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Equipo eliminado exitosamente'
            });
        }
        catch (error) {
            console.error('Error deleting equipment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const existingEquipment = await equipmentService_1.EquipmentService.getEquipmentById(id);
            if (!existingEquipment) {
                res.status(404).json({
                    success: false,
                    message: 'Equipo no encontrado'
                });
                return;
            }
            if (req.user?.role === 'CLIENT') {
                const userId = req.user?.userId || req.user?.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                const client = await equipmentService_1.EquipmentService.getClientByUserId(userId);
                if (!client || existingEquipment.clientId !== client.id) {
                    res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para modificar este equipo'
                    });
                    return;
                }
                const allowedClientStatuses = ['ACTIVE', 'MAINTENANCE', 'BROKEN', 'INACTIVE'];
                if (!allowedClientStatuses.includes(status)) {
                    res.status(403).json({
                        success: false,
                        message: 'Estado no permitido para clientes'
                    });
                    return;
                }
            }
            const equipment = await equipmentService_1.EquipmentService.updateEquipment(id, {
                status: status
            });
            res.status(200).json({
                success: true,
                message: 'Estado del equipo actualizado exitosamente',
                data: equipment
            });
        }
        catch (error) {
            console.error('Error updating equipment status:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.EquipmentController = EquipmentController;
//# sourceMappingURL=equipmentController.js.map