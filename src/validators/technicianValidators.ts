// En: src/validators/technicianValidators.ts

import { z } from 'zod';

// --- CREATE TECHNICIAN SCHEMA ---
export const CreateTechnicianSchema = z.object({
  // --- Datos para el NUEVO USUARIO del Técnico ---
  username: z.string()
    .min(3, 'El nombre de usuario para el técnico debe tener al menos 3 caracteres.')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres.'),
  
  password: z.string()
    .min(6, 'La contraseña para el técnico debe tener al menos 6 caracteres.')
    .max(100, 'La contraseña no puede exceder 100 caracteres.'),
  
  email: z.string()
    .email('Formato de email inválido.')
    .max(100, 'El email no puede exceder 100 caracteres.'),

  // --- Datos del Perfil del Técnico ---
  specialty: z.string()
    .min(1, 'La especialidad es requerida.')
    .max(100, 'La especialidad no puede exceder 100 caracteres.'),
  
  experienceYears: z.number()
    .int('Los años de experiencia deben ser un número entero.')
    .min(0, 'Los años de experiencia no pueden ser negativos.')
    .max(50, 'Los años de experiencia no pueden exceder 50 años.'),
  
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional(),
  
  isAvailable: z.boolean()
    .default(true)
    .optional(),
  
  // Campos de nombre del técnico
  firstName: z.string()
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),

  lastName: z.string()
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .optional(),

  name: z.string()
    .max(200, "El nombre completo no debe exceder 200 caracteres")
    .optional()

}).superRefine((data, ctx) => {
  // Validar que al menos firstName o name esté presente
  if (!data.firstName && !data.name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Se requiere 'firstName' o 'name' para el técnico.",
      path: ['firstName'],
    });
  }
});

// Schema para actualizar un técnico
export const UpdateTechnicianSchema = z.object({
  specialty: z.string()
    .min(1, 'La especialidad es requerida')
    .max(100, 'La especialidad no puede exceder 100 caracteres')
    .optional(),
  
  experienceYears: z.number()
    .int('Los años de experiencia deben ser un número entero')
    .min(0, 'Los años de experiencia no pueden ser negativos')
    .max(50, 'Los años de experiencia no pueden exceder 50 años')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de teléfono inválido')
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional(),
  
  isAvailable: z.boolean()
    .optional(),
  
  firstName: z.string()
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),

  lastName: z.string()
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .optional(),

  name: z.string()
    .max(200, "El nombre completo no debe exceder 200 caracteres")
    .optional(),
  
  rating: z.number()
    .min(0, 'La calificación no puede ser negativa')
    .max(5, 'La calificación no puede exceder 5')
    .optional(),
  
  servicesCompleted: z.number()
    .int('Los servicios completados deben ser un número entero')
    .min(0, 'Los servicios completados no pueden ser negativos')
    .optional(),
  
  averageTime: z.string()
    .max(50, 'El tiempo promedio no puede exceder 50 caracteres')
    .optional()
});

// Schema para actualizar disponibilidad del técnico
export const UpdateTechnicianAvailabilitySchema = z.object({
  isAvailable: z.boolean()
});

// Schema para filtros de búsqueda de técnicos
export const TechnicianFiltersSchema = z.object({
  specialty: z.string()
    .min(1, 'La especialidad no puede estar vacía')
    .optional(),
  
  isAvailable: z.string()
    .regex(/^(true|false)$/, 'isAvailable debe ser true o false')
    .transform((val) => val === 'true')
    .optional(),
  
  experienceYears: z.string()
    .regex(/^\d+$/, 'Los años de experiencia deben ser un número')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, 'Los años de experiencia deben ser mayor o igual a 0')
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

// Schema para búsqueda de técnicos
export const TechnicianSearchSchema = z.object({
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
export const TechnicianIdSchema = z.object({
  id: z.string()
    .min(1, 'El ID del técnico es requerido')
});

export const UserIdSchema = z.object({
  userId: z.string()
    .min(1, 'El ID del usuario es requerido')
});

// Tipos TypeScript derivados de los schemas
export type CreateTechnicianInput = z.infer<typeof CreateTechnicianSchema>;
export type UpdateTechnicianInput = z.infer<typeof UpdateTechnicianSchema>;
export type UpdateTechnicianAvailabilityInput = z.infer<typeof UpdateTechnicianAvailabilitySchema>;
export type TechnicianFiltersInput = z.infer<typeof TechnicianFiltersSchema>;
export type TechnicianSearchInput = z.infer<typeof TechnicianSearchSchema>;