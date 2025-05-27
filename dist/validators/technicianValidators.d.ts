import { z } from 'zod';
export declare const CreateTechnicianSchema: z.ZodEffects<z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    email: z.ZodString;
    specialty: z.ZodString;
    experienceYears: z.ZodNumber;
    phone: z.ZodOptional<z.ZodString>;
    isAvailable: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
    averageTime: z.ZodOptional<z.ZodString>;
    servicesCompleted: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    username: string;
    email: string;
    password: string;
    specialty: string;
    experienceYears: number;
    name?: string | undefined;
    phone?: string | undefined;
    rating?: number | undefined;
    isAvailable?: boolean | undefined;
    servicesCompleted?: number | undefined;
    averageTime?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    username: string;
    email: string;
    password: string;
    specialty: string;
    experienceYears: number;
    name?: string | undefined;
    phone?: string | undefined;
    rating?: number | undefined;
    isAvailable?: boolean | undefined;
    servicesCompleted?: number | undefined;
    averageTime?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>, {
    username: string;
    email: string;
    password: string;
    specialty: string;
    experienceYears: number;
    name?: string | undefined;
    phone?: string | undefined;
    rating?: number | undefined;
    isAvailable?: boolean | undefined;
    servicesCompleted?: number | undefined;
    averageTime?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    username: string;
    email: string;
    password: string;
    specialty: string;
    experienceYears: number;
    name?: string | undefined;
    phone?: string | undefined;
    rating?: number | undefined;
    isAvailable?: boolean | undefined;
    servicesCompleted?: number | undefined;
    averageTime?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const UpdateTechnicianSchema: z.ZodObject<{
    specialty: z.ZodOptional<z.ZodString>;
    experienceYears: z.ZodOptional<z.ZodNumber>;
    phone: z.ZodOptional<z.ZodString>;
    isAvailable: z.ZodOptional<z.ZodBoolean>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
    servicesCompleted: z.ZodOptional<z.ZodNumber>;
    averageTime: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | undefined;
    specialty?: string | undefined;
    experienceYears?: number | undefined;
    rating?: number | undefined;
    isAvailable?: boolean | undefined;
    servicesCompleted?: number | undefined;
    averageTime?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
    specialty?: string | undefined;
    experienceYears?: number | undefined;
    rating?: number | undefined;
    isAvailable?: boolean | undefined;
    servicesCompleted?: number | undefined;
    averageTime?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const UpdateTechnicianAvailabilitySchema: z.ZodObject<{
    isAvailable: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isAvailable: boolean;
}, {
    isAvailable: boolean;
}>;
export declare const TechnicianFiltersSchema: z.ZodObject<{
    specialty: z.ZodOptional<z.ZodString>;
    isAvailable: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    experienceYears: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    specialty?: string | undefined;
    experienceYears?: number | undefined;
    isAvailable?: boolean | undefined;
}, {
    search?: string | undefined;
    specialty?: string | undefined;
    experienceYears?: string | undefined;
    isAvailable?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
}>;
export declare const TechnicianSearchSchema: z.ZodObject<{
    q: z.ZodString;
    page: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    q: string;
}, {
    q: string;
    page?: string | undefined;
    limit?: string | undefined;
}>;
export declare const TechnicianIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const UserIdSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export type CreateTechnicianInput = z.infer<typeof CreateTechnicianSchema>;
export type UpdateTechnicianInput = z.infer<typeof UpdateTechnicianSchema>;
export type UpdateTechnicianAvailabilityInput = z.infer<typeof UpdateTechnicianAvailabilitySchema>;
export type TechnicianFiltersInput = z.infer<typeof TechnicianFiltersSchema>;
export type TechnicianSearchInput = z.infer<typeof TechnicianSearchSchema>;
//# sourceMappingURL=technicianValidators.d.ts.map