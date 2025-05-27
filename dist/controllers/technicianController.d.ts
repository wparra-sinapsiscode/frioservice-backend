import { Request, Response } from "express";
export declare class TechnicianController {
    static create(req: Request, res: Response): Promise<void>;
    static getAll(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static getByUserId(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
    static updateAvailability(req: Request, res: Response): Promise<void>;
    static search(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=technicianController.d.ts.map