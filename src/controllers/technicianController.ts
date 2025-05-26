import { Request, Response } from "express";
import { TechnicianService, AdminCreateTechnicianAndUserPayload } from "../services/technicianService";

export class TechnicianController {
  /**
   * Crea un nuevo técnico Y su cuenta de usuario (cuando un Admin lo hace).
   * POST /api/technicians
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        username,
        password,
        email,
        specialty,
        experienceYears,
        phone,
        isAvailable,
        firstName,
        lastName,
        name
      } = req.body;

      // Construimos el payload para el nuevo método del servicio
      const payload: AdminCreateTechnicianAndUserPayload = {
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
          name: name
        }
      };

      // Validaciones básicas (Zod es el principal validador a través del middleware)
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

      // Llamamos al método del servicio que crea User y Technician
      const technician = await TechnicianService.adminCreatesTechnicianWithUser(payload);

      res.status(201).json({
        success: true,
        message: "Técnico y cuenta de usuario creados exitosamente",
        data: technician,
      });
    } catch (error: any) {
      console.error("Error en TechnicianController.create:", error);
      
      // Manejo de errores específicos del servicio
      if (error.message && (
        error.message.includes('ya existe') ||
        error.message.includes('registrado') ||
        error.message.includes('requerida') ||
        error.message.includes('Error al crear el técnico y su usuario') ||
        error.message.toLowerCase().includes('inválido')
      )) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      
      // Error genérico si no es uno de los anteriores
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al procesar la creación del técnico.",
        errorDetail: error.message || "Error desconocido",
      });
    }
  }

  /**
   * Get all technicians with filtering and pagination
   * GET /api/technicians
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        specialty,
        isAvailable,
        experienceYears,
        search,
        page = "1",
        limit = "20",
      } = req.query as any;

      const filters: any = {};
      if (specialty) filters.specialty = specialty as string;
      if (isAvailable !== undefined) filters.isAvailable = isAvailable === "true";
      if (experienceYears) filters.experienceYears = parseInt(experienceYears as string, 10);
      if (search) filters.search = search as string;

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await TechnicianService.getTechnicians(
        filters,
        pageNumber,
        limitNumber
      );

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
    } catch (error) {
      console.error("Error fetching technicians:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al obtener técnicos",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get technician by ID
   * GET /api/technicians/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const technician = await TechnicianService.getTechnicianById(id);

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
    } catch (error) {
      console.error("Error fetching technician by ID:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al obtener técnico por ID",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get technician by user ID (for technician's own profile)
   * GET /api/technicians/profile/:userId
   */
  static async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const technician = await TechnicianService.getTechnicianByUserId(userId);

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
    } catch (error) {
      console.error("Error fetching technician profile by User ID:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al obtener perfil de técnico",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Update technician profile
   * PUT /api/technicians/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const technician = await TechnicianService.updateTechnician(id, updateData);

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
    } catch (error) {
      console.error("Error updating technician:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al actualizar técnico",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete technician (hard delete)
   * DELETE /api/technicians/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await TechnicianService.deleteTechnician(id);

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
    } catch (error: any) {
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

  /**
   * Get technician statistics
   * GET /api/technicians/:id/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await TechnicianService.getTechnicianStats(id);

      res.status(200).json({
        success: true,
        message: "Estadísticas del técnico obtenidas exitosamente",
        data: stats,
      });
    } catch (error: any) {
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

  /**
   * Update technician availability
   * PATCH /api/technicians/:id/availability
   */
  static async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;

      const technician = await TechnicianService.updateTechnician(id, {
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
    } catch (error) {
      console.error("Error updating technician availability:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al actualizar disponibilidad del técnico",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Search technicians
   * GET /api/technicians/search
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

      const result = await TechnicianService.getTechnicians(
        filters,
        pageNumber,
        limitNumber
      );

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
    } catch (error) {
      console.error("Error searching technicians:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al buscar técnicos",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}