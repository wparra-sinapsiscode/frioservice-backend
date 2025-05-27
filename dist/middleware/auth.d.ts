import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { JWTPayload } from '../utils/auth';
export interface AuthRequest extends Request {
    user?: JWTPayload;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authorize: (...allowedRoles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireTechnician: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireClient: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAnyRole: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const simpleAuthorize: (...allowedRoles: UserRole[]) => (req: AuthRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map