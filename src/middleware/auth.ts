import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/auth';

// Extended Request interface with user data
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token and adds user data to request
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔥 AUTH MIDDLEWARE - Authorization header:', authHeader?.substring(0, 30) + '...');
    
    const token = extractTokenFromHeader(authHeader);
    console.log('🔥 AUTH MIDDLEWARE - Token extracted:', !!token);
    console.log('🔥 AUTH MIDDLEWARE - Token preview:', token?.substring(0, 20) + '...');

    if (!token) {
      console.log('🔥 AUTH MIDDLEWARE - No token found');
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // Verify and decode token
    const decoded = verifyToken(token);
    console.log('🔥 AUTH MIDDLEWARE - Token decoded successfully:', decoded);
    console.log('🔥 AUTH MIDDLEWARE - User ID from token:', decoded.userId || (decoded as any).id);
    console.log('🔥 AUTH MIDDLEWARE - User role from token:', decoded.role);
    
    // Add user data to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('🔥 AUTH MIDDLEWARE - Authentication error:', error);
    
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Token inválido o expirado',
      error: 'AUTHENTICATION_FAILED'
    });
  }
};

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has required roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Autenticación requerida',
          error: 'NOT_AUTHENTICATED'
        });
        return;
      }

       // --- AÑADE ESTOS CONSOLE.LOGS PARA DEPURAR ---
      console.log('@@@ AUTHORIZE MIDDLEWARE @@@');
      console.log('req.user.role:', req.user.role);
      console.log('typeof req.user.role:', typeof req.user.role);
      console.log('allowedRoles:', allowedRoles);
      console.log('allowedRoles[0]:', allowedRoles[0]);
      console.log('typeof allowedRoles[0]:', typeof allowedRoles[0]);
      console.log('Comparison result (includes):', allowedRoles.includes(req.user.role));
      // --------------------------------------------

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Permisos insuficientes para acceder a este recurso',
          error: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
          userRole: req.user.role
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante la autorización',
        error: 'AUTHORIZATION_ERROR'
      });
    }
  };
};

/**
 * Optional authentication middleware
 * Adds user data to request if token is provided, but doesn't require it
 */
export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = verifyToken(token);
        req.user = decoded;
      } catch (error) {
        // Token is invalid, but we don't throw error for optional auth
        console.warn('Invalid optional token:', error);
      }
    }

    next();
  } catch (error) {
    // For optional auth, we continue even if there's an error
    console.warn('Optional auth error:', error);
    next();
  }
};

/**
 * Role-based access control helpers
 */
export const requireAdmin = authorize(UserRole.ADMIN);
export const requireTechnician = authorize(UserRole.TECHNICIAN, UserRole.ADMIN);
export const requireClient = authorize(UserRole.CLIENT, UserRole.ADMIN);
export const requireAnyRole = authorize(UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.CLIENT);

// Unused parameter in authorize function - fixing
export const simpleAuthorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      _res.status(403).json({
        success: false,
        message: 'Permisos insuficientes',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }
    next();
  };
};