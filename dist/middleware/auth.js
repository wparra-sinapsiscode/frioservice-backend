"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleAuthorize = exports.requireAnyRole = exports.requireClient = exports.requireTechnician = exports.requireAdmin = exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const client_1 = require("@prisma/client");
const auth_1 = require("../utils/auth");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('🔥 AUTH MIDDLEWARE - Authorization header:', authHeader?.substring(0, 30) + '...');
        const token = (0, auth_1.extractTokenFromHeader)(authHeader);
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
        const decoded = (0, auth_1.verifyToken)(token);
        console.log('🔥 AUTH MIDDLEWARE - Token decoded successfully:', decoded);
        console.log('🔥 AUTH MIDDLEWARE - User ID from token:', decoded.userId || decoded.id);
        console.log('🔥 AUTH MIDDLEWARE - User role from token:', decoded.role);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('🔥 AUTH MIDDLEWARE - Authentication error:', error);
        res.status(401).json({
            success: false,
            message: error instanceof Error ? error.message : 'Token inválido o expirado',
            error: 'AUTHENTICATION_FAILED'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Autenticación requerida',
                    error: 'NOT_AUTHENTICATED'
                });
                return;
            }
            console.log('@@@ AUTHORIZE MIDDLEWARE @@@');
            console.log('req.user.role:', req.user.role);
            console.log('typeof req.user.role:', typeof req.user.role);
            console.log('allowedRoles:', allowedRoles);
            console.log('allowedRoles[0]:', allowedRoles[0]);
            console.log('typeof allowedRoles[0]:', typeof allowedRoles[0]);
            console.log('Comparison result (includes):', allowedRoles.includes(req.user.role));
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
        }
        catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor durante la autorización',
                error: 'AUTHORIZATION_ERROR'
            });
        }
    };
};
exports.authorize = authorize;
const optionalAuth = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = (0, auth_1.extractTokenFromHeader)(authHeader);
        if (token) {
            try {
                const decoded = (0, auth_1.verifyToken)(token);
                req.user = decoded;
            }
            catch (error) {
                console.warn('Invalid optional token:', error);
            }
        }
        next();
    }
    catch (error) {
        console.warn('Optional auth error:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
exports.requireAdmin = (0, exports.authorize)(client_1.UserRole.ADMIN);
exports.requireTechnician = (0, exports.authorize)(client_1.UserRole.TECHNICIAN, client_1.UserRole.ADMIN);
exports.requireClient = (0, exports.authorize)(client_1.UserRole.CLIENT, client_1.UserRole.ADMIN);
exports.requireAnyRole = (0, exports.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TECHNICIAN, client_1.UserRole.CLIENT);
const simpleAuthorize = (...allowedRoles) => {
    return (req, _res, next) => {
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
exports.simpleAuthorize = simpleAuthorize;
//# sourceMappingURL=auth.js.map