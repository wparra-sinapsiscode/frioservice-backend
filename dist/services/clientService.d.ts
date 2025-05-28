import { ClientType, ClientStatus, Client, UserRole } from '@prisma/client';
export interface CreateClientData {
    userId: string;
    companyName?: string;
    contactPerson?: string;
    businessRegistration?: string;
    phone?: string;
    email?: string;
    emergencyContact?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    clientType: ClientType;
    preferredSchedule?: string;
    notes?: string;
    isVip?: boolean;
    discount?: number;
    name?: string;
    ruc?: string;
    dni?: string;
    sector?: string;
    lastName?: string;
}
export interface UpdateClientData {
    companyName?: string;
    contactPerson?: string;
    businessRegistration?: string;
    phone?: string;
    email?: string;
    emergencyContact?: string;
    address?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    clientType?: ClientType;
    status?: ClientStatus;
    preferredSchedule?: string;
    nextServiceDate?: Date;
    notes?: string;
    isVip?: boolean;
    discount?: number;
    name?: string;
    sector?: string;
    ruc?: string;
    dni?: string;
    firstName?: string;
    lastName?: string;
    user?: {
        username?: string;
        email?: string;
        password?: string;
        isActive?: boolean;
    };
}
export interface ClientFilters {
    status?: ClientStatus;
    clientType?: ClientType;
    city?: string;
    isVip?: boolean;
    search?: string;
}
export interface ClientWithRelations extends Client {
    user: {
        id: string;
        username: string;
        email: string;
        isActive: boolean;
        role: UserRole;
    };
    services: Array<{
        id: string;
        title: string;
        status: string;
        scheduledDate: Date;
        type: string;
    }>;
    equipment: Array<{
        id: string;
        name: string;
        type: string;
        status: string;
    }>;
    _count: {
        services: number;
        equipment: number;
        quotes: number;
    };
}
export interface AdminCreateClientAndUserPayload {
    newUser: {
        username: string;
        email: string;
        password?: string;
    };
    clientProfile: {
        clientType: ClientType;
        companyName?: string;
        firstName?: string;
        lastName?: string;
        name?: string;
        ruc?: string;
        dni?: string;
        phone?: string;
        address?: string;
        city?: string;
        district?: string;
        sector?: string;
        email?: string;
        contactPerson?: string;
        businessRegistration?: string;
        emergencyContact?: string;
        postalCode?: string;
        preferredSchedule?: string;
        notes?: string;
        isVip?: boolean;
        discount?: number;
    };
}
export declare class ClientService {
    static adminCreatesClientWithUser(payload: AdminCreateClientAndUserPayload): Promise<ClientWithRelations>;
    static createClient(data: CreateClientData): Promise<Client>;
    static getClients(filters?: ClientFilters, page?: number, limit?: number): Promise<{
        clients: ClientWithRelations[];
        totalClients: number;
        totalPages: number;
        currentPage: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    static getClientById(id: string): Promise<ClientWithRelations | null>;
    static getClientByUserId(userId: string): Promise<ClientWithRelations | null>;
    static updateClient(clientId: string, dataFromController: UpdateClientData): Promise<ClientWithRelations | null>;
    static deleteClient(id: string): Promise<boolean>;
    static getClientStats(clientId: string): Promise<{
        totalServices: number;
        equipmentCount: number;
        nextServiceDate: Date | null;
        memberSince: Date;
        servicesByStatus: Record<string, number>;
        quotesByStatus: Record<string, number>;
    }>;
    static updateServiceCount(clientId: string): Promise<void>;
    static updateNextServiceDate(clientId: string): Promise<void>;
    static getQuoteOptions(clientId: string): Promise<{
        assignedTechnicians: any[];
        servicesByTechnician: {
            [key: string]: any[];
        };
    }>;
}
//# sourceMappingURL=clientService.d.ts.map