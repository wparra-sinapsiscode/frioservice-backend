// En: src/routes/clientRoutes.ts
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
} from '../validators/clientValidators'; // Asegúrate que la ruta a este archivo sea correcta

const router = Router();

// --- CAMBIO CLAVE: Aplicar 'authenticate' a TODAS las rutas de este router ---
// Todas las rutas definidas DESPUÉS de esta línea requerirán un token válido.
router.use(authenticate);
// --------------------------------------------------------------------------

// RUTA DE PRUEBA TEMPORAL (puede quedarse o quitarse)
router.post('/test-crear', (_req, res) => {
  console.log('@@@ RUTA DE PRUEBA POST /api/clients/test-crear ALCANZADA @@@');
  res.status(200).json({ message: 'Ruta de prueba POST en clientRoutes alcanzada!' });
});

// Rutas principales de clientes
// Ahora 'authenticate' ya se habrá ejecutado y req.user debería estar disponible
router.post('/',
  authorize('ADMIN'),             // Verifica que req.user.role sea ADMIN
  validateBody(CreateClientSchema), // Valida el cuerpo de la petición
  ClientController.create         // Ejecuta la lógica de creación
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

// Para esta ruta, tanto ADMIN como CLIENT pueden acceder, pero 'authenticate' ya puso req.user
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