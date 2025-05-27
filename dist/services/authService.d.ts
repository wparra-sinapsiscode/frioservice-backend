import { UserRole, ClientType } from '@prisma/client';
export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    additionalData?: {
        companyName?: string;
        contactPerson?: string;
        address?: string;
        city?: string;
        clientType?: ClientType;
        specialty?: string;
        experienceYears?: number;
        rating?: number;
        phone?: string;
    };
}
export interface LoginData {
    username: string;
    password: string;
}
export interface AuthResponse {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
        role: UserRole;
        profile?: any;
    };
}
export declare class AuthService {
    static register(data: RegisterData): Promise<AuthResponse>;
    static login(data: LoginData): Promise<AuthResponse>;
    static getProfile(userId: string): Promise<{
        id: string;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: true;
        createdAt: Date;
        profile: {
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
        } | {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            phone: string | null;
            specialty: string;
            experienceYears: number;
            rating: number;
            isAvailable: boolean;
            servicesCompleted: number;
            averageTime: string | null;
            firstName: string | null;
            lastName: string | null;
        } | null;
    }>;
    static updateProfile(userId: string, updateData: any): Promise<{
        id: string;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: true;
        createdAt: Date;
        profile: {
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
        } | {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            phone: string | null;
            specialty: string;
            experienceYears: number;
            rating: number;
            isAvailable: boolean;
            servicesCompleted: number;
            averageTime: string | null;
            firstName: string | null;
            lastName: string | null;
        } | null;
    }>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=authService.d.ts.map