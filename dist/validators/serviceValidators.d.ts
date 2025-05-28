import { z } from 'zod';
export declare const ServiceTypeSchema: z.ZodEnum<["MAINTENANCE", "REPAIR", "INSTALLATION", "INSPECTION", "EMERGENCY", "CLEANING", "CONSULTATION"]>;
export declare const ServicePrioritySchema: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>;
export declare const ServiceStatusSchema: z.ZodEnum<["PENDING", "CONFIRMED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]>;
export declare const CreateServiceSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    clientId: z.ZodString;
    technicianId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["MAINTENANCE", "REPAIR", "INSTALLATION", "INSPECTION", "EMERGENCY", "CLEANING", "CONSULTATION"]>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    scheduledDate: z.ZodEffects<z.ZodString, Date, string>;
    estimatedDuration: z.ZodOptional<z.ZodNumber>;
    equipmentIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    address: z.ZodString;
    contactPhone: z.ZodString;
    emergencyContact: z.ZodOptional<z.ZodString>;
    accessInstructions: z.ZodOptional<z.ZodString>;
    clientNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    address: string;
    title: string;
    clientId: string;
    type: "MAINTENANCE" | "REPAIR" | "INSTALLATION" | "INSPECTION" | "EMERGENCY" | "CLEANING" | "CONSULTATION";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    scheduledDate: Date;
    equipmentIds: string[];
    contactPhone: string;
    emergencyContact?: string | undefined;
    description?: string | undefined;
    technicianId?: string | undefined;
    estimatedDuration?: number | undefined;
    accessInstructions?: string | undefined;
    clientNotes?: string | undefined;
}, {
    address: string;
    title: string;
    clientId: string;
    type: "MAINTENANCE" | "REPAIR" | "INSTALLATION" | "INSPECTION" | "EMERGENCY" | "CLEANING" | "CONSULTATION";
    scheduledDate: string;
    contactPhone: string;
    emergencyContact?: string | undefined;
    description?: string | undefined;
    technicianId?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    estimatedDuration?: number | undefined;
    equipmentIds?: string[] | undefined;
    accessInstructions?: string | undefined;
    clientNotes?: string | undefined;
}>;
export declare const CreateServiceClientSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    technicianId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["MAINTENANCE", "REPAIR", "INSTALLATION", "INSPECTION", "EMERGENCY", "CLEANING", "CONSULTATION"]>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    scheduledDate: z.ZodEffects<z.ZodString, Date, string>;
    estimatedDuration: z.ZodOptional<z.ZodNumber>;
    equipmentIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    address: z.ZodString;
    contactPhone: z.ZodString;
    emergencyContact: z.ZodOptional<z.ZodString>;
    accessInstructions: z.ZodOptional<z.ZodString>;
    clientNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    address: string;
    title: string;
    type: "MAINTENANCE" | "REPAIR" | "INSTALLATION" | "INSPECTION" | "EMERGENCY" | "CLEANING" | "CONSULTATION";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    scheduledDate: Date;
    equipmentIds: string[];
    contactPhone: string;
    emergencyContact?: string | undefined;
    description?: string | undefined;
    clientId?: string | undefined;
    technicianId?: string | undefined;
    estimatedDuration?: number | undefined;
    accessInstructions?: string | undefined;
    clientNotes?: string | undefined;
}, {
    address: string;
    title: string;
    type: "MAINTENANCE" | "REPAIR" | "INSTALLATION" | "INSPECTION" | "EMERGENCY" | "CLEANING" | "CONSULTATION";
    scheduledDate: string;
    contactPhone: string;
    emergencyContact?: string | undefined;
    description?: string | undefined;
    clientId?: string | undefined;
    technicianId?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    estimatedDuration?: number | undefined;
    equipmentIds?: string[] | undefined;
    accessInstructions?: string | undefined;
    clientNotes?: string | undefined;
}>;
export declare const UpdateServiceSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    technicianId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]>>;
    type: z.ZodOptional<z.ZodEnum<["MAINTENANCE", "REPAIR", "INSTALLATION", "INSPECTION", "EMERGENCY", "CLEANING", "CONSULTATION"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    scheduledDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    estimatedDuration: z.ZodOptional<z.ZodNumber>;
    equipmentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    address: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
    emergencyContact: z.ZodOptional<z.ZodString>;
    accessInstructions: z.ZodOptional<z.ZodString>;
    clientNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    emergencyContact?: string | undefined;
    address?: string | undefined;
    status?: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ON_HOLD" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    technicianId?: string | undefined;
    type?: "MAINTENANCE" | "REPAIR" | "INSTALLATION" | "INSPECTION" | "EMERGENCY" | "CLEANING" | "CONSULTATION" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    scheduledDate?: Date | undefined;
    estimatedDuration?: number | undefined;
    equipmentIds?: string[] | undefined;
    contactPhone?: string | undefined;
    accessInstructions?: string | undefined;
    clientNotes?: string | undefined;
}, {
    emergencyContact?: string | undefined;
    address?: string | undefined;
    status?: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ON_HOLD" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    technicianId?: string | undefined;
    type?: "MAINTENANCE" | "REPAIR" | "INSTALLATION" | "INSPECTION" | "EMERGENCY" | "CLEANING" | "CONSULTATION" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    scheduledDate?: string | undefined;
    estimatedDuration?: number | undefined;
    equipmentIds?: string[] | undefined;
    contactPhone?: string | undefined;
    accessInstructions?: string | undefined;
    clientNotes?: string | undefined;
}>;
export declare const AssignTechnicianSchema: z.ZodObject<{
    technicianId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    technicianId: string;
}, {
    technicianId: string;
}>;
export declare const CompleteServiceSchema: z.ZodObject<{
    workPerformed: z.ZodString;
    timeSpent: z.ZodNumber;
    materialsUsed: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        cost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        quantity: number;
        unit: string;
        cost?: number | undefined;
    }, {
        name: string;
        quantity: number;
        unit: string;
        cost?: number | undefined;
    }>, "many">>>;
    technicianNotes: z.ZodOptional<z.ZodString>;
    clientSignature: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean, z.ZodLiteral<"confirmed">]>>;
    images: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    workPerformed: string;
    timeSpent: number;
    materialsUsed?: {
        name: string;
        quantity: number;
        unit: string;
        cost?: number | undefined;
    }[] | undefined;
    technicianNotes?: string | undefined;
    clientSignature?: string | boolean | undefined;
    images?: string[] | undefined;
}, {
    workPerformed: string;
    timeSpent: number;
    materialsUsed?: {
        name: string;
        quantity: number;
        unit: string;
        cost?: number | undefined;
    }[] | undefined;
    technicianNotes?: string | undefined;
    clientSignature?: string | boolean | undefined;
    images?: string[] | undefined;
}>;
export declare const ServiceFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]>>;
    type: z.ZodOptional<z.ZodEnum<["MAINTENANCE", "REPAIR", "INSTALLATION", "INSPECTION", "EMERGENCY", "CLEANING", "CONSULTATION"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    clientId: z.ZodOptional<z.ZodString>;
    technicianId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    endDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    page: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ON_HOLD" | undefined;
    clientId?: string | undefined;
    technicianId?: string | undefined;
    type?: "MAINTENANCE" | "REPAIR" | "INSTALLATION" | "INSPECTION" | "EMERGENCY" | "CLEANING" | "CONSULTATION" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
}, {
    status?: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ON_HOLD" | undefined;
    clientId?: string | undefined;
    technicianId?: string | undefined;
    type?: "MAINTENANCE" | "REPAIR" | "INSTALLATION" | "INSPECTION" | "EMERGENCY" | "CLEANING" | "CONSULTATION" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    limit?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    page?: string | undefined;
}>;
export declare const ServiceIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const ClientIdSchema: z.ZodObject<{
    clientId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    clientId: string;
}, {
    clientId: string;
}>;
export declare const TechnicianIdSchema: z.ZodObject<{
    technicianId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    technicianId: string;
}, {
    technicianId: string;
}>;
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;
export type AssignTechnicianInput = z.infer<typeof AssignTechnicianSchema>;
export type CompleteServiceInput = z.infer<typeof CompleteServiceSchema>;
export type ServiceFiltersInput = z.infer<typeof ServiceFiltersSchema>;
//# sourceMappingURL=serviceValidators.d.ts.map