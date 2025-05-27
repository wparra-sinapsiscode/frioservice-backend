import { Request, Response } from 'express';
export declare class QuoteController {
    static create(req: Request, res: Response): Promise<void>;
    static getAll(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static getByClient(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static approve(req: Request, res: Response): Promise<void>;
    static reject(req: Request, res: Response): Promise<void>;
    static getExpired(req: Request, res: Response): Promise<void>;
    static createServiceRequest(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=quoteController.d.ts.map