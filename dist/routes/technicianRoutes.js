"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const technicianController_1 = require("../controllers/technicianController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const technicianValidators_1 = require("../validators/technicianValidators");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/test-crear', (_req, res) => {
    console.log('@@@ RUTA DE PRUEBA POST /api/technicians/test-crear ALCANZADA @@@');
    res.status(200).json({ message: 'Ruta de prueba POST en technicianRoutes alcanzada!' });
});
router.post('/', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateBody)(technicianValidators_1.CreateTechnicianSchema), technicianController_1.TechnicianController.create);
router.get('/', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN', 'CLIENT'), (0, validation_1.validateQuery)(technicianValidators_1.TechnicianFiltersSchema), technicianController_1.TechnicianController.getAll);
router.get('/search', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateQuery)(technicianValidators_1.TechnicianSearchSchema), technicianController_1.TechnicianController.search);
router.get('/profile/:userId', (0, auth_1.authorize)('ADMIN', 'TECHNICIAN'), (0, validation_1.validateParams)(technicianValidators_1.UserIdSchema), technicianController_1.TechnicianController.getByUserId);
router.get('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(technicianValidators_1.TechnicianIdSchema), technicianController_1.TechnicianController.getById);
router.put('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(technicianValidators_1.TechnicianIdSchema), (0, validation_1.validateBody)(technicianValidators_1.UpdateTechnicianSchema), technicianController_1.TechnicianController.update);
router.delete('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(technicianValidators_1.TechnicianIdSchema), technicianController_1.TechnicianController.delete);
router.get('/:id/stats', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(technicianValidators_1.TechnicianIdSchema), technicianController_1.TechnicianController.getStats);
router.patch('/:id/availability', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(technicianValidators_1.TechnicianIdSchema), (0, validation_1.validateBody)(technicianValidators_1.UpdateTechnicianAvailabilitySchema), technicianController_1.TechnicianController.updateAvailability);
exports.default = router;
//# sourceMappingURL=technicianRoutes.js.map