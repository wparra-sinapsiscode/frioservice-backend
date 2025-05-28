"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const clientService_1 = require("../services/clientService");
const client_1 = require("@prisma/client");
class ClientController {
    static async create(req, res) {
        try {
            const { username, password, email, clientType, companyName, firstName, lastName, name, ruc, dni, phone, address, city, district, sector, contactPerson, businessRegistration, emergencyContact, postalCode, preferredSchedule, notes, isVip, discount } = req.body;
            const payload = {
                newUser: {
                    username: username,
                    email: email,
                    password: password,
                },
                clientProfile: {
                    clientType: clientType,
                    companyName: companyName,
                    firstName: firstName,
                    lastName: lastName,
                    name: name,
                    ruc: ruc,
                    dni: dni,
                    phone: phone,
                    address: address,
                    city: city,
                    district: district,
                    sector: sector,
                    email: email,
                    contactPerson: contactPerson,
                    businessRegistration: businessRegistration,
                    emergencyContact: emergencyContact,
                    postalCode: postalCode,
                    preferredSchedule: preferredSchedule,
                    notes: notes,
                    isVip: isVip,
                    discount: discount,
                }
            };
            if (!payload.newUser.username || !payload.newUser.email || !payload.newUser.password) {
                res.status(400).json({ success: false, message: "El nombre de usuario, email y contraseña son requeridos para la nueva cuenta del cliente." });
                return;
            }
            if (!payload.clientProfile.clientType) {
                res.status(400).json({ success: false, message: "El tipo de cliente (clientType) es requerido." });
                return;
            }
            if (payload.clientProfile.clientType === client_1.ClientType.COMPANY && !(payload.clientProfile.companyName || payload.clientProfile.name)) {
                res.status(400).json({ success: false, message: "El nombre de la empresa (companyName o name) es requerido para clientes de tipo EMPRESA." });
                return;
            }
            if (payload.clientProfile.clientType === client_1.ClientType.PERSONAL && !(payload.clientProfile.firstName || payload.clientProfile.name)) {
                res.status(400).json({ success: false, message: "El nombre (firstName o name) es requerido para clientes de tipo PERSONAL." });
                return;
            }
            const client = await clientService_1.ClientService.adminCreatesClientWithUser(payload);
            res.status(201).json({
                success: true,
                message: "Cliente y cuenta de usuario creados exitosamente",
                data: client,
            });
        }
        catch (error) {
            console.error("Error en ClientController.create:", error);
            if (error.message && (error.message.includes('ya existe') ||
                error.message.includes('registrado') ||
                error.message.includes('requerida') ||
                error.message.includes('Error al crear el cliente y su usuario') ||
                error.message.toLowerCase().includes('inválido'))) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al procesar la creación del cliente.",
                errorDetail: error.message || "Error desconocido",
            });
        }
    }
    static async getAll(req, res) {
        try {
            const { status, clientType, city, isVip, search, page = "1", limit = "20", } = req.query;
            const filters = {};
            if (status)
                filters.status = status;
            if (clientType)
                filters.clientType = clientType;
            if (city)
                filters.city = city;
            if (isVip !== undefined)
                filters.isVip = isVip === "true";
            if (search)
                filters.search = search;
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const result = await clientService_1.ClientService.getClients(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: "Clientes obtenidos exitosamente",
                data: result.clients,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalClients: result.totalClients,
                    hasNext: result.hasNext,
                    hasPrev: result.hasPrev,
                },
            });
        }
        catch (error) {
            console.error("Error fetching clients:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al obtener clientes",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const client = await clientService_1.ClientService.getClientById(id);
            if (!client) {
                res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Cliente obtenido exitosamente",
                data: client,
            });
        }
        catch (error) {
            console.error("Error fetching client by ID:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al obtener cliente por ID",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async getByUserId(req, res) {
        try {
            const { userId } = req.params;
            const client = await clientService_1.ClientService.getClientByUserId(userId);
            if (!client) {
                res.status(404).json({
                    success: false,
                    message: "Perfil de cliente no encontrado para el ID de usuario proporcionado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Perfil de cliente obtenido exitosamente",
                data: client,
            });
        }
        catch (error) {
            console.error("Error fetching client profile by User ID:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al obtener perfil de cliente",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const client = await clientService_1.ClientService.updateClient(id, updateData);
            if (!client) {
                res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado para actualizar",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Cliente actualizado exitosamente",
                data: client,
            });
        }
        catch (error) {
            console.error("Error updating client:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al actualizar cliente",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const success = await clientService_1.ClientService.deleteClient(id);
            if (!success) {
                res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado para eliminar",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Cliente y usuario asociado (si aplica) eliminados exitosamente",
            });
        }
        catch (error) {
            console.error("Error en ClientController.delete:", error);
            if (error.message && error.message.includes('registros asociados')) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error.message && error.message.includes('Cliente no encontrado')) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al eliminar cliente",
                errorDetail: error.message || "Error desconocido",
            });
        }
    }
    static async getStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await clientService_1.ClientService.getClientStats(id);
            res.status(200).json({
                success: true,
                message: "Estadísticas del cliente obtenidas exitosamente",
                data: stats,
            });
        }
        catch (error) {
            console.error("Error fetching client stats:", error);
            if (error.message && error.message.includes("no encontrado")) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al obtener estadísticas",
                error: error.message || "Unknown error",
            });
        }
    }
    static async getByType(req, res) {
        try {
            const { clientType } = req.params;
            const { page = "1", limit = "20" } = req.query;
            const filters = {
                clientType: clientType.toUpperCase(),
            };
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const result = await clientService_1.ClientService.getClients(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: `Clientes tipo '${clientType.toLowerCase()}' obtenidos exitosamente`,
                data: result.clients,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalClients: result.totalClients,
                    hasNext: result.hasNext,
                    hasPrev: result.hasPrev,
                },
            });
        }
        catch (error) {
            console.error("Error fetching clients by type:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al obtener clientes por tipo",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async getVipClients(req, res) {
        try {
            const { page = "1", limit = "20" } = req.query;
            const filters = {
                isVip: true,
            };
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const result = await clientService_1.ClientService.getClients(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: "Clientes VIP obtenidos exitosamente",
                data: result.clients,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalClients: result.totalClients,
                    hasNext: result.hasNext,
                    hasPrev: result.hasPrev,
                },
            });
        }
        catch (error) {
            console.error("Error fetching VIP clients:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al obtener clientes VIP",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const client = await clientService_1.ClientService.updateClient(id, {
                status: status,
            });
            if (!client) {
                res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado para actualizar estado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Estado del cliente actualizado exitosamente",
                data: client,
            });
        }
        catch (error) {
            console.error("Error updating client status:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al actualizar estado del cliente",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async toggleVip(req, res) {
        try {
            const { id } = req.params;
            const { isVip, discount } = req.body;
            const updateData = { isVip };
            if (discount !== undefined) {
                updateData.discount = discount;
            }
            const client = await clientService_1.ClientService.updateClient(id, updateData);
            if (!client) {
                res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado para actualizar estado VIP",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: `Cliente ${isVip ? "promovido a VIP" : "removido de VIP"} exitosamente`,
                data: client,
            });
        }
        catch (error) {
            console.error("Error toggling VIP status:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al actualizar estado VIP",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async search(req, res) {
        try {
            const { q: searchTerm, page = "1", limit = "20" } = req.query;
            if (!searchTerm) {
                res.status(400).json({
                    success: false,
                    message: "El parámetro de búsqueda 'q' es requerido",
                });
                return;
            }
            const filters = {
                search: searchTerm,
            };
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const result = await clientService_1.ClientService.getClients(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: "Búsqueda de clientes completada",
                data: result.clients,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalClients: result.totalClients,
                    hasNext: result.hasNext,
                    hasPrev: result.hasPrev,
                },
                searchTerm: searchTerm,
            });
        }
        catch (error) {
            console.error("Error searching clients:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al buscar clientes",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async getQuoteOptions(req, res) {
        try {
            const { id: clientId } = req.params;
            const quoteOptions = await clientService_1.ClientService.getQuoteOptions(clientId);
            res.status(200).json({
                success: true,
                message: "Opciones de cotización obtenidas exitosamente",
                data: quoteOptions,
            });
        }
        catch (error) {
            console.error("Error fetching quote options:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al obtener opciones de cotización",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
exports.ClientController = ClientController;
//# sourceMappingURL=clientController.js.map