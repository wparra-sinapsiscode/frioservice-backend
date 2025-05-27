import { ServiceStatus, ServiceType, ServicePriority } from '@prisma/client';
export interface CreateServiceData {
    title: string;
    description?: string;
    clientId: string;
    technicianId?: string;
    type: ServiceType;
    priority?: ServicePriority;
    scheduledDate: Date;
    estimatedDuration?: number;
    equipmentIds?: string[];
    address: string;
    contactPhone: string;
    emergencyContact?: string;
    accessInstructions?: string;
    clientNotes?: string;
}
export interface UpdateServiceData {
    title?: string;
    description?: string;
    technicianId?: string;
    status?: ServiceStatus;
    type?: ServiceType;
    priority?: ServicePriority;
    scheduledDate?: Date;
    completedAt?: Date;
    estimatedDuration?: number;
    actualDuration?: number;
    equipmentIds?: string[];
    address?: string;
    contactPhone?: string;
    emergencyContact?: string;
    accessInstructions?: string;
    clientNotes?: string;
    workPerformed?: string;
    timeSpent?: number;
    materialsUsed?: any;
    technicianNotes?: string;
    clientSignature?: string;
    images?: string[];
    notes?: string;
}
export interface ServiceFilters {
    status?: ServiceStatus;
    type?: ServiceType;
    priority?: ServicePriority;
    clientId?: string;
    technicianId?: string;
    startDate?: Date;
    endDate?: Date;
}
export declare class ServiceService {
    static createService(data: CreateServiceData): Promise<{
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
        technician: ({
            user: {
                username: string;
                email: string;
            };
        } & {
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
        }) | null;
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
    }>;
    static getServices(filters?: ServiceFilters, page?: number, limit?: number): Promise<{
        services: ({
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
            technician: ({
                user: {
                    username: string;
                    email: string;
                };
            } & {
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
            }) | null;
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static getServiceById(id: string): Promise<{
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
        technician: ({
            user: {
                username: string;
                email: string;
            };
        } & {
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
        }) | null;
        quotes: {
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
        }[];
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
    }>;
    static updateService(id: string, data: UpdateServiceData): Promise<{
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
        technician: ({
            user: {
                username: string;
                email: string;
            };
        } & {
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
        }) | null;
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
    }>;
    static deleteService(id: string): Promise<{
        message: string;
    }>;
    static assignTechnician(serviceId: string, technicianId: string): Promise<{
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
        technician: ({
            user: {
                username: string;
                email: string;
            };
        } & {
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
        }) | null;
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
    }>;
    static completeService(serviceId: string, completionData: {
        workPerformed?: string;
        timeSpent?: number;
        materialsUsed?: any;
        technicianNotes?: string;
        clientSignature?: string;
        images?: string[];
    }): Promise<{
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
        technician: ({
            user: {
                username: string;
                email: string;
            };
        } & {
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
        }) | null;
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
    }>;
    static getServicesByClient(clientId: string): Promise<({
        technician: ({
            user: {
                username: string;
                email: string;
            };
        } & {
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
        }) | null;
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
    })[]>;
    static getServicesByTechnician(technicianId: string): Promise<({
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
    })[]>;
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
    static getTechnicianEvaluations(userIdOrTechnicianId: string): Promise<{
        id: string;
        clientName: string;
        date: string;
        rating: number;
        comment: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        equipment: string;
        serviceDate: string;
        title: string;
    }[]>;
    static rateService(serviceId: string, ratingData: {
        rating: number;
        comment?: string | null;
    }): Promise<{
        client: {
            id: string;
            companyName: string | null;
            contactPerson: string | null;
        };
        technician: {
            id: string;
            name: string | null;
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
    }>;
    static updateTechnicianAverageRating(technicianId: string): Promise<void>;
}
//# sourceMappingURL=serviceService.d.ts.map