"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteController = void 0;
const quoteService_1 = require("../services/quoteService");
class QuoteController {
    static async create(req, res) {
        try {
            const { serviceId, clientId, title, description, amount, validUntil, notes } = req.body;
            const quoteData = {
                serviceId,
                clientId,
                title,
                description,
                amount: parseFloat(amount),
                validUntil: new Date(validUntil),
                notes
            };
            const quote = await quoteService_1.QuoteService.createQuote(quoteData);
            res.status(201).json({
                success: true,
                message: 'Cotización creada exitosamente',
                data: quote
            });
        }
        catch (error) {
            console.error('Error creating quote:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getAll(req, res) {
        try {
            const { status, clientId, serviceId, page = '1', limit = '20' } = req.query;
            const filters = {
                ...(status && { status: status }),
                ...(clientId && { clientId: clientId }),
                ...(serviceId && { serviceId: serviceId })
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
                const client = await quoteService_1.QuoteService.getClientByUserId(userId);
                if (client) {
                    filters.clientId = client.id;
                }
                else {
                    res.status(200).json({
                        success: true,
                        message: 'Cotizaciones obtenidas exitosamente',
                        data: [],
                        pagination: {
                            currentPage: 1,
                            totalPages: 0,
                            totalQuotes: 0,
                            hasNext: false,
                            hasPrev: false
                        }
                    });
                    return;
                }
            }
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const result = await quoteService_1.QuoteService.getQuotes(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: 'Cotizaciones obtenidas exitosamente',
                data: result.quotes,
                pagination: {
                    currentPage: pageNumber,
                    totalPages: result.pagination.totalPages,
                    totalQuotes: result.pagination.total,
                    hasNext: pageNumber < result.pagination.totalPages,
                    hasPrev: pageNumber > 1
                }
            });
        }
        catch (error) {
            console.error('Error fetching quotes:', error);
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
            const quote = await quoteService_1.QuoteService.getQuoteById(id);
            if (!quote) {
                res.status(404).json({
                    success: false,
                    message: 'Cotización no encontrada'
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
                const client = await quoteService_1.QuoteService.getClientByUserId(userId);
                if (!client || quote.clientId !== client.id) {
                    res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para ver esta cotización'
                    });
                    return;
                }
            }
            res.status(200).json({
                success: true,
                message: 'Cotización obtenida exitosamente',
                data: quote
            });
        }
        catch (error) {
            console.error('Error fetching quote:', error);
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
            const result = await quoteService_1.QuoteService.getQuotes(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: 'Cotizaciones del cliente obtenidas exitosamente',
                data: result.quotes,
                pagination: {
                    currentPage: pageNumber,
                    totalPages: result.pagination.totalPages,
                    totalQuotes: result.pagination.total,
                    hasNext: pageNumber < result.pagination.totalPages,
                    hasPrev: pageNumber > 1
                }
            });
        }
        catch (error) {
            console.error('Error fetching client quotes:', error);
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
            if (updateData.validUntil) {
                updateData.validUntil = new Date(updateData.validUntil);
            }
            if (updateData.amount) {
                updateData.amount = parseFloat(updateData.amount);
            }
            const quote = await quoteService_1.QuoteService.updateQuote(id, updateData);
            if (!quote) {
                res.status(404).json({
                    success: false,
                    message: 'Cotización no encontrada'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Cotización actualizada exitosamente',
                data: quote
            });
        }
        catch (error) {
            console.error('Error updating quote:', error);
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
            const success = await quoteService_1.QuoteService.deleteQuote(id);
            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Cotización no encontrada'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Cotización eliminada exitosamente'
            });
        }
        catch (error) {
            console.error('Error deleting quote:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async approve(req, res) {
        try {
            const { id } = req.params;
            const quote = await quoteService_1.QuoteService.approveQuote(id);
            if (!quote) {
                res.status(404).json({
                    success: false,
                    message: 'Cotización no encontrada'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Cotización aprobada exitosamente',
                data: quote
            });
        }
        catch (error) {
            console.error('Error approving quote:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async reject(req, res) {
        try {
            const { id } = req.params;
            const quote = await quoteService_1.QuoteService.rejectQuote(id);
            if (!quote) {
                res.status(404).json({
                    success: false,
                    message: 'Cotización no encontrada'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Cotización rechazada exitosamente',
                data: quote
            });
        }
        catch (error) {
            console.error('Error rejecting quote:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getExpired(req, res) {
        try {
            const { page = '1', limit = '20' } = req.query;
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const result = await quoteService_1.QuoteService.getExpiredQuotes(pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                message: 'Cotizaciones expiradas obtenidas exitosamente',
                data: result.quotes,
                pagination: {
                    currentPage: pageNumber,
                    totalPages: result.pagination.totalPages,
                    totalQuotes: result.pagination.total,
                    hasNext: pageNumber < result.pagination.totalPages,
                    hasPrev: pageNumber > 1
                }
            });
        }
        catch (error) {
            console.error('Error fetching expired quotes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async createServiceRequest(req, res) {
        try {
            const { title, description, notes, equipmentIds, preferredDate, priority = 'MEDIUM', serviceType = 'MAINTENANCE' } = req.body;
            const userId = req.user?.userId || req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const client = await quoteService_1.QuoteService.getClientByUserId(userId);
            if (!client) {
                res.status(404).json({
                    success: false,
                    message: 'Perfil de cliente no encontrado'
                });
                return;
            }
            const quoteData = {
                clientId: client.id,
                title: title || 'Solicitud de Servicio',
                description: description || '',
                amount: 0,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                notes: `SOLICITUD DE CLIENTE - ${notes || ''}\nEquipos: ${equipmentIds ? equipmentIds.join(', ') : 'N/A'}\nFecha preferida: ${preferredDate || 'N/A'}\nPrioridad: ${priority}\nTipo: ${serviceType}`
            };
            const quote = await quoteService_1.QuoteService.createQuote(quoteData);
            res.status(201).json({
                success: true,
                message: 'Solicitud de servicio creada exitosamente. Un técnico revisará su solicitud y le proporcionará una cotización.',
                data: quote
            });
        }
        catch (error) {
            console.error('Error creating service request:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.QuoteController = QuoteController;
//# sourceMappingURL=quoteController.js.map