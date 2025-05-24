import { z } from 'zod';
import { QuoteStatus } from '@prisma/client';

// Schema para crear cotización
export const CreateQuoteSchema = z.object({
  serviceId: z.string().min(1, 'Service ID es requerido').optional(),
  clientId: z.string().min(1, 'Client ID es requerido'),
  title: z.string().min(1, 'Título es requerido').max(255, 'Título muy largo'),
  description: z.string().max(1000, 'Descripción muy larga').optional(),
  amount: z.number().positive('El monto debe ser positivo').or(
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Formato de monto inválido')
      .transform(val => parseFloat(val))
      .refine(val => val > 0, 'El monto debe ser positivo')
  ),
  validUntil: z.string().datetime('Fecha de validez inválida').or(z.date()),
  notes: z.string().max(1000, 'Notas muy largas').optional()
});

// Schema para actualizar cotización
export const UpdateQuoteSchema = z.object({
  title: z.string().min(1, 'Título es requerido').max(255, 'Título muy largo').optional(),
  description: z.string().max(1000, 'Descripción muy larga').optional(),
  amount: z.number().positive('El monto debe ser positivo').or(
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Formato de monto inválido')
      .transform(val => parseFloat(val))
      .refine(val => val > 0, 'El monto debe ser positivo')
  ).optional(),
  status: z.nativeEnum(QuoteStatus).optional(),
  validUntil: z.string().datetime('Fecha de validez inválida').or(z.date()).optional(),
  notes: z.string().max(1000, 'Notas muy largas').optional()
});

// Schema para filtros de búsqueda
export const QuoteFiltersSchema = z.object({
  status: z.nativeEnum(QuoteStatus).optional(),
  clientId: z.string().optional(),
  serviceId: z.string().optional(),
  page: z.string().regex(/^\d+$/, 'Página debe ser un número').optional(),
  limit: z.string().regex(/^\d+$/, 'Límite debe ser un número').optional()
});

// Schema para ID de cotización
export const QuoteIdSchema = z.object({
  id: z.string().min(1, 'Quote ID es requerido')
});

// Schema para ID de cliente
export const ClientIdSchema = z.object({
  clientId: z.string().min(1, 'Client ID es requerido')
});

// Schema para paginación simple
export const PaginationSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Página debe ser un número').optional(),
  limit: z.string().regex(/^\d+$/, 'Límite debe ser un número').optional()
});

// Schema para aprobar/rechazar cotización
export const QuoteActionSchema = z.object({
  notes: z.string().max(1000, 'Notas muy largas').optional()
});