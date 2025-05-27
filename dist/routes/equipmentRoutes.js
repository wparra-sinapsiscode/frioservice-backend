"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const equipmentController_1 = require("../controllers/equipmentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const equipmentValidators_1 = require("../validators/equipmentValidators");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', (0, auth_1.authorize)('ADMIN', 'CLIENT'), (0, validation_1.validateEquipmentCreation)(equipmentValidators_1.CreateEquipmentSchema, equipmentValidators_1.CreateEquipmentClientSchema), equipmentController_1.EquipmentController.create);
router.get('/', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN', 'CLIENT'), (0, validation_1.validateQuery)(equipmentValidators_1.EquipmentFiltersSchema), equipmentController_1.EquipmentController.getAll);
router.get('/:id', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN', 'CLIENT'), (0, validation_1.validateParams)(equipmentValidators_1.EquipmentIdSchema), equipmentController_1.EquipmentController.getById);
router.put('/:id', (0, auth_1.authorize)('ADMIN', 'CLIENT'), (0, validation_1.validateParams)(equipmentValidators_1.EquipmentIdSchema), (0, validation_1.validateBody)(equipmentValidators_1.UpdateEquipmentSchema), equipmentController_1.EquipmentController.update);
router.delete('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(equipmentValidators_1.EquipmentIdSchema), equipmentController_1.EquipmentController.delete);
router.get('/client/:clientId', (0, auth_1.authorize)('ADMIN', 'CLIENT'), (0, validation_1.validateParams)(equipmentValidators_1.ClientIdSchema), (0, validation_1.validateQuery)(equipmentValidators_1.EquipmentFiltersSchema), equipmentController_1.EquipmentController.getByClient);
router.patch('/:id/status', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN', 'CLIENT'), (0, validation_1.validateParams)(equipmentValidators_1.EquipmentIdSchema), (0, validation_1.validateBody)(equipmentValidators_1.EquipmentStatusSchema), equipmentController_1.EquipmentController.updateStatus);
exports.default = router;
//# sourceMappingURL=equipmentRoutes.js.map