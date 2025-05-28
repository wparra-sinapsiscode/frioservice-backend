import { z } from 'zod';
export declare const CreateEquipmentSchema: z.ZodObject<{
    clientId: z.ZodString;
    name: z.ZodString;
    model: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    type: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    installDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodDate>]>;
    warrantyExpiry: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodDate>]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    clientId: string;
    type: string;
    notes?: string | undefined;
    model?: string | undefined;
    brand?: string | undefined;
    serialNumber?: string | undefined;
    location?: string | undefined;
    installDate?: string | Date | undefined;
    warrantyExpiry?: string | Date | undefined;
}, {
    name: string;
    clientId: string;
    type: string;
    notes?: string | undefined;
    model?: string | undefined;
    brand?: string | undefined;
    serialNumber?: string | undefined;
    location?: string | undefined;
    installDate?: string | Date | undefined;
    warrantyExpiry?: string | Date | undefined;
}>;
export declare const CreateEquipmentClientSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    model: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    type: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    installDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodDate>]>;
    warrantyExpiry: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodDate>]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: string;
    notes?: string | undefined;
    clientId?: string | undefined;
    model?: string | undefined;
    brand?: string | undefined;
    serialNumber?: string | undefined;
    location?: string | undefined;
    installDate?: string | Date | undefined;
    warrantyExpiry?: string | Date | undefined;
}, {
    name: string;
    type: string;
    notes?: string | undefined;
    clientId?: string | undefined;
    model?: string | undefined;
    brand?: string | undefined;
    serialNumber?: string | undefined;
    location?: string | undefined;
    installDate?: string | Date | undefined;
    warrantyExpiry?: string | Date | undefined;
}>;
export declare const UpdateEquipmentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    installDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodDate>]>;
    warrantyExpiry: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodDate>]>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        MAINTENANCE: "MAINTENANCE";
        BROKEN: "BROKEN";
    }>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "BROKEN" | undefined;
    notes?: string | undefined;
    type?: string | undefined;
    model?: string | undefined;
    brand?: string | undefined;
    serialNumber?: string | undefined;
    location?: string | undefined;
    installDate?: string | Date | undefined;
    warrantyExpiry?: string | Date | undefined;
}, {
    name?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "BROKEN" | undefined;
    notes?: string | undefined;
    type?: string | undefined;
    model?: string | undefined;
    brand?: string | undefined;
    serialNumber?: string | undefined;
    location?: string | undefined;
    installDate?: string | Date | undefined;
    warrantyExpiry?: string | Date | undefined;
}>;
export declare const EquipmentFiltersSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        MAINTENANCE: "MAINTENANCE";
        BROKEN: "BROKEN";
    }>>;
    type: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "BROKEN" | undefined;
    clientId?: string | undefined;
    type?: string | undefined;
    limit?: string | undefined;
    brand?: string | undefined;
    page?: string | undefined;
}, {
    status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "BROKEN" | undefined;
    clientId?: string | undefined;
    type?: string | undefined;
    limit?: string | undefined;
    brand?: string | undefined;
    page?: string | undefined;
}>;
export declare const EquipmentIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const EquipmentStatusSchema: z.ZodObject<{
    status: z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        MAINTENANCE: "MAINTENANCE";
        BROKEN: "BROKEN";
    }>;
}, "strip", z.ZodTypeAny, {
    status: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "BROKEN";
}, {
    status: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "BROKEN";
}>;
export declare const ClientIdSchema: z.ZodObject<{
    clientId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    clientId: string;
}, {
    clientId: string;
}>;
//# sourceMappingURL=equipmentValidators.d.ts.map