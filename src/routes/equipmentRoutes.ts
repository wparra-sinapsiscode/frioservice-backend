import { Router } from 'express';
import { EquipmentController } from '../controllers/equipmentController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateEquipmentSchema,
  UpdateEquipmentSchema,
  EquipmentFiltersSchema,
  EquipmentIdSchema,
  EquipmentStatusSchema,
  ClientIdSchema
} from '../validators/equipmentValidators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas principales de equipos
router.post('/', 
  authorize('ADMIN', 'CLIENT'), 
  validateBody(CreateEquipmentSchema),
  EquipmentController.create
);

router.get('/', 
  authorize('ADMIN', 'TECHNICIAN'), 
  validateQuery(EquipmentFiltersSchema),
  EquipmentController.getAll
);

router.get('/:id', 
  authorize('ADMIN', 'TECHNICIAN', 'CLIENT'), 
  validateParams(EquipmentIdSchema),
  EquipmentController.getById
);

router.put('/:id', 
  authorize('ADMIN', 'CLIENT'), 
  validateParams(EquipmentIdSchema),
  validateBody(UpdateEquipmentSchema),
  EquipmentController.update
);

router.delete('/:id', 
  authorize('ADMIN'), 
  validateParams(EquipmentIdSchema),
  EquipmentController.delete
);

// Rutas específicas
router.get('/client/:clientId', 
  authorize('ADMIN', 'CLIENT'), 
  validateParams(ClientIdSchema),
  validateQuery(EquipmentFiltersSchema),
  EquipmentController.getByClient
);

router.patch('/:id/status', 
  authorize('ADMIN', 'TECHNICIAN'), 
  validateParams(EquipmentIdSchema),
  validateBody(EquipmentStatusSchema),
  EquipmentController.updateStatus
);

export default router;