"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteActionSchema = exports.PaginationSchema = exports.ClientIdSchema = exports.QuoteIdSchema = exports.QuoteFiltersSchema = exports.UpdateQuoteSchema = exports.CreateQuoteSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.CreateQuoteSchema = zod_1.z.object({
    serviceId: zod_1.z.string().min(1, 'Service ID es requerido').optional(),
    clientId: zod_1.z.string().min(1, 'Client ID es requerido'),
    title: zod_1.z.string().min(1, 'Título es requerido').max(255, 'Título muy largo'),
    description: zod_1.z.string().max(1000, 'Descripción muy larga').optional(),
    amount: zod_1.z.number().positive('El monto debe ser positivo').or(zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, 'Formato de monto inválido')
        .transform(val => parseFloat(val))
        .refine(val => val > 0, 'El monto debe ser positivo')),
    validUntil: zod_1.z.string().datetime('Fecha de validez inválida').or(zod_1.z.date()),
    notes: zod_1.z.string().max(1000, 'Notas muy largas').optional()
});
exports.UpdateQuoteSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Título es requerido').max(255, 'Título muy largo').optional(),
    description: zod_1.z.string().max(1000, 'Descripción muy larga').optional(),
    amount: zod_1.z.number().positive('El monto debe ser positivo').or(zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, 'Formato de monto inválido')
        .transform(val => parseFloat(val))
        .refine(val => val > 0, 'El monto debe ser positivo')).optional(),
    status: zod_1.z.nativeEnum(client_1.QuoteStatus).optional(),
    validUntil: zod_1.z.string().datetime('Fecha de validez inválida').or(zod_1.z.date()).optional(),
    notes: zod_1.z.string().max(1000, 'Notas muy largas').optional()
});
exports.QuoteFiltersSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.QuoteStatus).optional(),
    clientId: zod_1.z.string().optional(),
    serviceId: zod_1.z.string().optional(),
    page: zod_1.z.string().regex(/^\d+$/, 'Página debe ser un número').optional(),
    limit: zod_1.z.string().regex(/^\d+$/, 'Límite debe ser un número').optional()
});
exports.QuoteIdSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Quote ID es requerido')
});
exports.ClientIdSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, 'Client ID es requerido')
});
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/, 'Página debe ser un número').optional(),
    limit: zod_1.z.string().regex(/^\d+$/, 'Límite debe ser un número').optional()
});
exports.QuoteActionSchema = zod_1.z.object({
    notes: zod_1.z.string().max(1000, 'Notas muy largas').optional()
});
//# sourceMappingURL=quoteValidators.js.map