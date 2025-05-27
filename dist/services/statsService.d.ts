export declare class StatsService {
    static getDashboardStats(): Promise<{
        totalServices: {
            total: number;
            byStatus: {
                pending: number;
                inProgress: number;
                completed: number;
                cancelled: number;
                onHold: number;
                scheduled: number;
            };
        };
        totalClients: number;
        totalTechnicians: number;
        monthlyIncome: {
            current: number;
            previous: number;
            growth: number;
        };
        completedServicesThisMonth: {
            current: number;
            previous: number;
            growth: number;
        };
        pendingQuotes: number;
        lastUpdated: string;
    }>;
    static getServiceStats(filters?: {
        startDate?: Date;
        endDate?: Date;
        technicianId?: string;
        clientId?: string;
    }): Promise<{
        servicesByType: {
            type: import(".prisma/client").$Enums.ServiceType;
            count: number;
            label: string;
        }[];
        servicesByStatus: {
            status: import(".prisma/client").$Enums.ServiceStatus;
            count: number;
            label: string;
        }[];
        servicesByMonth: {
            month: any;
            count: any;
            label: string;
        }[];
        averageCompletionTime: number;
        totalServices: number;
    }>;
    static getIncomeStats(period?: 'month' | 'quarter' | 'year'): Promise<{
        currentPeriod: {
            income: number;
            transactions: number;
            period: "year" | "month" | "quarter";
        };
        previousPeriod: {
            income: number;
            growth: number;
        };
        projection: number;
        incomeByType: {
            type: string;
            income: number;
            transactions: number;
            label: string;
        }[];
        incomeByMonth: {
            month: any;
            income: any;
            label: string;
        }[];
    }>;
    static getTechnicianRankings(): Promise<{
        topByServices: {
            id: string;
            name: string;
            servicesCompleted: number;
            specialty: string;
        }[];
        topByRating: {
            id: string;
            name: string;
            rating: number;
            servicesCompleted: number;
            specialty: string;
        }[];
        topByEfficiency: {
            id: string;
            name: string;
            efficiency: number;
            servicesPerHour: number;
            averageTime: number;
            specialty: string;
        }[];
    }>;
    private static processMonthlyData;
    private static processMonthlyIncomeData;
    private static getServiceTypeLabel;
    private static getServiceStatusLabel;
    private static getMonthLabel;
    private static getDaysInPeriod;
}
//# sourceMappingURL=statsService.d.ts.map