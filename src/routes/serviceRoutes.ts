import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams, validateQuery, validateServiceCreation } from '../middleware/validation';
import {
  CreateServiceSchema,
  CreateServiceClientSchema,
  UpdateServiceSchema,
  AssignTechnicianSchema,
  CompleteServiceSchema,
  ServiceFiltersSchema,
  ServiceIdSchema,
  ClientIdSchema,
  TechnicianIdSchema
} from '../validators/serviceValidators';

const router = Router();

// Middleware de logging para debugging
router.use((req, _res, next) => {
  try {
    const bodyKeys = req.body && typeof req.body === 'object' ? Object.keys(req.body) : 'no body';
    console.log(`🔥 ServiceRoutes - ${req.method} ${req.path} - Params:`, req.params, '- Body:', bodyKeys);
  } catch (error) {
    console.log(`🔥 ServiceRoutes - ${req.method} ${req.path} - Error in logging:`, error);
  }
  next();
});

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas principales de servicios
router.post('/', 
  authorize('ADMIN', 'CLIENT'), 
  validateServiceCreation(CreateServiceSchema, CreateServiceClientSchema),
  ServiceController.create
);

router.get('/', 
  authorize('ADMIN', 'TECHNICIAN', 'CLIENT'), 
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

// Agregar ruta POST para compatibilidad (si el frontend sigue enviando POST)
router.post('/:id/complete', 
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