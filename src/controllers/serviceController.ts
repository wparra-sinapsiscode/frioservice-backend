import { Request, Response } from 'express';
import { ServiceService } from '../services/serviceService';
import { ServiceType, ServicePriority, ServiceStatus } from '@prisma/client';

export class ServiceController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        clientId,
        technicianId,
        type,
        priority = 'MEDIUM',
        scheduledDate,
        estimatedDuration,
        equipmentIds = [],
        address,
        contactPhone,
        emergencyContact,
        accessInstructions,
        clientNotes
      } = req.body;

      const serviceData = {
        title,
        description,
        clientId,
        technicianId,
        type: type as ServiceType,
        priority: priority as ServicePriority,
        scheduledDate: new Date(scheduledDate),
        estimatedDuration,
        equipmentIds,
        address,
        contactPhone,
        emergencyContact,
        accessInstructions,
        clientNotes
      };

      const service = await ServiceService.createService(serviceData);

      res.status(201).json({
        success: true,
        message: 'Servicio creado exitosamente',
        data: service
      });
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        type,
        priority,
        clientId,
        technicianId,
        startDate,
        endDate,
        page = '1',
        limit = '20'
      } = req.query;

      const filters = {
        ...(status && { status: status as ServiceStatus }),
        ...(type && { type: type as ServiceType }),
        ...(priority && { priority: priority as ServicePriority }),
        ...(clientId && { clientId: clientId as string }),
        ...(technicianId && { technicianId: technicianId as string }),
        ...(startDate && { startDate: new Date(startDate as string) }),
        ...(endDate && { endDate: new Date(endDate as string) })
      };

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await ServiceService.getServices(filters, pageNumber, limitNumber);

      res.status(200).json({
        success: true,
        message: 'Servicios obtenidos exitosamente',
        data: result.services,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.pagination.totalPages,
          totalServices: result.pagination.total,
          hasNext: pageNumber < result.pagination.totalPages,
          hasPrev: pageNumber > 1
        }
      });
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await ServiceService.getServiceById(id);

      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Servicio obtenido exitosamente',
        data: service
      });
    } catch (error) {
      console.error('Error fetching service:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.scheduledDate) {
        updateData.scheduledDate = new Date(updateData.scheduledDate);
      }

      const service = await ServiceService.updateService(id, updateData);

      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Servicio actualizado exitosamente',
        data: service
      });
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await ServiceService.deleteService(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Servicio eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async assignTechnician(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { technicianId } = req.body;

      const service = await ServiceService.assignTechnician(id, technicianId);

      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Técnico asignado exitosamente',
        data: service
      });
    } catch (error) {
      console.error('Error assigning technician:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async completeService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        workPerformed,
        timeSpent,
        materialsUsed,
        technicianNotes,
        clientSignature,
        images
      } = req.body;

      const completionData = {
        workPerformed,
        timeSpent,
        materialsUsed,
        technicianNotes,
        clientSignature,
        images
      };

      const service = await ServiceService.completeService(id, completionData);

      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Servicio completado exitosamente',
        data: service
      });
    } catch (error) {
      console.error('Error completing service:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getServicesByClient(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const {
        status,
        page = '1',
        limit = '20'
      } = req.query;

      const filters = {
        clientId,
        ...(status && { status: status as ServiceStatus })
      };

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await ServiceService.getServices(filters, pageNumber, limitNumber);

      res.status(200).json({
        success: true,
        message: 'Servicios del cliente obtenidos exitosamente',
        data: result.services,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.pagination.totalPages,
          totalServices: result.pagination.total,
          hasNext: pageNumber < result.pagination.totalPages,
          hasPrev: pageNumber > 1
        }
      });
    } catch (error) {
      console.error('Error fetching client services:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getServicesByTechnician(req: Request, res: Response): Promise<void> {
    try {
      const { technicianId } = req.params;
      const {
        status,
        page = '1',
        limit = '20'
      } = req.query;

      const filters = {
        technicianId,
        ...(status && { status: status as ServiceStatus })
      };

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const result = await ServiceService.getServices(filters, pageNumber, limitNumber);

      res.status(200).json({
        success: true,
        message: 'Servicios del técnico obtenidos exitosamente',
        data: result.services,
        pagination: {
          currentPage: pageNumber,
          totalPages: result.pagination.totalPages,
          totalServices: result.pagination.total,
          hasNext: pageNumber < result.pagination.totalPages,
          hasPrev: pageNumber > 1
        }
      });
    } catch (error) {
      console.error('Error fetching technician services:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}