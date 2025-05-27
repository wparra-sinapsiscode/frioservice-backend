import { Request, Response } from 'express';
export declare class ServiceController {
    static create(req: Request, res: Response): Promise<void>;
    static getAll(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static assignTechnician(req: Request, res: Response): Promise<void>;
    static completeService(req: Request, res: Response): Promise<void>;
    static getServicesByClient(req: Request, res: Response): Promise<void>;
    static getServicesByTechnician(req: Request, res: Response): Promise<void>;
    static getTechnicianEvaluations(req: Request, res: Response): Promise<void>;
    static rateService(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=serviceController.d.ts.map