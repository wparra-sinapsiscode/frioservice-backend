import { z } from 'zod';
export declare const ClientTypeSchema: z.ZodEnum<["PERSONAL", "COMPANY"]>;
export declare const ClientStatusSchema: z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]>;
export declare const CreateClientSchema: z.ZodEffects<z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    email: z.ZodString;
    clientType: z.ZodEnum<["PERSONAL", "COMPANY"]>;
    userId: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    ruc: z.ZodOptional<z.ZodString>;
    dni: z.ZodOptional<z.ZodString>;
    sector: z.ZodOptional<z.ZodString>;
    contactPerson: z.ZodOptional<z.ZodString>;
    businessRegistration: z.ZodOptional<z.ZodString>;
    emergencyContact: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    preferredSchedule: z.ZodOptional<z.ZodEnum<["morning", "afternoon", "evening", "flexible"]>>;
    notes: z.ZodOptional<z.ZodString>;
    isVip: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    discount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    username: string;
    email: string;
    password: string;
    clientType: "PERSONAL" | "COMPANY";
    name?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    businessRegistration?: string | undefined;
    phone?: string | undefined;
    emergencyContact?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    district?: string | undefined;
    postalCode?: string | undefined;
    sector?: string | undefined;
    preferredSchedule?: "morning" | "afternoon" | "evening" | "flexible" | undefined;
    notes?: string | undefined;
    isVip?: boolean | undefined;
    discount?: number | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    ruc?: string | undefined;
    dni?: string | undefined;
}, {
    userId: string;
    username: string;
    email: string;
    password: string;
    clientType: "PERSONAL" | "COMPANY";
    name?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    businessRegistration?: string | undefined;
    phone?: string | undefined;
    emergencyContact?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    district?: string | undefined;
    postalCode?: string | undefined;
    sector?: string | undefined;
    preferredSchedule?: "morning" | "afternoon" | "evening" | "flexible" | undefined;
    notes?: string | undefined;
    isVip?: boolean | undefined;
    discount?: number | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    ruc?: string | undefined;
    dni?: string | undefined;
}>, {
    userId: string;
    username: string;
    email: string;
    password: string;
    clientType: "PERSONAL" | "COMPANY";
    name?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    businessRegistration?: string | undefined;
    phone?: string | undefined;
    emergencyContact?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    district?: string | undefined;
    postalCode?: string | undefined;
    sector?: string | undefined;
    preferredSchedule?: "morning" | "afternoon" | "evening" | "flexible" | undefined;
    notes?: string | undefined;
    isVip?: boolean | undefined;
    discount?: number | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    ruc?: string | undefined;
    dni?: string | undefined;
}, {
    userId: string;
    username: string;
    email: string;
    password: string;
    clientType: "PERSONAL" | "COMPANY";
    name?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    businessRegistration?: string | undefined;
    phone?: string | undefined;
    emergencyContact?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    district?: string | undefined;
    postalCode?: string | undefined;
    sector?: string | undefined;
    preferredSchedule?: "morning" | "afternoon" | "evening" | "flexible" | undefined;
    notes?: string | undefined;
    isVip?: boolean | undefined;
    discount?: number | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    ruc?: string | undefined;
    dni?: string | undefined;
}>;
export declare const UpdateClientSchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    contactPerson: z.ZodOptional<z.ZodString>;
    businessRegistration: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    emergencyContact: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    clientType: z.ZodOptional<z.ZodEnum<["PERSONAL", "COMPANY"]>>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]>>;
    preferredSchedule: z.ZodOptional<z.ZodEnum<["morning", "afternoon", "evening", "flexible"]>>;
    nextServiceDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    notes: z.ZodOptional<z.ZodString>;
    isVip: z.ZodOptional<z.ZodBoolean>;
    discount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    businessRegistration?: string | undefined;
    phone?: string | undefined;
    emergencyContact?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
    clientType?: "PERSONAL" | "COMPANY" | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLOCKED" | undefined;
    preferredSchedule?: "morning" | "afternoon" | "evening" | "flexible" | undefined;
    nextServiceDate?: Date | undefined;
    notes?: string | undefined;
    isVip?: boolean | undefined;
    discount?: number | undefined;
}, {
    email?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    businessRegistration?: string | undefined;
    phone?: string | undefined;
    emergencyContact?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
    clientType?: "PERSONAL" | "COMPANY" | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLOCKED" | undefined;
    preferredSchedule?: "morning" | "afternoon" | "evening" | "flexible" | undefined;
    nextServiceDate?: string | undefined;
    notes?: string | undefined;
    isVip?: boolean | undefined;
    discount?: number | undefined;
}>;
export declare const UpdateClientStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]>;
}, "strip", z.ZodTypeAny, {
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLOCKED";
}, {
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLOCKED";
}>;
export declare const ToggleVipSchema: z.ZodObject<{
    isVip: z.ZodBoolean;
    discount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    isVip: boolean;
    discount?: number | undefined;
}, {
    isVip: boolean;
    discount?: number | undefined;
}>;
export declare const ClientFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]>>;
    clientType: z.ZodOptional<z.ZodEnum<["PERSONAL", "COMPANY"]>>;
    city: z.ZodOptional<z.ZodString>;
    isVip: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    city?: string | undefined;
    clientType?: "PERSONAL" | "COMPANY" | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLOCKED" | undefined;
    isVip?: boolean | undefined;
}, {
    search?: string | undefined;
    city?: string | undefined;
    clientType?: "PERSONAL" | "COMPANY" | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLOCKED" | undefined;
    isVip?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
}>;
export declare const ClientSearchSchema: z.ZodObject<{
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
export declare const ClientIdSchema: z.ZodObject<{
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
export declare const ClientTypeParamSchema: z.ZodObject<{
    clientType: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    clientType: string;
}, {
    clientType: string;
}>;
export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type UpdateClientStatusInput = z.infer<typeof UpdateClientStatusSchema>;
export type ToggleVipInput = z.infer<typeof ToggleVipSchema>;
export type ClientFiltersInput = z.infer<typeof ClientFiltersSchema>;
export type ClientSearchInput = z.infer<typeof ClientSearchSchema>;
//# sourceMappingURL=clientValidators.d.ts.map