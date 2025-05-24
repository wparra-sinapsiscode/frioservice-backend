import { z } from 'zod';

// Enums para validación
export const ClientTypeSchema = z.enum([
  'PERSONAL',
  'COMPANY'
]);

export const ClientStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'BLOCKED'
]);

// Schema para crear un cliente
export const CreateClientSchema = z.object({
  userId: z.string()
    .min(1, 'El ID del usuario es requerido'),
  
  companyName: z.string()
    .min(1, 'El nombre de la empresa es requerido')
    .max(200, 'El nombre de la empresa no puede exceder 200 caracteres')
    .optional(),
  
  contactPerson: z.string()
    .min(1, 'El nombre de la persona de contacto es requerido')
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
    .optional(),
  
  businessRegistration: z.string()
    .min(8, 'El número de registro debe tener al menos 8 caracteres')
    .max(20, 'El número de registro no puede exceder 20 caracteres')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional(),
  
  email: z.string()
    .email('Formato de email inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .optional(),
  
  emergencyContact: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de contacto de emergencia inválido')
    .min(7, 'El contacto de emergencia debe tener al menos 7 dígitos')
    .max(20, 'El contacto de emergencia no puede exceder 20 caracteres')
    .optional(),
  
  address: z.string()
    .min(1, 'La dirección es requerida')
    .max(300, 'La dirección no puede exceder 300 caracteres')
    .optional(),
  
  city: z.string()
    .min(1, 'La ciudad es requerida')
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional(),
  
  postalCode: z.string()
    .min(3, 'El código postal debe tener al menos 3 caracteres')
    .max(10, 'El código postal no puede exceder 10 caracteres')
    .optional(),
  
  clientType: ClientTypeSchema,
  
  preferredSchedule: z.enum(['morning', 'afternoon', 'evening', 'flexible'])
    .optional(),
  
  notes: z.string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
  
  isVip: z.boolean()
    .default(false)
    .optional(),
  
  discount: z.number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .default(0)
    .optional()
}).refine((data) => {
  // Si es una empresa, companyName es requerido
  if (data.clientType === 'COMPANY' && !data.companyName) {
    return false;
  }
  // Si es personal, contactPerson es requerido
  if (data.clientType === 'PERSONAL' && !data.contactPerson) {
    return false;
  }
  return true;
}, {
  message: 'Para empresas se requiere nombre de empresa, para personas se requiere nombre de contacto',
  path: ['clientType']
});

// Schema para actualizar un cliente
export const UpdateClientSchema = z.object({
  companyName: z.string()
    .min(1, 'El nombre de la empresa es requerido')
    .max(200, 'El nombre de la empresa no puede exceder 200 caracteres')
    .optional(),
  
  contactPerson: z.string()
    .min(1, 'El nombre de la persona de contacto es requerido')
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
    .optional(),
  
  businessRegistration: z.string()
    .min(8, 'El número de registro debe tener al menos 8 caracteres')
    .max(20, 'El número de registro no puede exceder 20 caracteres')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional(),
  
  email: z.string()
    .email('Formato de email inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .optional(),
  
  emergencyContact: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de contacto de emergencia inválido')
    .min(7, 'El contacto de emergencia debe tener al menos 7 dígitos')
    .max(20, 'El contacto de emergencia no puede exceder 20 caracteres')
    .optional(),
  
  address: z.string()
    .min(1, 'La dirección es requerida')
    .max(300, 'La dirección no puede exceder 300 caracteres')
    .optional(),
  
  city: z.string()
    .min(1, 'La ciudad es requerida')
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional(),
  
  postalCode: z.string()
    .min(3, 'El código postal debe tener al menos 3 caracteres')
    .max(10, 'El código postal no puede exceder 10 caracteres')
    .optional(),
  
  clientType: ClientTypeSchema
    .optional(),
  
  status: ClientStatusSchema
    .optional(),
  
  preferredSchedule: z.enum(['morning', 'afternoon', 'evening', 'flexible'])
    .optional(),
  
  nextServiceDate: z.string()
    .datetime('Fecha del próximo servicio debe ser un datetime válido')
    .transform((val) => new Date(val))
    .optional(),
  
  notes: z.string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
  
  isVip: z.boolean()
    .optional(),
  
  discount: z.number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .optional()
});

// Schema para actualizar estado del cliente
export const UpdateClientStatusSchema = z.object({
  status: ClientStatusSchema
});

// Schema para alternar estado VIP
export const ToggleVipSchema = z.object({
  isVip: z.boolean(),
  discount: z.number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .optional()
});

// Schema para filtros de búsqueda
export const ClientFiltersSchema = z.object({
  status: ClientStatusSchema.optional(),
  clientType: ClientTypeSchema.optional(),
  city: z.string()
    .min(1, 'La ciudad no puede estar vacía')
    .optional(),
  isVip: z.string()
    .regex(/^(true|false)$/, 'isVip debe ser true o false')
    .transform((val) => val === 'true')
    .optional(),
  search: z.string()
    .min(1, 'El término de búsqueda no puede estar vacío')
    .max(100, 'El término de búsqueda no puede exceder 100 caracteres')
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

// Schema para búsqueda de clientes
export const ClientSearchSchema = z.object({
  q: z.string()
    .min(1, 'El término de búsqueda es requerido')
    .max(100, 'El término de búsqueda no puede exceder 100 caracteres'),
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
export const ClientIdSchema = z.object({
  id: z.string()
    .min(1, 'El ID del cliente es requerido')
});

export const UserIdSchema = z.object({
  userId: z.string()
    .min(1, 'El ID del usuario es requerido')
});

export const ClientTypeParamSchema = z.object({
  clientType: z.string()
    .regex(/^(personal|company)$/i, 'El tipo de cliente debe ser personal o company')
    .transform((val) => val.toUpperCase())
});

// Tipos TypeScript derivados de los schemas
export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type UpdateClientStatusInput = z.infer<typeof UpdateClientStatusSchema>;
export type ToggleVipInput = z.infer<typeof ToggleVipSchema>;
export type ClientFiltersInput = z.infer<typeof ClientFiltersSchema>;
export type ClientSearchInput = z.infer<typeof ClientSearchSchema>;