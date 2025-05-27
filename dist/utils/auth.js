"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureSecret = exports.extractTokenFromHeader = exports.verifyToken = exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hashPassword = async (password) => {
    try {
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        return hashedPassword;
    }
    catch (error) {
        throw new Error('Error al hashear la contraseña');
    }
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    try {
        const isValid = await bcryptjs_1.default.compare(password, hashedPassword);
        return isValid;
    }
    catch (error) {
        throw new Error('Error al comparar contraseñas');
    }
};
exports.comparePassword = comparePassword;
const generateToken = (payload) => {
    try {
        const secret = process.env['JWT_SECRET'];
        if (!secret) {
            throw new Error('JWT_SECRET no está configurado en las variables de entorno');
        }
        const tokenPayload = {
            userId: payload.userId,
            username: payload.username,
            role: payload.role.toString()
        };
        const token = jsonwebtoken_1.default.sign(tokenPayload, secret, { expiresIn: "30m" });
        return token;
    }
    catch (error) {
        console.error("Error al generar el token:", error);
        throw new Error('Error al generar el token JWT');
    }
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const secret = process.env['JWT_SECRET'];
        if (!secret) {
            throw new Error('JWT_SECRET no está configurado en las variables de entorno');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Token JWT inválido');
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token JWT expirado');
        }
        if (error instanceof jsonwebtoken_1.default.NotBeforeError) {
            throw new Error('Token JWT no válido aún');
        }
        throw new Error('Error al verificar el token JWT');
    }
};
exports.verifyToken = verifyToken;
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) {
        return null;
    }
    if (!authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};
exports.extractTokenFromHeader = extractTokenFromHeader;
const generateSecureSecret = (length = 64) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateSecureSecret = generateSecureSecret;
//# sourceMappingURL=auth.js.map