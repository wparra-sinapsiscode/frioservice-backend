"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_1 = require("../controllers/serviceController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const serviceValidators_1 = require("../validators/serviceValidators");
const router = (0, express_1.Router)();
router.use((req, _res, next) => {
    try {
        const bodyKeys = req.body && typeof req.body === 'object' ? Object.keys(req.body) : 'no body';
        console.log(`🔥 ServiceRoutes - ${req.method} ${req.path} - Params:`, req.params, '- Body:', bodyKeys);
    }
    catch (error) {
        console.log(`🔥 ServiceRoutes - ${req.method} ${req.path} - Error in logging:`, error);
    }
    next();
});
router.use(auth_1.authenticate);
router.post('/', (0, auth_1.authorize)('ADMIN', 'CLIENT'), (0, validation_1.validateServiceCreation)(serviceValidators_1.CreateServiceSchema, serviceValidators_1.CreateServiceClientSchema), serviceController_1.ServiceController.create);
router.get('/', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN', 'CLIENT'), (0, validation_1.validateQuery)(serviceValidators_1.ServiceFiltersSchema), serviceController_1.ServiceController.getAll);
router.get('/:id', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN', 'CLIENT'), (0, validation_1.validateParams)(serviceValidators_1.ServiceIdSchema), serviceController_1.ServiceController.getById);
router.put('/:id', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN'), (0, validation_1.validateParams)(serviceValidators_1.ServiceIdSchema), (0, validation_1.validateBody)(serviceValidators_1.UpdateServiceSchema), serviceController_1.ServiceController.update);
router.delete('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(serviceValidators_1.ServiceIdSchema), serviceController_1.ServiceController.delete);
router.patch('/:id/assign', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(serviceValidators_1.ServiceIdSchema), (0, validation_1.validateBody)(serviceValidators_1.AssignTechnicianSchema), serviceController_1.ServiceController.assignTechnician);
router.patch('/:id/complete', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN'), (0, validation_1.validateParams)(serviceValidators_1.ServiceIdSchema), (0, validation_1.validateBody)(serviceValidators_1.CompleteServiceSchema), serviceController_1.ServiceController.completeService);
router.post('/:id/complete', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN'), (0, validation_1.validateParams)(serviceValidators_1.ServiceIdSchema), (0, validation_1.validateBody)(serviceValidators_1.CompleteServiceSchema), serviceController_1.ServiceController.completeService);
router.get('/client/:clientId', (0, auth_1.authorize)('ADMIN', 'CLIENT'), (0, validation_1.validateParams)(serviceValidators_1.ClientIdSchema), (0, validation_1.validateQuery)(serviceValidators_1.ServiceFiltersSchema), serviceController_1.ServiceController.getServicesByClient);
router.get('/technician/:technicianId', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN'), (0, validation_1.validateParams)(serviceValidators_1.TechnicianIdSchema), (0, validation_1.validateQuery)(serviceValidators_1.ServiceFiltersSchema), serviceController_1.ServiceController.getServicesByTechnician);
router.get('/technician/:technicianId/evaluations', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN'), (0, validation_1.validateParams)(serviceValidators_1.TechnicianIdSchema), serviceController_1.ServiceController.getTechnicianEvaluations);
router.patch('/:id/rate', (0, auth_1.authorize)('ADMIN', 'CLIENT'), (0, validation_1.validateParams)(serviceValidators_1.ServiceIdSchema), serviceController_1.ServiceController.rateService);
exports.default = router;
//# sourceMappingURL=serviceRoutes.js.map