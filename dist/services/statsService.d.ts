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
            breakdown: {
                quotes: number;
                materials: number;
            };
        };
        completedServicesThisMonth: {
            current: number;
            previous: number;
            growth: number;
        };
        pendingQuotes: number;
        lastUpdated: string;
    }>;
    static getRecentTransactions(limit?: number): Promise<({
        service: {
            client: {
                companyName: string | null;
                contactPerson: string | null;
            };
            technician: {
                firstName: string | null;
                lastName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            emergencyContact: string | null;
            address: string;
            status: import(".prisma/client").$Enums.ServiceStatus;
            title: string;
            description: string | null;
            clientId: string;
            technicianId: string | null;
            type: import(".prisma/client").$Enums.ServiceType;
            priority: import(".prisma/client").$Enums.ServicePriority;
            scheduledDate: Date;
            estimatedDuration: number | null;
            actualDuration: number | null;
            equipmentIds: string[];
            contactPhone: string;
            accessInstructions: string | null;
            clientNotes: string | null;
            workPerformed: string | null;
            timeSpent: number | null;
            materialsUsed: import("@prisma/client/runtime/library").JsonValue | null;
            technicianNotes: string | null;
            clientSignature: string | null;
            images: string[];
            clientRating: number | null;
            clientComment: string | null;
            ratedAt: Date | null;
            completedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        serviceId: string;
        amount: number;
    })[]>;
    static getServicesByEquipment(): Promise<{
        equipmentStats: {
            equipmentId: string;
            equipment: {
                name: string;
                type: string;
                brand: string | null;
                status: import(".prisma/client").$Enums.EquipmentStatus;
                client: string;
            } | null;
            totalServices: number;
            completedServices: number;
            pendingServices: number;
            lastServiceDate: number | null;
        }[];
        servicesByEquipmentType: any[];
        totalEquipmentsWithServices: number;
        totalServices: number;
    }>;
    static getTechnicianEfficiency(technicianId?: string): Promise<{
        technicians: {
            name: string;
            specialty: string;
            servicesCompleted: number;
            averageTime: string;
            rating: number;
        }[];
        total: number;
    }>;
    static getClientRankings(): Promise<{
        topByServices: ({
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        } | {
            totalServices: any;
            metric: any;
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        } | {
            totalIncome: number;
            totalQuotes: any;
            metric: number;
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        } | {
            recentServices: any;
            metric: any;
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        })[];
        topByIncome: ({
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        } | {
            totalServices: any;
            metric: any;
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        } | {
            totalIncome: number;
            totalQuotes: any;
            metric: number;
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        } | {
            recentServices: any;
            metric: any;
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        })[];
        mostActiveClients: ({
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        } | {
            totalServices: any;
            metric: any;
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        } | {
            totalIncome: number;
            totalQuotes: any;
            metric: number;
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        } | {
            recentServices: any;
            metric: any;
            rank: number;
            clientId: any;
            clientName: any;
            clientType: any;
            sector: any;
            isVip: any;
        })[];
        summary: {
            totalActiveClients: number;
            vipClients: number;
            averageServicesPerClient: number;
        };
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
    static getIncomeStats(period?: 'day' | 'month' | 'quarter' | 'year'): Promise<{
        currentPeriod: {
            income: number;
            transactions: number;
            period: "year" | "day" | "month" | "quarter";
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
        incomeByDay: {
            day: any;
            income: any;
            label: string;
        }[];
        incomeByYear: {
            year: any;
            income: any;
            label: any;
        }[];
    }>;
    static getTechnicianRankings(): Promise<{
        topTechnicians: {
            rank: number;
            name: string;
            servicesCompleted: number;
            averageTime: string;
            rating: number;
            specialty: string;
        }[];
        total: number;
    }>;
    private static processMonthlyData;
    private static processMonthlyIncomeData;
    private static processDailyIncomeData;
    private static processYearlyIncomeData;
    private static getServiceTypeLabel;
    private static getServiceStatusLabel;
    private static getMonthLabel;
    private static getDayLabel;
    private static getDaysInPeriod;
}
//# sourceMappingURL=statsService.d.ts.map