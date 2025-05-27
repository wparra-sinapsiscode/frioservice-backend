"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientController_1 = require("../controllers/clientController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const clientValidators_1 = require("../validators/clientValidators");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/test-crear', (_req, res) => {
    console.log('@@@ RUTA DE PRUEBA POST /api/clients/test-crear ALCANZADA @@@');
    res.status(200).json({ message: 'Ruta de prueba POST en clientRoutes alcanzada!' });
});
router.post('/', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateBody)(clientValidators_1.CreateClientSchema), clientController_1.ClientController.create);
router.get('/', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(clientValidators_1.ClientFiltersSchema), clientController_1.ClientController.getAll);
router.get('/search', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(clientValidators_1.ClientSearchSchema), clientController_1.ClientController.search);
router.get('/vip', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(clientValidators_1.ClientFiltersSchema), clientController_1.ClientController.getVipClients);
router.get('/type/:clientType', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(clientValidators_1.ClientTypeParamSchema), (0, validation_1.validateQuery)(clientValidators_1.ClientFiltersSchema), clientController_1.ClientController.getByType);
router.get('/profile/:userId', (0, auth_1.authorize)('ADMIN', 'CLIENT'), (0, validation_1.validateParams)(clientValidators_1.UserIdSchema), clientController_1.ClientController.getByUserId);
router.get('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(clientValidators_1.ClientIdSchema), clientController_1.ClientController.getById);
router.put('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(clientValidators_1.ClientIdSchema), (0, validation_1.validateBody)(clientValidators_1.UpdateClientSchema), clientController_1.ClientController.update);
router.delete('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(clientValidators_1.ClientIdSchema), clientController_1.ClientController.delete);
router.get('/:id/stats', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(clientValidators_1.ClientIdSchema), clientController_1.ClientController.getStats);
router.patch('/:id/status', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(clientValidators_1.ClientIdSchema), (0, validation_1.validateBody)(clientValidators_1.UpdateClientStatusSchema), clientController_1.ClientController.updateStatus);
router.patch('/:id/vip', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(clientValidators_1.ClientIdSchema), (0, validation_1.validateBody)(clientValidators_1.ToggleVipSchema), clientController_1.ClientController.toggleVip);
exports.default = router;
//# sourceMappingURL=clientRoutes.js.map