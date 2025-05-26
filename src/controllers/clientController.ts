import { Request, Response } from "express";
import { ClientService, AdminCreateClientAndUserPayload } from "../services/clientService";
import { ClientType, ClientStatus } from "@prisma/client";

export class ClientController {
  /**
   * Crea un nuevo cliente Y su cuenta de usuario (cuando un Admin lo hace).
   * POST /api/clients
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        username,
        password,
        email,
        clientType,
        companyName,
        firstName,
        lastName,
        name,
        ruc,
        dni,
        phone,
        address,
        city,
        district,
        sector,
        contactPerson,
        businessRegistration,
        emergencyContact,
        postalCode,
        preferredSchedule,
        notes,
        isVip,
        discount
      } = req.body;

      // Construimos el payload para el nuevo método del servicio
      const payload: AdminCreateClientAndUserPayload = {
        newUser: {
          username: username,
          email: email,
          password: password,
        },
        clientProfile: {
          clientType: clientType as ClientType,
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

      // Validaciones básicas (Zod es el principal validador a través del middleware)
      // Estas son una segunda capa opcional o para lógica muy simple.
      if (!payload.newUser.username || !payload.newUser.email || !payload.newUser.password) {
        res.status(400).json({ success: false, message: "El nombre de usuario, email y contraseña son requeridos para la nueva cuenta del cliente." });
        return;
      }
      if (!payload.clientProfile.clientType) {
        res.status(400).json({ success: false, message: "El tipo de cliente (clientType) es requerido." });
        return;
      }
      // Las validaciones condicionales más complejas (ej. companyName si es COMPANY)
      // deberían estar principalmente en tu CreateClientSchema de Zod.
      // Ejemplo:
      if (payload.clientProfile.clientType === ClientType.COMPANY && !(payload.clientProfile.companyName || payload.clientProfile.name)) {
        res.status(400).json({ success: false, message: "El nombre de la empresa (companyName o name) es requerido para clientes de tipo EMPRESA." });
        return;
      }
      if (payload.clientProfile.clientType === ClientType.PERSONAL && !(payload.clientProfile.firstName || payload.clientProfile.name)) {
        res.status(400).json({ success: false, message: "El nombre (firstName o name) es requerido para clientes de tipo PERSONAL." });
        return;
      }

      // Llamamos al NUEVO método del servicio que crea User y Client
      const client = await ClientService.adminCreatesClientWithUser(payload);

      res.status(201).json({
        success: true,
        message: "Cliente y cuenta de usuario creados exitosamente", // Mensaje actualizado
        data: client,
      });
    } catch (error: any) {
      console.error("Error en ClientController.create:", error);
      // Manejo de errores mejorado para mensajes específicos del servicio
      if (error.message && (
        error.message.includes('ya existe') ||
        error.message.includes('registrado') ||
        error.message.includes('requerida') ||
        error.message.includes('Error al crear el cliente y su usuario') ||
        error.message.toLowerCase().includes('inválido')
      )) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      // Error genérico si no es uno de los anteriores
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al procesar la creación del cliente.",
        errorDetail: error.message || "Error desconocido",
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
      } = req.query as any;

      const filters: any = {};
      if (status) filters.status = status as ClientStatus;
      if (clientType) filters.clientType = clientType as ClientType;
      if (city) filters.city = city as string;
      if (isVip !== undefined) filters.isVip = isVip === "true";
      if (search) filters.search = search as string;

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
          currentPage: result.currentPage,
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
        message: "Error interno del servidor al obtener clientes",
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
      console.error("Error fetching client by ID:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al obtener cliente por ID",
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
          message: "Perfil de cliente no encontrado para el ID de usuario proporcionado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Perfil de cliente obtenido exitosamente",
        data: client,
      });
    } catch (error) {
      console.error("Error fetching client profile by User ID:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al obtener perfil de cliente",
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
          message: "Cliente no encontrado para actualizar",
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
        message: "Error interno del servidor al actualizar cliente",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete client (soft delete)
   * DELETE /api/clients/:id
   */
  // static async delete(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { id } = req.params;
  //     const success = await ClientService.deleteClient(id);

  //     if (!success) {
  //       res.status(404).json({
  //         success: false,
  //         message: "Cliente no encontrado para eliminar",
  //       });
  //       return;
  //     }

  //     res.status(200).json({
  //       success: true,
  //       message: "Cliente marcado como inactivo exitosamente",
  //     });
  //   } catch (error) {
  //     console.error("Error deleting client:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Error interno del servidor al eliminar cliente",
  //       error: error instanceof Error ? error.message : "Unknown error",
  //     });
  //   }
  // }

  /**
   * Delete client (AHORA ES HARD DELETE)
   * DELETE /api/clients/:id
   */

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await ClientService.deleteClient(id); // Llama al método que ahora hace hard delete

      if (!success) { // Esto podría no alcanzarse si el servicio lanza error en lugar de devolver false
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado para eliminar",
        });
        return;
      }

      res.status(200).json({ // O 204 No Content si no devuelves cuerpo
        success: true,
        message: "Cliente y usuario asociado (si aplica) eliminados exitosamente",
      });
    } catch (error: any) {
      console.error("Error en ClientController.delete:", error);
      if (error.message && error.message.includes('registros asociados')) {
        res.status(400).json({ // 400 Bad Request o 409 Conflict podrían ser apropiados
          success: false,
          message: error.message,
        });
        return;
      }
      if (error.message && error.message.includes('Cliente no encontrado')) { // Si el servicio lanza esto
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
    } catch (error: any) {
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

  /**
   * Get clients by type (personal or company)
   * GET /api/clients/type/:clientType
   */
  static async getByType(req: Request, res: Response): Promise<void> {
    try {
      const { clientType } = req.params;
      const { page = "1", limit = "20" } = req.query as any;

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
    } catch (error) {
      console.error("Error fetching clients by type:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al obtener clientes por tipo",
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
      const { page = "1", limit = "20" } = req.query as any;

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
          currentPage: result.currentPage,
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
        message: "Error interno del servidor al obtener clientes VIP",
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
          message: "Cliente no encontrado para actualizar estado",
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
        message: "Error interno del servidor al actualizar estado del cliente",
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
          message: "Cliente no encontrado para actualizar estado VIP",
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
        message: "Error interno del servidor al actualizar estado VIP",
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
      const { q: searchTerm, page = "1", limit = "20" } = req.query as any;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: "El parámetro de búsqueda 'q' es requerido",
        });
        return;
      }

      const filters = {
        search: searchTerm as string,
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
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalClients: result.totalClients,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
        searchTerm: searchTerm,
      });
    } catch (error) {
      console.error("Error searching clients:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al buscar clientes",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}