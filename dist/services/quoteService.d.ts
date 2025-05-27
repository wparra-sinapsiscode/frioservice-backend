import { QuoteStatus } from '@prisma/client';
export interface CreateQuoteData {
    serviceId?: string;
    clientId: string;
    title: string;
    description?: string;
    amount: number;
    validUntil: Date;
    notes?: string;
}
export interface UpdateQuoteData {
    title?: string;
    description?: string;
    amount?: number;
    status?: QuoteStatus;
    validUntil?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    notes?: string;
}
export interface QuoteFilters {
    status?: QuoteStatus;
    clientId?: string;
    serviceId?: string;
}
export declare class QuoteService {
    static createQuote(data: CreateQuoteData): Promise<{
        client: {
            user: {
                username: string;
                email: string;
            };
        } & {
            userId: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyName: string | null;
            contactPerson: string | null;
            businessRegistration: string | null;
            phone: string | null;
            emergencyContact: string | null;
            address: string | null;
            city: string | null;
            district: string | null;
            postalCode: string | null;
            clientType: import(".prisma/client").$Enums.ClientType;
            sector: string | null;
            status: import(".prisma/client").$Enums.ClientStatus;
            preferredSchedule: string | null;
            nextServiceDate: Date | null;
            totalServices: number;
            notes: string | null;
            isVip: boolean;
            discount: number | null;
        };
        service: {
            id: string;
            status: import(".prisma/client").$Enums.ServiceStatus;
            title: string;
            description: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        notes: string | null;
        title: string;
        description: string | null;
        clientId: string;
        serviceId: string | null;
        amount: number;
        validUntil: Date;
        approvedAt: Date | null;
        rejectedAt: Date | null;
    }>;
    static getQuotes(filters?: QuoteFilters, page?: number, limit?: number): Promise<{
        quotes: ({
            client: {
                user: {
                    username: string;
                    email: string;
                };
            } & {
                userId: string;
                email: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                companyName: string | null;
                contactPerson: string | null;
                businessRegistration: string | null;
                phone: string | null;
                emergencyContact: string | null;
                address: string | null;
                city: string | null;
                district: string | null;
                postalCode: string | null;
                clientType: import(".prisma/client").$Enums.ClientType;
                sector: string | null;
                status: import(".prisma/client").$Enums.ClientStatus;
                preferredSchedule: string | null;
                nextServiceDate: Date | null;
                totalServices: number;
                notes: string | null;
                isVip: boolean;
                discount: number | null;
            };
            service: {
                id: string;
                status: import(".prisma/client").$Enums.ServiceStatus;
                title: string;
                description: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.QuoteStatus;
            notes: string | null;
            title: string;
            description: string | null;
            clientId: string;
            serviceId: string | null;
            amount: number;
            validUntil: Date;
            approvedAt: Date | null;
            rejectedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static getQuoteById(id: string): Promise<({
        client: {
            user: {
                username: string;
                email: string;
            };
        } & {
            userId: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyName: string | null;
            contactPerson: string | null;
            businessRegistration: string | null;
            phone: string | null;
            emergencyContact: string | null;
            address: string | null;
            city: string | null;
            district: string | null;
            postalCode: string | null;
            clientType: import(".prisma/client").$Enums.ClientType;
            sector: string | null;
            status: import(".prisma/client").$Enums.ClientStatus;
            preferredSchedule: string | null;
            nextServiceDate: Date | null;
            totalServices: number;
            notes: string | null;
            isVip: boolean;
            discount: number | null;
        };
        service: {
            id: string;
            status: import(".prisma/client").$Enums.ServiceStatus;
            title: string;
            description: string | null;
            scheduledDate: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        notes: string | null;
        title: string;
        description: string | null;
        clientId: string;
        serviceId: string | null;
        amount: number;
        validUntil: Date;
        approvedAt: Date | null;
        rejectedAt: Date | null;
    }) | null>;
    static updateQuote(id: string, data: UpdateQuoteData): Promise<({
        client: {
            user: {
                username: string;
                email: string;
            };
        } & {
            userId: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyName: string | null;
            contactPerson: string | null;
            businessRegistration: string | null;
            phone: string | null;
            emergencyContact: string | null;
            address: string | null;
            city: string | null;
            district: string | null;
            postalCode: string | null;
            clientType: import(".prisma/client").$Enums.ClientType;
            sector: string | null;
            status: import(".prisma/client").$Enums.ClientStatus;
            preferredSchedule: string | null;
            nextServiceDate: Date | null;
            totalServices: number;
            notes: string | null;
            isVip: boolean;
            discount: number | null;
        };
        service: {
            id: string;
            status: import(".prisma/client").$Enums.ServiceStatus;
            title: string;
            description: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        notes: string | null;
        title: string;
        description: string | null;
        clientId: string;
        serviceId: string | null;
        amount: number;
        validUntil: Date;
        approvedAt: Date | null;
        rejectedAt: Date | null;
    }) | null>;
    static deleteQuote(id: string): Promise<boolean>;
    static approveQuote(id: string): Promise<({
        client: {
            user: {
                username: string;
                email: string;
            };
        } & {
            userId: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyName: string | null;
            contactPerson: string | null;
            businessRegistration: string | null;
            phone: string | null;
            emergencyContact: string | null;
            address: string | null;
            city: string | null;
            district: string | null;
            postalCode: string | null;
            clientType: import(".prisma/client").$Enums.ClientType;
            sector: string | null;
            status: import(".prisma/client").$Enums.ClientStatus;
            preferredSchedule: string | null;
            nextServiceDate: Date | null;
            totalServices: number;
            notes: string | null;
            isVip: boolean;
            discount: number | null;
        };
        service: {
            id: string;
            status: import(".prisma/client").$Enums.ServiceStatus;
            title: string;
            description: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        notes: string | null;
        title: string;
        description: string | null;
        clientId: string;
        serviceId: string | null;
        amount: number;
        validUntil: Date;
        approvedAt: Date | null;
        rejectedAt: Date | null;
    }) | null>;
    static rejectQuote(id: string): Promise<({
        client: {
            user: {
                username: string;
                email: string;
            };
        } & {
            userId: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyName: string | null;
            contactPerson: string | null;
            businessRegistration: string | null;
            phone: string | null;
            emergencyContact: string | null;
            address: string | null;
            city: string | null;
            district: string | null;
            postalCode: string | null;
            clientType: import(".prisma/client").$Enums.ClientType;
            sector: string | null;
            status: import(".prisma/client").$Enums.ClientStatus;
            preferredSchedule: string | null;
            nextServiceDate: Date | null;
            totalServices: number;
            notes: string | null;
            isVip: boolean;
            discount: number | null;
        };
        service: {
            id: string;
            status: import(".prisma/client").$Enums.ServiceStatus;
            title: string;
            description: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        notes: string | null;
        title: string;
        description: string | null;
        clientId: string;
        serviceId: string | null;
        amount: number;
        validUntil: Date;
        approvedAt: Date | null;
        rejectedAt: Date | null;
    }) | null>;
    static getExpiredQuotes(page?: number, limit?: number): Promise<{
        quotes: ({
            client: {
                user: {
                    username: string;
                    email: string;
                };
            } & {
                userId: string;
                email: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                companyName: string | null;
                contactPerson: string | null;
                businessRegistration: string | null;
                phone: string | null;
                emergencyContact: string | null;
                address: string | null;
                city: string | null;
                district: string | null;
                postalCode: string | null;
                clientType: import(".prisma/client").$Enums.ClientType;
                sector: string | null;
                status: import(".prisma/client").$Enums.ClientStatus;
                preferredSchedule: string | null;
                nextServiceDate: Date | null;
                totalServices: number;
                notes: string | null;
                isVip: boolean;
                discount: number | null;
            };
            service: {
                id: string;
                status: import(".prisma/client").$Enums.ServiceStatus;
                title: string;
                description: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.QuoteStatus;
            notes: string | null;
            title: string;
            description: string | null;
            clientId: string;
            serviceId: string | null;
            amount: number;
            validUntil: Date;
            approvedAt: Date | null;
            rejectedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static getClientByUserId(userId: string): Promise<{
        userId: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyName: string | null;
        contactPerson: string | null;
        businessRegistration: string | null;
        phone: string | null;
        emergencyContact: string | null;
        address: string | null;
        city: string | null;
        district: string | null;
        postalCode: string | null;
        clientType: import(".prisma/client").$Enums.ClientType;
        sector: string | null;
        status: import(".prisma/client").$Enums.ClientStatus;
        preferredSchedule: string | null;
        nextServiceDate: Date | null;
        totalServices: number;
        notes: string | null;
        isVip: boolean;
        discount: number | null;
    } | null>;
}
//# sourceMappingURL=quoteService.d.ts.map