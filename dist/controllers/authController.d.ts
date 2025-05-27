import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<void>;
    static login(req: Request, res: Response): Promise<void>;
    static getProfile(req: AuthRequest, res: Response): Promise<void>;
    static updateProfile(req: AuthRequest, res: Response): Promise<void>;
    static changePassword(req: AuthRequest, res: Response): Promise<void>;
    static logout(_req: AuthRequest, res: Response): Promise<void>;
    static verifyToken(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map