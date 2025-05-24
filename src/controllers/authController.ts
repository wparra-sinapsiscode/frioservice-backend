import { Request, Response } from 'express';
import { AuthService, RegisterData, LoginData } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  /**
   * Registrar nuevo usuario
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const registerData: RegisterData = req.body;

      // Validar datos requeridos
      if (!registerData.username || !registerData.email || !registerData.password || !registerData.role) {
        res.status(400).json({
          success: false,
          message: 'Username, email, password y role son requeridos'
        });
        return;
      }

      const result = await AuthService.register(registerData);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error en AuthController.register:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error en registro';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'REGISTRATION_FAILED'
      });
    }
  }

  /**
   * Iniciar sesión
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginData = req.body;

      // Validar datos requeridos
      if (!loginData.username || !loginData.password) {
        res.status(400).json({
          success: false,
          message: 'Username y password son requeridos'
        });
        return;
      }

      const result = await AuthService.login(loginData);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });

    } catch (error) {
      console.error('Error en AuthController.login:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error en login';
      
      res.status(401).json({
        success: false,
        message: errorMessage,
        error: 'LOGIN_FAILED'
      });
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/auth/profile
   */
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const result = await AuthService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error en AuthController.getProfile:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener perfil';
      
      res.status(404).json({
        success: false,
        message: errorMessage,
        error: 'PROFILE_NOT_FOUND'
      });
    }
  }

  /**
   * Actualizar perfil del usuario autenticado
   * PUT /api/auth/profile
   */
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const updateData = req.body;
      const result = await AuthService.updateProfile(req.user.userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error en AuthController.updateProfile:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar perfil';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'PROFILE_UPDATE_FAILED'
      });
    }
  }

  /**
   * Cambiar contraseña del usuario autenticado
   * POST /api/auth/change-password
   */
  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
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

      const result = await AuthService.changePassword(req.user.userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Error en AuthController.changePassword:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'PASSWORD_CHANGE_FAILED'
      });
    }
  }

  /**
   * Cerrar sesión
   * POST /api/auth/logout
   */
  static async logout(_req: AuthRequest, res: Response): Promise<void> {
    try {
      // En JWT, el logout es principalmente del lado del cliente
      // Aquí se podría implementar una blacklist de tokens si es necesario
      
      res.status(200).json({
        success: true,
        message: 'Logout exitoso',
        data: {
          note: 'Para completar el logout, elimine el token del almacenamiento local del cliente'
        }
      });

    } catch (error) {
      console.error('Error en AuthController.logout:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante logout',
        error: 'LOGOUT_FAILED'
      });
    }
  }

  /**
   * Verificar token (útil para el frontend)
   * GET /api/auth/verify-token
   */
  static async verifyToken(req: AuthRequest, res: Response): Promise<void> {
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

    } catch (error) {
      console.error('Error en AuthController.verifyToken:', error);
      
      res.status(401).json({
        success: false,
        message: 'Error al verificar token',
        error: 'TOKEN_VERIFICATION_FAILED'
      });
    }
  }
}