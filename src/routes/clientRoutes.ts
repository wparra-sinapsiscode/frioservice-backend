import { Router } from 'express';
import { ClientController } from '../controllers/clientController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateClientSchema,
  UpdateClientSchema,
  UpdateClientStatusSchema,
  ToggleVipSchema,
  ClientFiltersSchema,
  ClientSearchSchema,
  ClientIdSchema,
  UserIdSchema,
  ClientTypeParamSchema
} from '../validators/clientValidators';

const router = Router();

// RUTA DE PRUEBA TEMPORAL
router.post('/test-crear', (_req, res) => {
  console.log('@@@ RUTA DE PRUEBA POST /api/clients/test-crear ALCANZADA @@@');
  res.status(200).json({ message: 'Ruta de prueba POST en clientRoutes alcanzada!' });
});

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas principales de clientes
router.post('/',
  authorize('ADMIN'),
  validateBody(CreateClientSchema),
  ClientController.create
);

router.get('/',
  authorize('ADMIN'),
  validateQuery(ClientFiltersSchema),
  ClientController.getAll
);

router.get('/search',
  authorize('ADMIN'),
  validateQuery(ClientSearchSchema),
  ClientController.search
);

router.get('/vip',
  authorize('ADMIN'),
  validateQuery(ClientFiltersSchema),
  ClientController.getVipClients
);

router.get('/type/:clientType',
  authorize('ADMIN'),
  validateParams(ClientTypeParamSchema),
  validateQuery(ClientFiltersSchema),
  ClientController.getByType
);

router.get('/profile/:userId',
  authorize('ADMIN', 'CLIENT'),
  validateParams(UserIdSchema),
  ClientController.getByUserId
);

router.get('/:id',
  authorize('ADMIN'),
  validateParams(ClientIdSchema),
  ClientController.getById
);

router.put('/:id',
  authorize('ADMIN'),
  validateParams(ClientIdSchema),
  validateBody(UpdateClientSchema),
  ClientController.update
);

router.delete('/:id',
  authorize('ADMIN'),
  validateParams(ClientIdSchema),
  ClientController.delete
);

// Rutas especiales para gestión de clientes
router.get('/:id/stats',
  authorize('ADMIN'),
  validateParams(ClientIdSchema),
  ClientController.getStats
);

router.patch('/:id/status',
  authorize('ADMIN'),
  validateParams(ClientIdSchema),
  validateBody(UpdateClientStatusSchema),
  ClientController.updateStatus
);

router.patch('/:id/vip',
  authorize('ADMIN'),
  validateParams(ClientIdSchema),
  validateBody(ToggleVipSchema),
  ClientController.toggleVip
);

export default router;