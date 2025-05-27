"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserIdSchema = exports.TechnicianIdSchema = exports.TechnicianSearchSchema = exports.TechnicianFiltersSchema = exports.UpdateTechnicianAvailabilitySchema = exports.UpdateTechnicianSchema = exports.CreateTechnicianSchema = void 0;
const zod_1 = require("zod");
exports.CreateTechnicianSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'El nombre de usuario para el técnico debe tener al menos 3 caracteres.')
        .max(50, 'El nombre de usuario no puede exceder 50 caracteres.'),
    password: zod_1.z.string()
        .min(6, 'La contraseña para el técnico debe tener al menos 6 caracteres.')
        .max(100, 'La contraseña no puede exceder 100 caracteres.'),
    email: zod_1.z.string()
        .email('Formato de email inválido.')
        .max(100, 'El email no puede exceder 100 caracteres.'),
    specialty: zod_1.z.string()
        .min(1, 'La especialidad es requerida.')
        .max(100, 'La especialidad no puede exceder 100 caracteres.'),
    experienceYears: zod_1.z.number()
        .int('Los años de experiencia deben ser un número entero.')
        .min(0, 'Los años de experiencia no pueden ser negativos.')
        .max(50, 'Los años de experiencia no pueden exceder 50 años.'),
    phone: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
        .min(7, 'El teléfono debe tener al menos 7 dígitos')
        .max(20, 'El teléfono no puede exceder 20 caracteres')
        .optional(),
    isAvailable: zod_1.z.boolean()
        .default(true)
        .optional(),
    firstName: zod_1.z.string()
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .optional(),
    lastName: zod_1.z.string()
        .max(100, 'El apellido no puede exceder 100 caracteres')
        .optional(),
    name: zod_1.z.string()
        .max(200, "El nombre completo no debe exceder 200 caracteres")
        .optional(),
    rating: zod_1.z.number()
        .min(0, 'La calificación no puede ser negativa')
        .max(5, 'La calificación no puede exceder 5')
        .optional(),
    averageTime: zod_1.z.string()
        .max(50, 'El tiempo promedio no puede exceder 50 caracteres')
        .optional(),
    servicesCompleted: zod_1.z.number()
        .int('Los servicios completados deben ser un número entero')
        .min(0, 'Los servicios completados no pueden ser negativos')
        .optional()
}).superRefine((data, ctx) => {
    if (!data.firstName && !data.name) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Se requiere 'firstName' o 'name' para el técnico.",
            path: ['firstName'],
        });
    }
});
exports.UpdateTechnicianSchema = zod_1.z.object({
    specialty: zod_1.z.string()
        .min(1, 'La especialidad es requerida')
        .max(100, 'La especialidad no puede exceder 100 caracteres')
        .optional(),
    experienceYears: zod_1.z.number()
        .int('Los años de experiencia deben ser un número entero')
        .min(0, 'Los años de experiencia no pueden ser negativos')
        .max(50, 'Los años de experiencia no pueden exceder 50 años')
        .optional(),
    phone: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
        .min(7, 'El teléfono debe tener al menos 7 dígitos')
        .max(20, 'El teléfono no puede exceder 20 caracteres')
        .optional(),
    isAvailable: zod_1.z.boolean()
        .optional(),
    firstName: zod_1.z.string()
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .optional(),
    lastName: zod_1.z.string()
        .max(100, 'El apellido no puede exceder 100 caracteres')
        .optional(),
    name: zod_1.z.string()
        .max(200, "El nombre completo no debe exceder 200 caracteres")
        .optional(),
    rating: zod_1.z.number()
        .min(0, 'La calificación no puede ser negativa')
        .max(5, 'La calificación no puede exceder 5')
        .optional(),
    servicesCompleted: zod_1.z.number()
        .int('Los servicios completados deben ser un número entero')
        .min(0, 'Los servicios completados no pueden ser negativos')
        .optional(),
    averageTime: zod_1.z.string()
        .max(50, 'El tiempo promedio no puede exceder 50 caracteres')
        .optional()
});
exports.UpdateTechnicianAvailabilitySchema = zod_1.z.object({
    isAvailable: zod_1.z.boolean()
});
exports.TechnicianFiltersSchema = zod_1.z.object({
    specialty: zod_1.z.string()
        .min(1, 'La especialidad no puede estar vacía')
        .optional(),
    isAvailable: zod_1.z.string()
        .regex(/^(true|false)$/, 'isAvailable debe ser true o false')
        .transform((val) => val === 'true')
        .optional(),
    experienceYears: zod_1.z.string()
        .regex(/^\d+$/, 'Los años de experiencia deben ser un número')
        .transform((val) => parseInt(val, 10))
        .refine((val) => val >= 0, 'Los años de experiencia deben ser mayor o igual a 0')
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
exports.TechnicianSearchSchema = zod_1.z.object({
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
exports.TechnicianIdSchema = zod_1.z.object({
    id: zod_1.z.string()
        .min(1, 'El ID del técnico es requerido')
});
exports.UserIdSchema = zod_1.z.object({
    userId: zod_1.z.string()
        .min(1, 'El ID del usuario es requerido')
});
//# sourceMappingURL=technicianValidators.js.map