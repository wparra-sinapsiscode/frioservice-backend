import { UserRole, Technician } from '@prisma/client';
export interface CreateTechnicianData {
    userId: string;
    specialty: string;
    experienceYears: number;
    phone?: string;
    rating?: number;
    isAvailable?: boolean;
    averageTime?: string;
}
export interface UpdateTechnicianData {
    specialty?: string;
    experienceYears?: number;
    phone?: string;
    rating?: number;
    isAvailable?: boolean;
    servicesCompleted?: number;
    averageTime?: string;
    user?: {
        username?: string;
        email?: string;
        password?: string;
        isActive?: boolean;
    };
}
export interface TechnicianFilters {
    specialty?: string;
    isAvailable?: boolean;
    minRating?: number;
    search?: string;
}
export interface TechnicianWithRelations extends Technician {
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
    _count: {
        services: number;
    };
}
export interface AdminCreateTechnicianAndUserPayload {
    newUser: {
        username: string;
        email: string;
        password: string;
    };
    technicianProfile: {
        specialty: string;
        experienceYears: number;
        phone?: string;
        rating?: number;
        isAvailable?: boolean;
        averageTime?: string;
        servicesCompleted?: number;
        firstName?: string;
        lastName?: string;
        name?: string;
    };
}
export declare class TechnicianService {
    static adminCreatesTechnicianWithUser(payload: AdminCreateTechnicianAndUserPayload): Promise<TechnicianWithRelations>;
    static createTechnician(data: CreateTechnicianData): Promise<Technician>;
    static getTechnicians(filters?: TechnicianFilters, page?: number, limit?: number): Promise<{
        technicians: TechnicianWithRelations[];
        totalTechnicians: number;
        totalPages: number;
        currentPage: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    static getTechnicianById(id: string): Promise<TechnicianWithRelations | null>;
    static getTechnicianByUserId(userId: string): Promise<TechnicianWithRelations | null>;
    static updateTechnician(technicianId: string, dataFromController: UpdateTechnicianData): Promise<TechnicianWithRelations | null>;
    static deleteTechnician(id: string): Promise<boolean>;
    static getTechnicianStats(technicianId: string): Promise<{
        servicesCompleted: number;
        rating: number;
        averageTime: string | null;
        memberSince: Date;
        servicesByStatus: Record<string, number>;
    }>;
    static updateServiceCount(technicianId: string): Promise<void>;
    static updateTechnicianRating(technicianId: string, newRating: number): Promise<void>;
    static getAvailableTechnicians(date: Date, specialty?: string): Promise<TechnicianWithRelations[]>;
    static getTechniciansPublicInfo(filters?: any, page?: number, limit?: number): Promise<{
        technicians: {
            id: string;
            name: string | null;
            specialty: string;
            experienceYears: number;
            rating: number;
            isAvailable: boolean;
            servicesCompleted: number;
            firstName: string | null;
            lastName: string | null;
        }[];
        currentPage: number;
        totalPages: number;
        totalTechnicians: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
}
//# sourceMappingURL=technicianService.d.ts.map