"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    static async register(req, res) {
        try {
            const registerData = req.body;
            if (!registerData.username || !registerData.email || !registerData.password || !registerData.role) {
                res.status(400).json({
                    success: false,
                    message: 'Username, email, password y role son requeridos'
                });
                return;
            }
            const result = await authService_1.AuthService.register(registerData);
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: result
            });
        }
        catch (error) {
            console.error('Error en AuthController.register:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error en registro';
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: 'REGISTRATION_FAILED'
            });
        }
    }
    static async login(req, res) {
        try {
            console.log('🔥 AuthController.login - Iniciando proceso de login');
            console.log('🔥 AuthController.login - Request body:', req.body);
            const loginData = req.body;
            if (!loginData.username || !loginData.password) {
                console.log('🔥 AuthController.login - Datos faltantes:', { username: !!loginData.username, password: !!loginData.password });
                res.status(400).json({
                    success: false,
                    message: 'Username y password son requeridos'
                });
                return;
            }
            console.log('🔥 AuthController.login - Llamando a AuthService.login con:', { username: loginData.username });
            const result = await authService_1.AuthService.login(loginData);
            console.log('🔥 AuthController.login - AuthService.login exitoso, usuario:', result.user.username, 'rol:', result.user.role);
            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: result
            });
        }
        catch (error) {
            console.error('🔥 AuthController.login - Error:', error);
            console.error('🔥 AuthController.login - Error message:', error instanceof Error ? error.message : 'Unknown error');
            console.error('🔥 AuthController.login - Error stack:', error instanceof Error ? error.stack : 'No stack');
            const errorMessage = error instanceof Error ? error.message : 'Error en login';
            res.status(401).json({
                success: false,
                message: errorMessage,
                error: 'LOGIN_FAILED'
            });
        }
    }
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const result = await authService_1.AuthService.getProfile(req.user.userId);
            res.status(200).json({
                success: true,
                message: 'Perfil obtenido exitosamente',
                data: result
            });
        }
        catch (error) {
            console.error('Error en AuthController.getProfile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener perfil';
            res.status(404).json({
                success: false,
                message: errorMessage,
                error: 'PROFILE_NOT_FOUND'
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const updateData = req.body;
            const result = await authService_1.AuthService.updateProfile(req.user.userId, updateData);
            res.status(200).json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: result
            });
        }
        catch (error) {
            console.error('Error en AuthController.updateProfile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar perfil';
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: 'PROFILE_UPDATE_FAILED'
            });
        }
    }
    static async changePassword(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Contraseña actual y nueva contraseña son requeridas'
                });
                return;
            }
            const result = await authService_1.AuthService.changePassword(req.user.userId, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            console.error('Error en AuthController.changePassword:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña';
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: 'PASSWORD_CHANGE_FAILED'
            });
        }
    }
    static async logout(_req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'Logout exitoso',
                data: {
                    note: 'Para completar el logout, elimine el token del almacenamiento local del cliente'
                }
            });
        }
        catch (error) {
            console.error('Error en AuthController.logout:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor durante logout',
                error: 'LOGOUT_FAILED'
            });
        }
    }
    static async verifyToken(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Token válido',
                data: {
                    userId: req.user.userId,
                    username: req.user.username,
                    role: req.user.role,
                    iat: req.user.iat,
                    exp: req.user.exp
                }
            });
        }
        catch (error) {
            console.error('Error en AuthController.verifyToken:', error);
            res.status(401).json({
                success: false,
                message: 'Error al verificar token',
                error: 'TOKEN_VERIFICATION_FAILED'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map