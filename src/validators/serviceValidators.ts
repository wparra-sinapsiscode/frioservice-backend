import { z } from 'zod';

// Enums para validación
export const ServiceTypeSchema = z.enum([
  'MAINTENANCE',
  'REPAIR',
  'INSTALLATION',
  'INSPECTION',
  'EMERGENCY',
  'CLEANING',
  'CONSULTATION'
]);

export const ServicePrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
]);

export const ServiceStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED'
]);

// Schema para crear un servicio (ADMIN/TECHNICIAN)
export const CreateServiceSchema = z.object({
  title: z.string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  description: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  
  clientId: z.string()
    .min(1, 'El ID del cliente es requerido'),
  
  technicianId: z.string()
    .min(1, 'El ID del técnico es requerido')
    .optional(),
  
  type: ServiceTypeSchema,
  
  priority: ServicePrioritySchema
    .default('MEDIUM'),
  
  scheduledDate: z.string()
    .datetime('Fecha programada debe ser un datetime válido')
    .transform((val) => new Date(val)),
  
  estimatedDuration: z.number()
    .min(15, 'La duración mínima es 15 minutos')
    .max(480, 'La duración máxima es 8 horas (480 minutos)')
    .optional(),
  
  equipmentIds: z.array(z.string())
    .default([]),
  
  address: z.string()
    .min(1, 'La dirección es requerida')
    .max(500, 'La dirección no puede exceder 500 caracteres'),
  
  contactPhone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  
  emergencyContact: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono de emergencia inválido')
    .min(7, 'El teléfono de emergencia debe tener al menos 7 dígitos')
    .max(20, 'El teléfono de emergencia no puede exceder 20 caracteres')
    .optional(),
  
  accessInstructions: z.string()
    .max(500, 'Las instrucciones de acceso no pueden exceder 500 caracteres')
    .optional(),
  
  clientNotes: z.string()
    .max(1000, 'Las notas del cliente no pueden exceder 1000 caracteres')
    .optional()
});

// Schema para crear un servicio (CLIENT) - clientId es opcional
export const CreateServiceClientSchema = z.object({
  title: z.string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  description: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  
  clientId: z.string()
    .min(1, 'El ID del cliente es requerido')
    .optional(),
  
  technicianId: z.string()
    .min(1, 'El ID del técnico es requerido')
    .optional(),
  
  type: ServiceTypeSchema,
  
  priority: ServicePrioritySchema
    .default('MEDIUM'),
  
  scheduledDate: z.string()
    .datetime('Fecha programada debe ser un datetime válido')
    .transform((val) => new Date(val)),
  
  estimatedDuration: z.number()
    .min(15, 'La duración mínima es 15 minutos')
    .max(480, 'La duración máxima es 8 horas (480 minutos)')
    .optional(),
  
  equipmentIds: z.array(z.string())
    .default([]),
  
  address: z.string()
    .min(1, 'La dirección es requerida')
    .max(500, 'La dirección no puede exceder 500 caracteres'),
  
  contactPhone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  
  emergencyContact: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono de emergencia inválido')
    .min(7, 'El teléfono de emergencia debe tener al menos 7 dígitos')
    .max(20, 'El teléfono de emergencia no puede exceder 20 caracteres')
    .optional(),
  
  accessInstructions: z.string()
    .max(500, 'Las instrucciones de acceso no pueden exceder 500 caracteres')
    .optional(),
  
  clientNotes: z.string()
    .max(1000, 'Las notas del cliente no pueden exceder 1000 caracteres')
    .optional()
});

