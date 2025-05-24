import { Router } from 'express';
import { QuoteController } from '../controllers/quoteController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateQuoteSchema,
  UpdateQuoteSchema,
  QuoteFiltersSchema,
  QuoteIdSchema,
  ClientIdSchema,
  PaginationSchema,
  QuoteActionSchema
} from '../validators/quoteValidators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas principales de cotizaciones
router.post('/', 
  authorize('ADMIN', 'TECHNICIAN'), 
  validateBody(CreateQuoteSchema),
  QuoteController.create
);

router.get('/', 
  authorize('ADMIN', 'TECHNICIAN'), 
  validateQuery(QuoteFiltersSchema),
  QuoteController.getAll
);

router.get('/expired', 
  authorize('ADMIN'), 
  validateQuery(PaginationSchema),
  QuoteController.getExpired
);

router.get('/:id', 
  authorize('ADMIN', 'TECHNICIAN', 'CLIENT'), 
  validateParams(QuoteIdSchema),
  QuoteController.getById
);

router.put('/:id', 
  authorize('ADMIN', 'TECHNICIAN'), 
  validateParams(QuoteIdSchema),
  validateBody(UpdateQuoteSchema),
  QuoteController.update
);

router.delete('/:id', 
  authorize('ADMIN'), 
  validateParams(QuoteIdSchema),
  QuoteController.delete
);

// Rutas específicas para acciones
router.post('/:id/approve', 
  authorize('ADMIN', 'CLIENT'), 
  validateParams(QuoteIdSchema),
  validateBody(QuoteActionSchema),
  QuoteController.approve
);

router.post('/:id/reject', 
  authorize('ADMIN', 'CLIENT'), 
  validateParams(QuoteIdSchema),
  validateBody(QuoteActionSchema),
  QuoteController.reject
);

// Rutas por cliente
router.get('/client/:clientId', 
  authorize('ADMIN', 'CLIENT'), 
  validateParams(ClientIdSchema),
  validateQuery(QuoteFiltersSchema),
  QuoteController.getByClient
);

export default router;