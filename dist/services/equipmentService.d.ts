import { EquipmentStatus } from '@prisma/client';
export interface CreateEquipmentData {
    clientId: string;
    name: string;
    model?: string;
    brand?: string;
    serialNumber?: string;
    type: string;
    location?: string;
    installDate?: Date;
    warrantyExpiry?: Date;
    status?: EquipmentStatus;
    notes?: string;
}
export interface UpdateEquipmentData {
    name?: string;
    model?: string;
    brand?: string;
    serialNumber?: string;
    type?: string;
    location?: string;
    installDate?: Date;
    warrantyExpiry?: Date;
    status?: EquipmentStatus;
    notes?: string;
}
export interface EquipmentFilters {
    clientId?: string;
    status?: EquipmentStatus;
    type?: string;
    brand?: string;
}
export declare class EquipmentService {
    static createEquipment(data: CreateEquipmentData): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.EquipmentStatus;
        notes: string | null;
        clientId: string;
        type: string;
        model: string | null;
        brand: string | null;
        serialNumber: string | null;
        location: string | null;
        installDate: Date | null;
        warrantyExpiry: Date | null;
    }>;
    static getEquipment(filters?: EquipmentFilters, page?: number, limit?: number): Promise<{
        equipment: ({
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: import(".prisma/client").$Enums.EquipmentStatus;
            notes: string | null;
            clientId: string;
            type: string;
            model: string | null;
            brand: string | null;
            serialNumber: string | null;
            location: string | null;
            installDate: Date | null;
            warrantyExpiry: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static getEquipmentById(id: string): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.EquipmentStatus;
        notes: string | null;
        clientId: string;
        type: string;
        model: string | null;
        brand: string | null;
        serialNumber: string | null;
        location: string | null;
        installDate: Date | null;
        warrantyExpiry: Date | null;
    }) | null>;
    static updateEquipment(id: string, data: UpdateEquipmentData): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.EquipmentStatus;
        notes: string | null;
        clientId: string;
        type: string;
        model: string | null;
        brand: string | null;
        serialNumber: string | null;
        location: string | null;
        installDate: Date | null;
        warrantyExpiry: Date | null;
    }) | null>;
    static deleteEquipment(id: string): Promise<boolean>;
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
//# sourceMappingURL=equipmentService.d.ts.map