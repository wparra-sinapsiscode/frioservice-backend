// En: src/routes/technicianRoutes.ts
import { Router } from 'express';
import { TechnicianController } from '../controllers/technicianController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateTechnicianSchema,
  UpdateTechnicianSchema,
  UpdateTechnicianAvailabilitySchema,
  TechnicianFiltersSchema,
  TechnicianSearchSchema,
  TechnicianIdSchema,
  UserIdSchema
} from '../validators/technicianValidators';

const router = Router();

// --- Aplicar 'authenticate' a TODAS las rutas de este router ---
// Todas las rutas definidas DESPUÉS de esta línea requerirán un token válido.
router.use(authenticate);
// --------------------------------------------------------------------------

// RUTA DE PRUEBA TEMPORAL (puede quedarse o quitarse)
router.post('/test-crear', (_req, res) => {
  console.log('@@@ RUTA DE PRUEBA POST /api/technicians/test-crear ALCANZADA @@@');
  res.status(200).json({ message: 'Ruta de prueba POST en technicianRoutes alcanzada!' });
});

// Rutas principales de técnicos
// Ahora 'authenticate' ya se habrá ejecutado y req.user debería estar disponible
router.post('/',
  authorize('ADMIN'),                    // Verifica que req.user.role sea ADMIN
  validateBody(CreateTechnicianSchema),  // Valida el cuerpo de la petición
  TechnicianController.create            // Ejecuta la lógica de creación
);

router.get('/',
  authorize('ADMIN'),
  validateQuery(TechnicianFiltersSchema),
  TechnicianController.getAll
);

router.get('/search',
  authorize('ADMIN'),
  validateQuery(TechnicianSearchSchema),
  TechnicianController.search
);

// Para esta ruta, tanto ADMIN como TECHNICIAN pueden acceder
router.get('/profile/:userId',
  authorize('ADMIN', 'TECHNICIAN'), 
  validateParams(UserIdSchema),
  TechnicianController.getByUserId
);

router.get('/:id',
  authorize('ADMIN'),
  validateParams(TechnicianIdSchema),
  TechnicianController.getById
);

router.put('/:id',
  authorize('ADMIN'),
  validateParams(TechnicianIdSchema),
  validateBody(UpdateTechnicianSchema),
  TechnicianController.update
);

router.delete('/:id',
  authorize('ADMIN'),
  validateParams(TechnicianIdSchema),
  TechnicianController.delete
);

// Rutas especiales para gestión de técnicos
router.get('/:id/stats',
  authorize('ADMIN'),
  validateParams(TechnicianIdSchema),
  TechnicianController.getStats
);

router.patch('/:id/availability',
  authorize('ADMIN'),
  validateParams(TechnicianIdSchema),
  validateBody(UpdateTechnicianAvailabilitySchema),
  TechnicianController.updateAvailability
);

export default router;