import { z } from 'zod';
import { EquipmentStatus } from '@prisma/client';

// Schema para crear equipo
export const CreateEquipmentSchema = z.object({
  clientId: z.string().min(1, 'Client ID es requerido'),
  name: z.string().min(1, 'Nombre es requerido').max(255, 'Nombre muy largo'),
  model: z.string().max(255, 'Modelo muy largo').optional(),
  brand: z.string().max(255, 'Marca muy larga').optional(),
  serialNumber: z.string().max(255, 'Número de serie muy largo').optional(),
  type: z.string().min(1, 'Tipo de equipo es requerido').max(255, 'Tipo muy largo'),
  location: z.string().max(255, 'Ubicación muy larga').optional(),
  installDate: z.string().datetime().optional().or(z.date().optional()),
  warrantyExpiry: z.string().datetime().optional().or(z.date().optional()),
  notes: z.string().max(1000, 'Notas muy largas').optional()
});

// Schema para actualizar equipo
export const UpdateEquipmentSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255, 'Nombre muy largo').optional(),
  model: z.string().max(255, 'Modelo muy largo').optional(),
  brand: z.string().max(255, 'Marca muy larga').optional(),
  serialNumber: z.string().max(255, 'Número de serie muy largo').optional(),
  type: z.string().min(1, 'Tipo de equipo es requerido').max(255, 'Tipo muy largo').optional(),
  location: z.string().max(255, 'Ubicación muy larga').optional(),
  installDate: z.string().datetime().optional().or(z.date().optional()),
  warrantyExpiry: z.string().datetime().optional().or(z.date().optional()),
  status: z.nativeEnum(EquipmentStatus).optional(),
  notes: z.string().max(1000, 'Notas muy largas').optional()
});

// Schema para filtros de búsqueda
export const EquipmentFiltersSchema = z.object({
  clientId: z.string().optional(),
  status: z.nativeEnum(EquipmentStatus).optional(),
  type: z.string().optional(),
  brand: z.string().optional(),
  page: z.string().regex(/^\d+$/, 'Página debe ser un número').optional(),
  limit: z.string().regex(/^\d+$/, 'Límite debe ser un número').optional()
});

// Schema para ID de equipo
export const EquipmentIdSchema = z.object({
  id: z.string().min(1, 'Equipment ID es requerido')
});

// Schema para actualizar estado
export const EquipmentStatusSchema = z.object({
  status: z.nativeEnum(EquipmentStatus, {
    errorMap: () => ({ message: 'Estado de equipo inválido' })
  })
});

// Schema para ID de cliente
export const ClientIdSchema = z.object({
  clientId: z.string().min(1, 'Client ID es requerido')
});