import { Request, Response } from 'express';
export declare class StatsController {
    static getDashboardStats(_req: Request, res: Response): Promise<void>;
    static getServiceStats(req: Request, res: Response): Promise<void>;
    static getIncomeStats(req: Request, res: Response): Promise<void>;
    static getTechnicianRankings(_req: Request, res: Response): Promise<void>;
    static getSystemOverview(_req: Request, res: Response): Promise<void>;
    static getRealtimeMetrics(_req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=statsController.d.ts.map