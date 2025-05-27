import { Request, Response } from 'express';
import { EquipmentService } from '../services/equipmentService';
import { EquipmentStatus } from '@prisma/client';

export class EquipmentController {
  /**
   * Create new equipment
   * POST /api/equipment
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        clientId,
        name,
        model,
        brand,
        serialNumber,
        type,
        location,
        installDate,
        warrantyExpiry,
        status,
        notes
      } = req.body;

      let finalClientId = clientId;

      // If user is CLIENT, ensure they can only create equipment for themselves
      if ((req as any).user?.role === 'CLIENT') {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ 
            success: false, 
            message: 'Usuario no autenticado' 
          });
          return;
        }
        
        const client = await EquipmentService.getClientByUserId(userId);
        if (!client) {
          res.status(404).json({
            success: false,
            message: 'Perfil de cliente no encontrado'
          });
          return;
        }
        
        // Force clientId to be the authenticated client's ID
        finalClientId = client.id;
        
        // If clientId was provided in body and doesn't match, return error
        if (clientId && clientId !== client.id) {
          res.status(403).json({
            success: false,
            message: 'No puedes crear equipos para otros clientes'
          });
          return;
        }
      }

      const equipmentData: any = {
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

      const equipment = await EquipmentService.createEquipment(equipmentData);

      res.status(201).json({
        success: true,
        message: 'Equipo creado exitosamente',
        data: equipment
      });
    } catch (error) {
      console.error('Error creating equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all equipment with filtering
   * GET /api/equipment
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        clientId,
        status,
        type,
        brand,
        page = '1',
        limit = '20'
      } = req.query;

      const filters = {
        ...(clientId && { clientId: clientId as string }),
        ...(status && { status: status as EquipmentStatus }),
        ...(type && { type: type as string }),
        ...(brand && { brand: brand as string })
      };

      // If user is CLIENT, only show their own equipment
      if ((req as any).user?.role === 'CLIENT') {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ 
            success: false, 
            message: 'Usuario no autenticado' 
          });
          return;
        }
        
        // Find the client record for this user
        const client = await EquipmentService.getClientByUserId(userId);
        if (client) {
          filters.clientId = client.id;
        } else {
          // If no client record found, return empty results
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

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await EquipmentService.getEquipment(filters, pageNumber, limitNumber);

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
    } catch (error) {
      console.error('Error fetching equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get equipment by ID
   * GET /api/equipment/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const equipment = await EquipmentService.getEquipmentById(id);

      if (!equipment) {
        res.status(404).json({
          success: false,
          message: 'Equipo no encontrado'
        });
        return;
      }

      // If user is CLIENT, verify they own this equipment
      if ((req as any).user?.role === 'CLIENT') {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ 
            success: false, 
            message: 'Usuario no autenticado' 
          });
          return;
        }
        
        const client = await EquipmentService.getClientByUserId(userId);
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
    } catch (error) {
      console.error('Error fetching equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get equipment by client
   * GET /api/equipment/client/:clientId
   */
  static async getByClient(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const {
        status,
        page = '1',
        limit = '20'
      } = req.query;

      const filters = {
        clientId,
        ...(status && { status: status as EquipmentStatus })
      };

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await EquipmentService.getEquipment(filters, pageNumber, limitNumber);

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
    } catch (error) {
      console.error('Error fetching client equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update equipment (ADMIN or CLIENT owner)
   * PUT /api/equipment/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // First check if equipment exists and get ownership info
      const existingEquipment = await EquipmentService.getEquipmentById(id);
      if (!existingEquipment) {
        res.status(404).json({
          success: false,
          message: 'Equipo no encontrado'
        });
        return;
      }

      // If user is CLIENT, verify they own this equipment
      if ((req as any).user?.role === 'CLIENT') {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ 
            success: false, 
            message: 'Usuario no autenticado' 
          });
          return;
        }
        
        const client = await EquipmentService.getClientByUserId(userId);
        if (!client || existingEquipment.clientId !== client.id) {
          res.status(403).json({
            success: false,
            message: 'No tienes permisos para modificar este equipo'
          });
          return;
        }
      }

      // Convert date strings to Date objects if present
      if (updateData.installDate) {
        updateData.installDate = new Date(updateData.installDate);
      }
      if (updateData.warrantyExpiry) {
        updateData.warrantyExpiry = new Date(updateData.warrantyExpiry);
      }

      const equipment = await EquipmentService.updateEquipment(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Equipo actualizado exitosamente',
        data: equipment
      });
    } catch (error) {
      console.error('Error updating equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete equipment
   * DELETE /api/equipment/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await EquipmentService.deleteEquipment(id);

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
    } catch (error) {
      console.error('Error deleting equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update equipment status (ADMIN/TECHNICIAN or CLIENT owner)
   * PATCH /api/equipment/:id/status
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // First check if equipment exists and get ownership info
      const existingEquipment = await EquipmentService.getEquipmentById(id);
      if (!existingEquipment) {
        res.status(404).json({
          success: false,
          message: 'Equipo no encontrado'
        });
        return;
      }

      // If user is CLIENT, verify they own this equipment
      if ((req as any).user?.role === 'CLIENT') {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ 
            success: false, 
            message: 'Usuario no autenticado' 
          });
          return;
        }
        
        const client = await EquipmentService.getClientByUserId(userId);
        if (!client || existingEquipment.clientId !== client.id) {
          res.status(403).json({
            success: false,
            message: 'No tienes permisos para modificar este equipo'
          });
          return;
        }

        // Clients can only set certain statuses (not technical ones)
        const allowedClientStatuses = ['ACTIVE', 'MAINTENANCE', 'BROKEN', 'INACTIVE'];
        if (!allowedClientStatuses.includes(status)) {
          res.status(403).json({
            success: false,
            message: 'Estado no permitido para clientes'
          });
          return;
        }
      }

      const equipment = await EquipmentService.updateEquipment(id, { 
        status: status as EquipmentStatus 
      });

      res.status(200).json({
        success: true,
        message: 'Estado del equipo actualizado exitosamente',
        data: equipment
      });
    } catch (error) {
      console.error('Error updating equipment status:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}