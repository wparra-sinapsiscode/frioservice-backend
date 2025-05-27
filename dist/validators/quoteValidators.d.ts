import { z } from 'zod';
export declare const CreateQuoteSchema: z.ZodObject<{
    serviceId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    amount: z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>]>;
    validUntil: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    clientId: string;
    amount: number;
    validUntil: string | Date;
    notes?: string | undefined;
    description?: string | undefined;
    serviceId?: string | undefined;
}, {
    title: string;
    clientId: string;
    amount: string | number;
    validUntil: string | Date;
    notes?: string | undefined;
    description?: string | undefined;
    serviceId?: string | undefined;
}>;
export declare const UpdateQuoteSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>]>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        EXPIRED: "EXPIRED";
    }>>;
    validUntil: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | undefined;
    notes?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    amount?: number | undefined;
    validUntil?: string | Date | undefined;
}, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | undefined;
    notes?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    amount?: string | number | undefined;
    validUntil?: string | Date | undefined;
}>;
export declare const QuoteFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        EXPIRED: "EXPIRED";
    }>>;
    clientId: z.ZodOptional<z.ZodString>;
    serviceId: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | undefined;
    clientId?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    serviceId?: string | undefined;
}, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | undefined;
    clientId?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    serviceId?: string | undefined;
}>;
export declare const QuoteIdSchema: z.ZodObject<{
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
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page?: string | undefined;
    limit?: string | undefined;
}, {
    page?: string | undefined;
    limit?: string | undefined;
}>;
export declare const QuoteActionSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
//# sourceMappingURL=quoteValidators.d.ts.map