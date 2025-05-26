// En: src/validators/clientValidators.ts

import { z } from 'zod';
import { ClientType as PrismaClientType, ClientStatus as PrismaClientStatus } from '@prisma/client'; // Para usar los enums de Prisma

// Enums para validación (los que ya tenías)
export const ClientTypeSchema = z.enum([
  PrismaClientType.PERSONAL, // Usando el enum de Prisma
  PrismaClientType.COMPANY
]);

export const ClientStatusSchema = z.enum([
  PrismaClientStatus.ACTIVE,
  PrismaClientStatus.INACTIVE,
  PrismaClientStatus.SUSPENDED,
  PrismaClientStatus.BLOCKED
]);

// --- CREATE CLIENT SCHEMA MODIFICADO ---
export const CreateClientSchema = z.object({
  // --- Datos para el NUEVO USUARIO del Cliente ---
  username: z.string()
    .min(3, 'El nombre de usuario para el cliente debe tener al menos 3 caracteres.')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres.'),
  
  password: z.string()
    .min(6, 'La contraseña para el cliente debe tener al menos 6 caracteres.')
    .max(100, 'La contraseña no puede exceder 100 caracteres.'),
  
  // El email se usa tanto para el nuevo usuario como para el contacto del perfil
  email: z.string()
    .email('Formato de email inválido.')
    .max(100, 'El email no puede exceder 100 caracteres.'),

  // --- Datos del Perfil del Cliente ---
  clientType: ClientTypeSchema, // 'COMPANY' o 'PERSONAL'

  // El userId del administrador que realiza la acción. Tu frontend lo envía.
  userId: z.string().min(1, 'El ID del usuario (administrador) es requerido.'), 

  // Campos de perfil comunes (ajusta .optional() o .min(1) según tus reglas de negocio)
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional(), // O .min(1, 'El teléfono es requerido')
  
  address: z.string()
    .min(1, 'La dirección es requerida.')
    .max(300, 'La dirección no puede exceder 300 caracteres')
    .optional(), // O requerida

  city: z.string()
    .min(1, 'La ciudad es requerida.')
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional(), // O requerida

  district: z.string()
    .min(1, 'El distrito es requerido.')
    .max(100, 'El distrito no puede exceder 100 caracteres')
    .optional(), // O requerido
  
  // Campos condicionales (nombre/razón social, ruc/dni, etc.)
  // El frontend envía companyName O (firstName + lastName)
  // y ruc O dni. Lo validaremos con .superRefine
  companyName: z.string()
    .max(200, 'El nombre de la empresa no puede exceder 200 caracteres')
    .optional(),
  
  firstName: z.string() // El frontend lo envía como 'name' si es personal
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),

  lastName: z.string()
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .optional(),

  name: z.string() // Campo 'name' general que el frontend usa para 'Razón Social' o 'Nombres'
    .max(200, "El nombre/razón social no debe exceder 200 caracteres")
    .optional(), // Hacemos opcional aquí porque lo validaremos en superRefine

  ruc: z.string()
    .length(11, 'El RUC debe tener 11 dígitos.')
    .regex(/^\d+$/, "El RUC solo debe contener números.")
    .optional(),
  
  dni: z.string()
    .length(8, 'El DNI debe tener 8 dígitos.')
    .regex(/^\d+$/, "El DNI solo debe contener números.")
    .optional(),
  
  sector: z.string()
    .max(100, 'El sector no puede exceder 100 caracteres')
    .optional(),

  // Otros campos de perfil que ya tenías (todos opcionales aquí, ajusta si son requeridos)
  contactPerson: z.string().max(100).optional(),
  businessRegistration: z.string().max(20).optional(),
  emergencyContact: z.string().max(20).optional(),
  postalCode: z.string().max(10).optional(),
  preferredSchedule: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),
  notes: z.string().max(1000).optional(),
  isVip: z.boolean().default(false).optional(),
  discount: z.number().min(0).max(100).default(0).optional()

}).superRefine((data, ctx) => {
  if (data.clientType === 'COMPANY') {
    // Para empresas, 'name' (Razón Social) o 'companyName' deben estar presentes.
    // El frontend envía 'companyName' y también el input 'name' se usa para Razón Social.
    // Priorizaremos 'companyName' si viene, sino 'name'.
    if (!data.companyName && !data.name) { 
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Para empresas, se requiere 'companyName' (Razón Social).",
        path: ['companyName'], // o ['name'] si es el campo que usa el form
      });
    }
    if (!data.ruc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El RUC es requerido para clientes de tipo EMPRESA.",
        path: ['ruc'],
      });
    }
  } else if (data.clientType === 'PERSONAL') {
    // Para personas, 'firstName' o 'name' deben estar presentes.
    // El frontend envía 'firstName' y también el input 'name' se usa para Nombres.
    if (!data.firstName && !data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Para personas, se requiere 'firstName' (Nombres).",
        path: ['firstName'], // o ['name'] si es el campo que usa el form
      });
    }
    if (!data.dni) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El DNI es requerido para clientes de tipo PERSONAL.",
        path: ['dni'],
      });
    }
  }
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