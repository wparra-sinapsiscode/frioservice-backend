import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateServiceSchema,
  UpdateServiceSchema,
  AssignTechnicianSchema,
  CompleteServiceSchema,
  ServiceFiltersSchema,
  ServiceIdSchema,
  ClientIdSchema,
  TechnicianIdSchema
} from '../validators/serviceValidators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas principales de servicios
router.post('/', 
  authorize('ADMIN', 'CLIENT'), 
  validateBody(CreateServiceSchema), 
  ServiceController.create
);

router.get('/', 
  authorize('ADMIN', 'TECHNICIAN'), 
  validateQuery(ServiceFiltersSchema), 
  ServiceController.getAll
);

router.get('/:id', 
  authorize('ADMIN', 'TECHNICIAN', 'CLIENT'), 
  validateParams(ServiceIdSchema), 
  ServiceController.getById
);

router.put('/:id', 
  authorize('ADMIN', 'TECHNICIAN'), 
  validateParams(ServiceIdSchema),
  validateBody(UpdateServiceSchema), 
  ServiceController.update
);

router.delete('/:id', 
  authorize('ADMIN'), 
  validateParams(ServiceIdSchema),
  ServiceController.delete
);

// Rutas específicas para asignación y completado
router.patch('/:id/assign', 
  authorize('ADMIN'), 
  validateParams(ServiceIdSchema),
  validateBody(AssignTechnicianSchema),
  ServiceController.assignTechnician
);

router.patch('/:id/complete', 
  authorize('ADMIN', 'TECHNICIAN'), 
  validateParams(ServiceIdSchema),
  validateBody(CompleteServiceSchema),
  ServiceController.completeService
);

// Rutas para obtener servicios por cliente y técnico
router.get('/client/:clientId', 
  authorize('ADMIN', 'CLIENT'), 
  validateParams(ClientIdSchema),
  validateQuery(ServiceFiltersSchema),
  ServiceController.getServicesByClient
);

router.get('/technician/:technicianId', 
  authorize('ADMIN', 'TECHNICIAN'), 
  validateParams(TechnicianIdSchema),
  validateQuery(ServiceFiltersSchema),
  ServiceController.getServicesByTechnician
);

export default router;