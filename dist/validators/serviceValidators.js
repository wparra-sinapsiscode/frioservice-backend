"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianIdSchema = exports.ClientIdSchema = exports.ServiceIdSchema = exports.ServiceFiltersSchema = exports.CompleteServiceSchema = exports.AssignTechnicianSchema = exports.UpdateServiceSchema = exports.CreateServiceClientSchema = exports.CreateServiceSchema = exports.ServiceStatusSchema = exports.ServicePrioritySchema = exports.ServiceTypeSchema = void 0;
const zod_1 = require("zod");
exports.ServiceTypeSchema = zod_1.z.enum([
    'MAINTENANCE',
    'REPAIR',
    'INSTALLATION',
    'INSPECTION',
    'EMERGENCY',
    'CLEANING',
    'CONSULTATION'
]);
exports.ServicePrioritySchema = zod_1.z.enum([
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
]);
exports.ServiceStatusSchema = zod_1.z.enum([
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED'
]);
exports.CreateServiceSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(1, 'El título es requerido')
        .max(200, 'El título no puede exceder 200 caracteres'),
    description: zod_1.z.string()
        .max(1000, 'La descripción no puede exceder 1000 caracteres')
        .optional(),
    clientId: zod_1.z.string()
        .min(1, 'El ID del cliente es requerido'),
    technicianId: zod_1.z.string()
        .min(1, 'El ID del técnico es requerido')
        .optional(),
    type: exports.ServiceTypeSchema,
    priority: exports.ServicePrioritySchema
        .default('MEDIUM'),
    scheduledDate: zod_1.z.string()
        .datetime('Fecha programada debe ser un datetime válido')
        .transform((val) => new Date(val)),
    estimatedDuration: zod_1.z.number()
        .min(15, 'La duración mínima es 15 minutos')
        .max(480, 'La duración máxima es 8 horas (480 minutos)')
        .optional(),
    equipmentIds: zod_1.z.array(zod_1.z.string())
        .default([]),
    address: zod_1.z.string()
        .min(1, 'La dirección es requerida')
        .max(500, 'La dirección no puede exceder 500 caracteres'),
    contactPhone: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
        .min(7, 'El teléfono debe tener al menos 7 dígitos')
        .max(20, 'El teléfono no puede exceder 20 caracteres'),
    emergencyContact: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono de emergencia inválido')
        .min(7, 'El teléfono de emergencia debe tener al menos 7 dígitos')
        .max(20, 'El teléfono de emergencia no puede exceder 20 caracteres')
        .optional(),
    accessInstructions: zod_1.z.string()
        .max(500, 'Las instrucciones de acceso no pueden exceder 500 caracteres')
        .optional(),
    clientNotes: zod_1.z.string()
        .max(1000, 'Las notas del cliente no pueden exceder 1000 caracteres')
        .optional()
});
exports.CreateServiceClientSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(1, 'El título es requerido')
        .max(200, 'El título no puede exceder 200 caracteres'),
    description: zod_1.z.string()
        .max(1000, 'La descripción no puede exceder 1000 caracteres')
        .optional(),
    clientId: zod_1.z.string()
        .min(1, 'El ID del cliente es requerido')
        .optional(),
    technicianId: zod_1.z.string()
        .min(1, 'El ID del técnico es requerido')
        .optional(),
    type: exports.ServiceTypeSchema,
    priority: exports.ServicePrioritySchema
        .default('MEDIUM'),
    scheduledDate: zod_1.z.string()
        .datetime('Fecha programada debe ser un datetime válido')
        .transform((val) => new Date(val)),
    estimatedDuration: zod_1.z.number()
        .min(15, 'La duración mínima es 15 minutos')
        .max(480, 'La duración máxima es 8 horas (480 minutos)')
        .optional(),
    equipmentIds: zod_1.z.array(zod_1.z.string())
        .default([]),
    address: zod_1.z.string()
        .min(1, 'La dirección es requerida')
        .max(500, 'La dirección no puede exceder 500 caracteres'),
    contactPhone: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
        .min(7, 'El teléfono debe tener al menos 7 dígitos')
        .max(20, 'El teléfono no puede exceder 20 caracteres'),
    emergencyContact: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono de emergencia inválido')
        .min(7, 'El teléfono de emergencia debe tener al menos 7 dígitos')
        .max(20, 'El teléfono de emergencia no puede exceder 20 caracteres')
        .optional(),
    accessInstructions: zod_1.z.string()
        .max(500, 'Las instrucciones de acceso no pueden exceder 500 caracteres')
        .optional(),
    clientNotes: zod_1.z.string()
        .max(1000, 'Las notas del cliente no pueden exceder 1000 caracteres')
        .optional()
});
exports.UpdateServiceSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(1, 'El título es requerido')
        .max(200, 'El título no puede exceder 200 caracteres')
        .optional(),
    description: zod_1.z.string()
        .max(1000, 'La descripción no puede exceder 1000 caracteres')
        .optional(),
    technicianId: zod_1.z.string()
        .min(1, 'El ID del técnico es requerido')
        .optional(),
    status: exports.ServiceStatusSchema
        .optional(),
    type: exports.ServiceTypeSchema
        .optional(),
    priority: exports.ServicePrioritySchema
        .optional(),
    scheduledDate: zod_1.z.string()
        .datetime('Fecha programada debe ser un datetime válido')
        .transform((val) => new Date(val))
        .optional(),
    estimatedDuration: zod_1.z.number()
        .min(15, 'La duración mínima es 15 minutos')
        .max(480, 'La duración máxima es 8 horas (480 minutos)')
        .optional(),
    equipmentIds: zod_1.z.array(zod_1.z.string())
        .optional(),
    address: zod_1.z.string()
        .min(1, 'La dirección es requerida')
        .max(500, 'La dirección no puede exceder 500 caracteres')
        .optional(),
    contactPhone: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
        .min(7, 'El teléfono debe tener al menos 7 dígitos')
        .max(20, 'El teléfono no puede exceder 20 caracteres')
        .optional(),
    emergencyContact: zod_1.z.string()
        .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono de emergencia inválido')
        .min(7, 'El teléfono de emergencia debe tener al menos 7 dígitos')
        .max(20, 'El teléfono de emergencia no puede exceder 20 caracteres')
        .optional(),
    accessInstructions: zod_1.z.string()
        .max(500, 'Las instrucciones de acceso no pueden exceder 500 caracteres')
        .optional(),
    clientNotes: zod_1.z.string()
        .max(1000, 'Las notas del cliente no pueden exceder 1000 caracteres')
        .optional()
});
exports.AssignTechnicianSchema = zod_1.z.object({
    technicianId: zod_1.z.string()
        .min(1, 'El ID del técnico es requerido')
});
exports.CompleteServiceSchema = zod_1.z.object({
    workPerformed: zod_1.z.string()
        .min(1, 'La descripción del trabajo realizado es requerida')
        .max(2000, 'La descripción del trabajo no puede exceder 2000 caracteres'),
    timeSpent: zod_1.z.number()
        .min(1, 'El tiempo empleado debe ser mayor a 0')
        .max(1440, 'El tiempo empleado no puede exceder 24 horas (1440 minutos)'),
    materialsUsed: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1, 'El nombre del material es requerido'),
        quantity: zod_1.z.number().min(0, 'La cantidad debe ser positiva'),
        unit: zod_1.z.string().min(1, 'La unidad es requerida'),
        cost: zod_1.z.number().min(0, 'El costo debe ser positivo').optional()
    }))
        .default([])
        .optional(),
    technicianNotes: zod_1.z.string()
        .max(1000, 'Las notas del técnico no pueden exceder 1000 caracteres')
        .optional(),
    clientSignature: zod_1.z.union([
        zod_1.z.string().min(1),
        zod_1.z.boolean(),
        zod_1.z.literal('confirmed')
    ])
        .optional(),
    images: zod_1.z.array(zod_1.z.string())
        .default([])
        .optional()
});
exports.ServiceFiltersSchema = zod_1.z.object({
    status: exports.ServiceStatusSchema.optional(),
    type: exports.ServiceTypeSchema.optional(),
    priority: exports.ServicePrioritySchema.optional(),
    clientId: zod_1.z.string().optional(),
    technicianId: zod_1.z.string().optional(),
    startDate: zod_1.z.string()
        .datetime('Fecha de inicio debe ser un datetime válido')
        .transform((val) => new Date(val))
        .optional(),
    endDate: zod_1.z.string()
        .datetime('Fecha de fin debe ser un datetime válido')
        .transform((val) => new Date(val))
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
exports.ServiceIdSchema = zod_1.z.object({
    id: zod_1.z.string()
        .min(1, 'El ID del servicio es requerido')
});
exports.ClientIdSchema = zod_1.z.object({
    clientId: zod_1.z.string()
        .min(1, 'El ID del cliente es requerido')
});
exports.TechnicianIdSchema = zod_1.z.object({
    technicianId: zod_1.z.string()
        .min(1, 'El ID del técnico es requerido')
});
//# sourceMappingURL=serviceValidators.js.map