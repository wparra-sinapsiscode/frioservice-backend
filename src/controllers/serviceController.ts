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

      let finalClientId = clientId;

      // If user is CLIENT, ensure they can only create services for themselves
      if ((req as any).user?.role === 'CLIENT') {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ 
            success: false, 
            message: 'Usuario no autenticado' 
          });
          return;
        }
        
        const client = await ServiceService.getClientByUserId(userId);
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
            message: 'No puedes crear servicios para otros clientes'
          });
          return;
        }
      }

      const serviceData = {
        title,
        description,
        clientId: finalClientId,
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
      console.log('🔥 ServiceController.getAll - Request received');
      console.log('🔥 ServiceController.getAll - Query params:', req.query);
      console.log('🔥 ServiceController.getAll - User:', (req as any).user);
      
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
      
      console.log('🔥 ServiceController.getAll - Initial filters:', filters);

      // If user is CLIENT, only show their own services
      if ((req as any).user?.role === 'CLIENT') {
        console.log('🔥 ServiceController.getAll - User is CLIENT, getting client info');
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) {
          console.log('🔥 ServiceController.getAll - No userId found');
          res.status(401).json({ 
            success: false, 
            message: 'Usuario no autenticado' 
          });
          return;
        }
        
        console.log('🔥 ServiceController.getAll - Getting client by userId:', userId);
        const client = await ServiceService.getClientByUserId(userId);
        console.log('🔥 ServiceController.getAll - Client found:', client);
        
        if (client) {
          filters.clientId = client.id;
        } else {
          console.log('🔥 ServiceController.getAll - No client found, returning empty array');
          res.status(200).json({
            success: true,
            message: 'Servicios obtenidos exitosamente',
            data: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalServices: 0,
              hasNext: false,
              hasPrev: false
            }
          });
          return;
        }
      }

      console.log('🔥 ServiceController.getAll - Final filters:', filters);

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      console.log('🔥 ServiceController.getAll - Calling ServiceService.getServices');
      const result = await ServiceService.getServices(filters, pageNumber, limitNumber);
      console.log('🔥 ServiceController.getAll - ServiceService.getServices result:', result);

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

      // If user is CLIENT, verify they own this service
      if ((req as any).user?.role === 'CLIENT') {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ 
            success: false, 
            message: 'Usuario no autenticado' 
          });
          return;
        }
        
        const client = await ServiceService.getClientByUserId(userId);
        if (!client || service.clientId !== client.id) {
          res.status(403).json({
            success: false,
            message: 'No tienes permisos para ver este servicio'
          });
          return;
        }
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
      console.log('🔥 ServiceController.completeService - Iniciando completar servicio');
      console.log('🔥 ServiceController.completeService - Params:', req.params);
      console.log('🔥 ServiceController.completeService - Body:', req.body);
      console.log('🔥 ServiceController.completeService - User:', (req as any).user);
      
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

      console.log('🔥 ServiceController.completeService - Completion data:', completionData);

      const service = await ServiceService.completeService(id, completionData);

      if (!service) {
        console.log('🔥 ServiceController.completeService - Servicio no encontrado para ID:', id);
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
        return;
      }

      console.log('🔥 ServiceController.completeService - Servicio completado exitosamente:', service.id);
      
      res.status(200).json({
        success: true,
        message: 'Servicio completado exitosamente',
        data: service
      });
    } catch (error) {
      console.error('🔥 ServiceController.completeService - Error:', error);
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