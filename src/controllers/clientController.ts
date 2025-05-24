import { Request, Response } from "express";
import { ClientService } from "../services/clientService";
import { ClientType, ClientStatus } from "@prisma/client";

export class ClientController {
  /**
   * Create a new client profile
   * POST /api/clients
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        companyName,
        contactPerson,
        businessRegistration,
        phone,
        email,
        emergencyContact,
        address,
        city,
        postalCode,
        clientType,
        preferredSchedule,
        notes,
        isVip,
        discount,
      } = req.body;

      const clientData = {
        userId,
        companyName,
        contactPerson,
        businessRegistration,
        phone,
        email,
        emergencyContact,
        address,
        city,
        postalCode,
        clientType: clientType as ClientType,
        preferredSchedule,
        notes,
        isVip,
        discount,
      };

      const client = await ClientService.createClient(clientData);

      res.status(201).json({
        success: true,
        message: "Perfil de cliente creado exitosamente",
        data: client,
      });
    } catch (error) {
      console.error("Error creating client:", error);

      if (error instanceof Error) {
        if (error.message.includes("ya tiene un perfil")) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }

        if (
          error.message.includes("no encontrado") ||
          error.message.includes("debe tener rol")
        ) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all clients with filtering and pagination
   * GET /api/clients
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        clientType,
        city,
        isVip,
        search,
        page = "1",
        limit = "20",
      } = req.query;

      const filters = {
        ...(status && { status: status as ClientStatus }),
        ...(clientType && { clientType: clientType as ClientType }),
        ...(city && { city: city as string }),
        ...(isVip !== undefined && { isVip: isVip === "true" }),
        ...(search && { search: search as string }),
      };

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await ClientService.getClients(
        filters,
        pageNumber,
        limitNumber
      );

      res.status(200).json({
        success: true,
        message: "Clientes obtenidos exitosamente",
        data: result.clients,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.totalPages,
          totalClients: result.totalClients,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get client by ID
   * GET /api/clients/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const client = await ClientService.getClientById(id);

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
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get client by user ID (for client's own profile)
   * GET /api/clients/profile/:userId
   */
  static async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const client = await ClientService.getClientByUserId(userId);

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Perfil de cliente no encontrado",
        });
        return; // Solo return sin valor para salir de la función
      }

      res.status(200).json({
        success: true,
        message: "Perfil de cliente obtenido exitosamente",
        data: client,
      });
    } catch (error) {
      console.error("Error fetching client profile:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Update client profile
   * PUT /api/clients/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const client = await ClientService.updateClient(id, updateData);

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cliente actualizado exitosamente",
        data: client,
      });
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete client (soft delete)
   * DELETE /api/clients/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await ClientService.deleteClient(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Cliente eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get client statistics
   * GET /api/clients/:id/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await ClientService.getClientStats(id);

      res.status(200).json({
        success: true,
        message: "Estadísticas del cliente obtenidas exitosamente",
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching client stats:", error);

      if (error instanceof Error && error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get clients by type (personal or company)
   * GET /api/clients/type/:clientType
   */
  static async getByType(req: Request, res: Response): Promise<void> {
    try {
      const { clientType } = req.params;
      const { page = "1", limit = "20" } = req.query;

      const filters = {
        clientType: clientType.toUpperCase() as ClientType,
      };

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await ClientService.getClients(
        filters,
        pageNumber,
        limitNumber
      );

      res.status(200).json({
        success: true,
        message: `Clientes ${clientType.toLowerCase()} obtenidos exitosamente`,
        data: result.clients,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.totalPages,
          totalClients: result.totalClients,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error) {
      console.error("Error fetching clients by type:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get VIP clients
   * GET /api/clients/vip
   */
  static async getVipClients(req: Request, res: Response): Promise<void> {
    try {
      const { page = "1", limit = "20" } = req.query;

      const filters = {
        isVip: true,
      };

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await ClientService.getClients(
        filters,
        pageNumber,
        limitNumber
      );

      res.status(200).json({
        success: true,
        message: "Clientes VIP obtenidos exitosamente",
        data: result.clients,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.totalPages,
          totalClients: result.totalClients,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error) {
      console.error("Error fetching VIP clients:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Update client status
   * PATCH /api/clients/:id/status
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const client = await ClientService.updateClient(id, {
        status: status as ClientStatus,
      });

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Estado del cliente actualizado exitosamente",
        data: client,
      });
    } catch (error) {
      console.error("Error updating client status:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Toggle VIP status
   * PATCH /api/clients/:id/vip
   */
  static async toggleVip(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isVip, discount } = req.body;

      const updateData: any = { isVip };
      if (discount !== undefined) {
        updateData.discount = discount;
      }

      const client = await ClientService.updateClient(id, updateData);

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Cliente ${isVip ? "promovido a VIP" : "removido de VIP"} exitosamente`,
        data: client,
      });
    } catch (error) {
      console.error("Error toggling VIP status:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Search clients
   * GET /api/clients/search
   */
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const { q: search, page = "1", limit = "20" } = req.query;

      if (!search) {
        res.status(400).json({
          success: false,
          message: "El parámetro de búsqueda es requerido",
        });
        return;
      }

      const filters = {
        search: search as string,
      };

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await ClientService.getClients(
        filters,
        pageNumber,
        limitNumber
      );

      res.status(200).json({
        success: true,
        message: "Búsqueda de clientes completada",
        data: result.clients,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.totalPages,
          totalClients: result.totalClients,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
        searchTerm: search,
      });
    } catch (error) {
      console.error("Error searching clients:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