// Schema para actualizar un servicio
export const UpdateServiceSchema = z.object({
  title: z.string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres')
    .optional(),
  
  description: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  
  technicianId: z.string()
    .min(1, 'El ID del técnico es requerido')
    .optional(),
  
  status: ServiceStatusSchema
    .optional(),
  
  type: ServiceTypeSchema
    .optional(),
  
  priority: ServicePrioritySchema
    .optional(),
  
  scheduledDate: z.string()
    .datetime('Fecha programada debe ser un datetime válido')
    .transform((val) => new Date(val))
    .optional(),
  
  estimatedDuration: z.number()
    .min(15, 'La duración mínima es 15 minutos')
    .max(480, 'La duración máxima es 8 horas (480 minutos)')
    .optional(),
  
  equipmentIds: z.array(z.string())
    .optional(),
  
  address: z.string()
    .min(1, 'La dirección es requerida')
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .optional(),
  
  contactPhone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional(),
  
  emergencyContact: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono de emergencia inválido')
    .min(7, 'El teléfono de emergencia debe tener al menos 7 dígitos')
    .max(20, 'El teléfono de emergencia no puede exceder 20 caracteres')
    .optional(),
  
  accessInstructions: z.string()
    .max(500, 'Las instrucciones de acceso no pueden exceder 500 caracteres')
    .optional(),
  
  clientNotes: z.string()
    .max(1000, 'Las notas del cliente no pueden exceder 1000 caracteres')
    .optional()
});

// Schema para asignar técnico
export const AssignTechnicianSchema = z.object({
  technicianId: z.string()
    .min(1, 'El ID del técnico es requerido')
});

// Schema para completar servicio
export const CompleteServiceSchema = z.object({
  workPerformed: z.string()
    .min(1, 'La descripción del trabajo realizado es requerida')
    .max(2000, 'La descripción del trabajo no puede exceder 2000 caracteres'),
  
  timeSpent: z.number()
    .min(1, 'El tiempo empleado debe ser mayor a 0')
    .max(1440, 'El tiempo empleado no puede exceder 24 horas (1440 minutos)'),
  
  materialsUsed: z.array(z.object({
    name: z.string().min(1, 'El nombre del material es requerido'),
    quantity: z.number().min(0, 'La cantidad debe ser positiva'),
    unit: z.string().min(1, 'La unidad es requerida'),
    cost: z.number().min(0, 'El costo debe ser positivo').optional()
  }))
    .default([])
    .optional(),
  
  technicianNotes: z.string()
    .max(1000, 'Las notas del técnico no pueden exceder 1000 caracteres')
    .optional(),
  
  clientSignature: z.union([
    z.string().min(1),  // Para firmas base64 o texto
    z.boolean(),        // Para confirmar con checkbox
    z.literal('confirmed') // Para valor "confirmed"
  ])
    .optional(),
  
  images: z.array(z.string())
    .default([])
    .optional()
});

// Schema para filtros de búsqueda
export const ServiceFiltersSchema = z.object({
  status: ServiceStatusSchema.optional(),
  type: ServiceTypeSchema.optional(),
  priority: ServicePrioritySchema.optional(),
  clientId: z.string().optional(),
  technicianId: z.string().optional(),
  startDate: z.string()
    .datetime('Fecha de inicio debe ser un datetime válido')
    .transform((val) => new Date(val))
    .optional(),
  endDate: z.string()
    .datetime('Fecha de fin debe ser un datetime válido')
    .transform((val) => new Date(val))
    .optional(),
  page: z.string()
    .regex(/^\d+$/, 'La página debe ser un número')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'La página debe ser mayor a 0')
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'El límite debe ser un número')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'El límite debe estar entre 1 y 100')
    .default('20')
});

// Schema para parámetros de ID
export const ServiceIdSchema = z.object({
  id: z.string()
    .min(1, 'El ID del servicio es requerido')
});

export const ClientIdSchema = z.object({
  clientId: z.string()
    .min(1, 'El ID del cliente es requerido')
});

export const TechnicianIdSchema = z.object({
  technicianId: z.string()
    .min(1, 'El ID del técnico es requerido')
});

// Tipos TypeScript derivados de los schemas
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;
export type AssignTechnicianInput = z.infer<typeof AssignTechnicianSchema>;
export type CompleteServiceInput = z.infer<typeof CompleteServiceSchema>;
export type ServiceFiltersInput = z.infer<typeof ServiceFiltersSchema>;