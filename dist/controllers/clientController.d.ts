import { Request, Response } from "express";
export declare class ClientController {
    static create(req: Request, res: Response): Promise<void>;
    static getAll(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static getByUserId(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
    static getByType(req: Request, res: Response): Promise<void>;
    static getVipClients(req: Request, res: Response): Promise<void>;
    static updateStatus(req: Request, res: Response): Promise<void>;
    static toggleVip(req: Request, res: Response): Promise<void>;
    static search(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=clientController.d.ts.map