"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianController = void 0;
const technicianService_1 = require("../services/technicianService");
class TechnicianController {
    static async create(req, res) {
        try {
            console.log("🚨 [CONTROLLER] req.body COMPLETO:", JSON.stringify(req.body, null, 2));
            const { username, password, email, specialty, experienceYears, phone, isAvailable, firstName, lastName, name, rating, averageTime, servicesCompleted } = req.body;
            console.log("🚨 [CONTROLLER] RATING extraído:", rating, "tipo:", typeof rating);
            console.log("🚨 [CONTROLLER] AVERAGETIME extraído:", averageTime, "tipo:", typeof averageTime);
            console.log("🚨 [CONTROLLER] SERVICESCOMPLETED extraído:", servicesCompleted, "tipo:", typeof servicesCompleted);
            const payload = {
                newUser: {
                    username: username,
                    email: email,
                    password: password,
                },
                technicianProfile: {
                    specialty: specialty,
                    experienceYears: experienceYears,
                    phone: phone,
                    isAvailable: isAvailable !== undefined ? isAvailable : true,
                    firstName: firstName,
                    lastName: lastName,
                    name: name,
                    rating: rating,
                    averageTime: averageTime,
                    servicesCompleted: servicesCompleted
                }
            };
            console.log("🚨 [CONTROLLER] PAYLOAD COMPLETO:", JSON.stringify(payload, null, 2));
            if (!payload.newUser.username || !payload.newUser.email || !payload.newUser.password) {
                res.status(400).json({
                    success: false,
                    message: "El nombre de usuario, email y contraseña son requeridos para la nueva cuenta del técnico."
                });
                return;
            }
            if (!payload.technicianProfile.specialty) {
                res.status(400).json({
                    success: false,
                    message: "La especialidad es requerida para el técnico."
                });
                return;
            }
            if (!payload.technicianProfile.experienceYears || payload.technicianProfile.experienceYears < 0) {
                res.status(400).json({
                    success: false,
                    message: "Los años de experiencia son requeridos y deben ser un número positivo."
                });
                return;
            }
            if (!(payload.technicianProfile.firstName || payload.technicianProfile.name)) {
                res.status(400).json({
                    success: false,
                    message: "El nombre (firstName o name) es requerido para el técnico."
                });
                return;
            }
            const technician = await technicianService_1.TechnicianService.adminCreatesTechnicianWithUser(payload);
            res.status(201).json({
                success: true,
                message: "Técnico y cuenta de usuario creados exitosamente",
                data: technician,
            });
        }
        catch (error) {
            console.error("Error en TechnicianController.create:", error);
            if (error.message && (error.message.includes('ya existe') ||
                error.message.includes('registrado') ||
                error.message.includes('requerida') ||
                error.message.includes('Error al crear el técnico y su usuario') ||
                error.message.toLowerCase().includes('inválido'))) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al procesar la creación del técnico.",
                errorDetail: error.message || "Error desconocido",
            });
        }
    }
    static async getAll(req, res) {
        try {
            const { specialty, isAvailable, experienceYears, search, page = "1", limit = "20", } = req.query;
            if (req.user?.role === 'CLIENT') {
                const filters = {};
                if (specialty)
                    filters.specialty = specialty;
                if (isAvailable !== undefined)
                    filters.isAvailable = isAvailable === "true";
                if (experienceYears)
                    filters.experienceYears = parseInt(experienceYears, 10);
                if (search)
                    filters.search = search;
                const result = await technicianService_1.TechnicianService.getTechniciansPublicInfo(filters, parseInt(page, 10), parseInt(limit, 10));
                res.status(200).json({
                    success: true,
                    message: "Técnicos obtenidos exitosamente",
                    data: result.technicians,
                    pagination: {
                        currentPage: result.currentPage,
                        totalPages: result.totalPages,
                        totalTechnicians: result.totalTechnicians,
                        hasNext: result.hasNext,
                        hasPrev: result.hasPrev,
                    },
                });
                return;
            }
            const filters = {};
            if (specialty)
                filters.specialty = specialty;
            if (isAvailable !== undefined)
                filters.isAvailable = isAvailable === "true";
            if (experienceYears)
                filters.experienceYears = parseInt(experienceYears, 10);
            if (search)
                filters.search = search;
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const result = await technicianService_1.TechnicianService.getTechnicians(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: "Técnicos obtenidos exitosamente",
                data: result.technicians,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalTechnicians: result.totalTechnicians,
                    hasNext: result.hasNext,
                    hasPrev: result.hasPrev,
                },
            });
        }
        catch (error) {
            console.error("Error fetching technicians:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al obtener técnicos",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const technician = await technicianService_1.TechnicianService.getTechnicianById(id);
            if (!technician) {
                res.status(404).json({
                    success: false,
                    message: "Técnico no encontrado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Técnico obtenido exitosamente",
                data: technician,
            });
        }
        catch (error) {
            console.error("Error fetching technician by ID:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al obtener técnico por ID",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async getByUserId(req, res) {
        try {
            const { userId } = req.params;
            const technician = await technicianService_1.TechnicianService.getTechnicianByUserId(userId);
            if (!technician) {
                res.status(404).json({
                    success: false,
                    message: "Perfil de técnico no encontrado para el ID de usuario proporcionado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Perfil de técnico obtenido exitosamente",
                data: technician,
            });
        }
        catch (error) {
            console.error("Error fetching technician profile by User ID:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al obtener perfil de técnico",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const technician = await technicianService_1.TechnicianService.updateTechnician(id, updateData);
            if (!technician) {
                res.status(404).json({
                    success: false,
                    message: "Técnico no encontrado para actualizar",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Técnico actualizado exitosamente",
                data: technician,
            });
        }
        catch (error) {
            console.error("Error updating technician:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al actualizar técnico",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const success = await technicianService_1.TechnicianService.deleteTechnician(id);
            if (!success) {
                res.status(404).json({
                    success: false,
                    message: "Técnico no encontrado para eliminar",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Técnico y usuario asociado eliminados exitosamente",
            });
        }
        catch (error) {
            console.error("Error en TechnicianController.delete:", error);
            if (error.message && error.message.includes('registros asociados')) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error.message && error.message.includes('Técnico no encontrado')) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al eliminar técnico",
                errorDetail: error.message || "Error desconocido",
            });
        }
    }
    static async getStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await technicianService_1.TechnicianService.getTechnicianStats(id);
            res.status(200).json({
                success: true,
                message: "Estadísticas del técnico obtenidas exitosamente",
                data: stats,
            });
        }
        catch (error) {
            console.error("Error fetching technician stats:", error);
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
    static async updateAvailability(req, res) {
        try {
            const { id } = req.params;
            const { isAvailable } = req.body;
            const technician = await technicianService_1.TechnicianService.updateTechnician(id, {
                isAvailable: isAvailable,
            });
            if (!technician) {
                res.status(404).json({
                    success: false,
                    message: "Técnico no encontrado para actualizar disponibilidad",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Disponibilidad del técnico actualizada exitosamente",
                data: technician,
            });
        }
        catch (error) {
            console.error("Error updating technician availability:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al actualizar disponibilidad del técnico",
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
            const result = await technicianService_1.TechnicianService.getTechnicians(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: "Búsqueda de técnicos completada",
                data: result.technicians,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalTechnicians: result.totalTechnicians,
                    hasNext: result.hasNext,
                    hasPrev: result.hasPrev,
                },
                searchTerm: searchTerm,
            });
        }
        catch (error) {
            console.error("Error searching technicians:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor al buscar técnicos",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
exports.TechnicianController = TechnicianController;
//# sourceMappingURL=technicianController.js.map