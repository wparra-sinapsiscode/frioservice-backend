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
        notes
      } = req.body;

      const equipmentData: any = {
        clientId,
        name,
        model,
        brand,
        serialNumber,
        type,
        location,
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
   * Update equipment
   * PUT /api/equipment/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Convert date strings to Date objects if present
      if (updateData.installDate) {
        updateData.installDate = new Date(updateData.installDate);
      }
      if (updateData.warrantyExpiry) {
        updateData.warrantyExpiry = new Date(updateData.warrantyExpiry);
      }

      const equipment = await EquipmentService.updateEquipment(id, updateData);

      if (!equipment) {
        res.status(404).json({
          success: false,
          message: 'Equipo no encontrado'
        });
        return;
      }

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
   * Update equipment status
   * PATCH /api/equipment/:id/status
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const equipment = await EquipmentService.updateEquipment(id, { 
        status: status as EquipmentStatus 
      });

      if (!equipment) {
        res.status(404).json({
          success: false,
          message: 'Equipo no encontrado'
        });
        return;
      }

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