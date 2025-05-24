import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error al hashear la contraseña');
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns Boolean indicating if passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

/**
 * Generate a JWT token
 * @param payload - JWT payload data
 * @returns JWT token string
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  try {
    const secret = process.env['JWT_SECRET'];

    if (!secret) {
      throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }

    // Objeto simple sin tipos complejos
    const tokenPayload = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role.toString()
    };

    // Usar sintaxis más explícita
    const token = jwt.sign(
      tokenPayload,
      secret as string,
      { expiresIn: "30m" } // 30 minutos
    );

    return token;
  } catch (error) {
    console.error("Error al generar el token:", error);
    throw new Error('Error al generar el token JWT');
  }
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded JWT payload
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const secret = process.env['JWT_SECRET'];

    if (!secret) {
      throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token JWT inválido');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token JWT expirado');
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token JWT no válido aún');
    }
    throw new Error('Error al verificar el token JWT');
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove "Bearer " prefix
};

/**
 * Generate a secure random string for JWT secret
 * @param length - Length of the random string
 * @returns Random string
 */
export const generateSecureSecret = (length: number = 64): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};