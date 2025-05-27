"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientTypeParamSchema = exports.UserIdSchema = exports.ClientIdSchema = exports.ClientSearchSchema = exports.ClientFiltersSchema = exports.ToggleVipSchema = exports.UpdateClientStatusSchema = exports.UpdateClientSchema = exports.CreateClientSchema = exports.ClientStatusSchema = exports.ClientTypeSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.ClientTypeSchema = zod_1.z.enum([
    client_1.ClientType.PERSONAL,
    client_1.ClientType.COMPANY
]);
exports.ClientStatusSchema = zod_1.z.enum([
    client_1.ClientStatus.ACTIVE,
    client_1.ClientStatus.INACTIVE,
    client_1.ClientStatus.SUSPENDED,
    client_1.ClientStatus.BLOCKED
]);
exports.CreateClientSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'El nombre de usuario para el cliente debe tener al menos 3 caracteres.')
        .max(50, 'El nombre de usuario no puede exceder 50 caracteres.'),
    password: zod_1.z.string()
        .min(6, 'La contraseña para el cliente debe tener al menos 6 caracteres.')
        .max(100, 'La contraseña no puede exceder 100 caracteres.'),
    email: zod_1.z.string()
        .email('Formato de email inválido.')
        .max(100, 'El email no puede exceder 100 caracteres.'),
    clientType: exports.ClientTypeSchema,
    userId: zod_1.z.string().min(1, 'El ID del usuario (administrador) es requerido.'),
    phone: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
        .min(7, 'El teléfono debe tener al menos 7 dígitos')
        .max(20, 'El teléfono no puede exceder 20 caracteres')
        .optional(),
    address: zod_1.z.string()
        .min(1, 'La dirección es requerida.')
        .max(300, 'La dirección no puede exceder 300 caracteres')
        .optional(),
    city: zod_1.z.string()
        .min(1, 'La ciudad es requerida.')
        .max(100, 'La ciudad no puede exceder 100 caracteres')
        .optional(),
    district: zod_1.z.string()
        .min(1, 'El distrito es requerido.')
        .max(100, 'El distrito no puede exceder 100 caracteres')
        .optional(),
    companyName: zod_1.z.string()
        .max(200, 'El nombre de la empresa no puede exceder 200 caracteres')
        .optional(),
    firstName: zod_1.z.string()
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .optional(),
    lastName: zod_1.z.string()
        .max(100, 'El apellido no puede exceder 100 caracteres')
        .optional(),
    name: zod_1.z.string()
        .max(200, "El nombre/razón social no debe exceder 200 caracteres")
        .optional(),
    ruc: zod_1.z.string()
        .length(11, 'El RUC debe tener 11 dígitos.')
        .regex(/^\d+$/, "El RUC solo debe contener números.")
        .optional(),
    dni: zod_1.z.string()
        .length(8, 'El DNI debe tener 8 dígitos.')
        .regex(/^\d+$/, "El DNI solo debe contener números.")
        .optional(),
    sector: zod_1.z.string()
        .max(100, 'El sector no puede exceder 100 caracteres')
        .optional(),
    contactPerson: zod_1.z.string().max(100).optional(),
    businessRegistration: zod_1.z.string().max(20).optional(),
    emergencyContact: zod_1.z.string().max(20).optional(),
    postalCode: zod_1.z.string().max(10).optional(),
    preferredSchedule: zod_1.z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),
    notes: zod_1.z.string().max(1000).optional(),
    isVip: zod_1.z.boolean().default(false).optional(),
    discount: zod_1.z.number().min(0).max(100).default(0).optional()
}).superRefine((data, ctx) => {
    if (data.clientType === 'COMPANY') {
        if (!data.companyName && !data.name) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Para empresas, se requiere 'companyName' (Razón Social).",
                path: ['companyName'],
            });
        }
        if (!data.ruc) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "El RUC es requerido para clientes de tipo EMPRESA.",
                path: ['ruc'],
            });
        }
    }
    else if (data.clientType === 'PERSONAL') {
        if (!data.firstName && !data.name) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Para personas, se requiere 'firstName' (Nombres).",
                path: ['firstName'],
            });
        }
        if (!data.dni) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "El DNI es requerido para clientes de tipo PERSONAL.",
                path: ['dni'],
            });
        }
    }
});
exports.UpdateClientSchema = zod_1.z.object({
    companyName: zod_1.z.string()
        .min(1, 'El nombre de la empresa es requerido')
        .max(200, 'El nombre de la empresa no puede exceder 200 caracteres')
        .optional(),
    contactPerson: zod_1.z.string()
        .min(1, 'El nombre de la persona de contacto es requerido')
        .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
        .optional(),
    businessRegistration: zod_1.z.string()
        .min(8, 'El número de registro debe tener al menos 8 caracteres')
        .max(20, 'El número de registro no puede exceder 20 caracteres')
        .optional(),
    phone: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
        .min(7, 'El teléfono debe tener al menos 7 dígitos')
        .max(20, 'El teléfono no puede exceder 20 caracteres')
        .optional(),
    email: zod_1.z.string()
        .email('Formato de email inválido')
        .max(100, 'El email no puede exceder 100 caracteres')
        .optional(),
    emergencyContact: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de contacto de emergencia inválido')
        .min(7, 'El contacto de emergencia debe tener al menos 7 dígitos')
        .max(20, 'El contacto de emergencia no puede exceder 20 caracteres')
        .optional(),
    address: zod_1.z.string()
        .min(1, 'La dirección es requerida')
        .max(300, 'La dirección no puede exceder 300 caracteres')
        .optional(),
    city: zod_1.z.string()
        .min(1, 'La ciudad es requerida')
        .max(100, 'La ciudad no puede exceder 100 caracteres')
        .optional(),
    postalCode: zod_1.z.string()
        .min(3, 'El código postal debe tener al menos 3 caracteres')
        .max(10, 'El código postal no puede exceder 10 caracteres')
        .optional(),
    clientType: exports.ClientTypeSchema
        .optional(),
    status: exports.ClientStatusSchema
        .optional(),
    preferredSchedule: zod_1.z.enum(['morning', 'afternoon', 'evening', 'flexible'])
        .optional(),
    nextServiceDate: zod_1.z.string()
        .datetime('Fecha del próximo servicio debe ser un datetime válido')
        .transform((val) => new Date(val))
        .optional(),
    notes: zod_1.z.string()
        .max(1000, 'Las notas no pueden exceder 1000 caracteres')
        .optional(),
    isVip: zod_1.z.boolean()
        .optional(),
    discount: zod_1.z.number()
        .min(0, 'El descuento no puede ser negativo')
        .max(100, 'El descuento no puede exceder 100%')
        .optional()
});
exports.UpdateClientStatusSchema = zod_1.z.object({
    status: exports.ClientStatusSchema
});
exports.ToggleVipSchema = zod_1.z.object({
    isVip: zod_1.z.boolean(),
    discount: zod_1.z.number()
        .min(0, 'El descuento no puede ser negativo')
        .max(100, 'El descuento no puede exceder 100%')
        .optional()
});
exports.ClientFiltersSchema = zod_1.z.object({
    status: exports.ClientStatusSchema.optional(),
    clientType: exports.ClientTypeSchema.optional(),
    city: zod_1.z.string()
        .min(1, 'La ciudad no puede estar vacía')
        .optional(),
    isVip: zod_1.z.string()
        .regex(/^(true|false)$/, 'isVip debe ser true o false')
        .transform((val) => val === 'true')
        .optional(),
    search: zod_1.z.string()
        .min(1, 'El término de búsqueda no puede estar vacío')
        .max(100, 'El término de búsqueda no puede exceder 100 caracteres')
        .optional(),
    page: zod_1.z.string()
        .regex(/^\d+$/, 'La página debe ser un número')
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, 'La página debe ser mayor a 0')
        .default('1'),
    limit: zod_1.z.string()
        .regex(/^\d+$/, 'El límite debe ser un número')
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 100, 'El límite debe estar entre 1 y 100')
        .default('20')
});
exports.ClientSearchSchema = zod_1.z.object({
    q: zod_1.z.string()
        .min(1, 'El término de búsqueda es requerido')
        .max(100, 'El término de búsqueda no puede exceder 100 caracteres'),
    page: zod_1.z.string()
        .regex(/^\d+$/, 'La página debe ser un número')
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, 'La página debe ser mayor a 0')
        .default('1'),
    limit: zod_1.z.string()
        .regex(/^\d+$/, 'El límite debe ser un número')
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 100, 'El límite debe estar entre 1 y 100')
        .default('20')
});
exports.ClientIdSchema = zod_1.z.object({
    id: zod_1.z.string()
        .min(1, 'El ID del cliente es requerido')
});
exports.UserIdSchema = zod_1.z.object({
    userId: zod_1.z.string()
        .min(1, 'El ID del usuario es requerido')
});
exports.ClientTypeParamSchema = zod_1.z.object({
    clientType: zod_1.z.string()
        .regex(/^(personal|company)$/i, 'El tipo de cliente debe ser personal o company')
        .transform((val) => val.toUpperCase())
});
//# sourceMappingURL=clientValidators.js.map