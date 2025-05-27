import { UserRole } from '@prisma/client';
export interface JWTPayload {
    userId: string;
    username: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (payload: Omit<JWTPayload, "iat" | "exp">) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const extractTokenFromHeader: (authHeader: string | undefined) => string | null;
export declare const generateSecureSecret: (length?: number) => string;
//# sourceMappingURL=auth.d.ts.map