"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', authController_1.AuthController.register);
router.post('/login', authController_1.AuthController.login);
router.get('/profile', auth_1.authenticate, authController_1.AuthController.getProfile);
router.put('/profile', auth_1.authenticate, authController_1.AuthController.updateProfile);
router.post('/change-password', auth_1.authenticate, authController_1.AuthController.changePassword);
router.post('/logout', auth_1.authenticate, authController_1.AuthController.logout);
router.get('/verify-token', auth_1.authenticate, authController_1.AuthController.verifyToken);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map