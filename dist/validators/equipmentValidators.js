"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientIdSchema = exports.EquipmentStatusSchema = exports.EquipmentIdSchema = exports.EquipmentFiltersSchema = exports.UpdateEquipmentSchema = exports.CreateEquipmentClientSchema = exports.CreateEquipmentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.CreateEquipmentSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, 'Client ID es requerido'),
    name: zod_1.z.string().min(1, 'Nombre es requerido').max(255, 'Nombre muy largo'),
    model: zod_1.z.string().max(255, 'Modelo muy largo').optional(),
    brand: zod_1.z.string().max(255, 'Marca muy larga').optional(),
    serialNumber: zod_1.z.string().max(255, 'Número de serie muy largo').optional(),
    type: zod_1.z.string().min(1, 'Tipo de equipo es requerido').max(255, 'Tipo muy largo'),
    location: zod_1.z.string().max(255, 'Ubicación muy larga').optional(),
    installDate: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
    warrantyExpiry: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
    notes: zod_1.z.string().max(1000, 'Notas muy largas').optional()
});
exports.CreateEquipmentClientSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, 'Client ID es requerido').optional(),
    name: zod_1.z.string().min(1, 'Nombre es requerido').max(255, 'Nombre muy largo'),
    model: zod_1.z.string().max(255, 'Modelo muy largo').optional(),
    brand: zod_1.z.string().max(255, 'Marca muy larga').optional(),
    serialNumber: zod_1.z.string().max(255, 'Número de serie muy largo').optional(),
    type: zod_1.z.string().min(1, 'Tipo de equipo es requerido').max(255, 'Tipo muy largo'),
    location: zod_1.z.string().max(255, 'Ubicación muy larga').optional(),
    installDate: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
    warrantyExpiry: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
    notes: zod_1.z.string().max(1000, 'Notas muy largas').optional()
});
exports.UpdateEquipmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nombre es requerido').max(255, 'Nombre muy largo').optional(),
    model: zod_1.z.string().max(255, 'Modelo muy largo').optional(),
    brand: zod_1.z.string().max(255, 'Marca muy larga').optional(),
    serialNumber: zod_1.z.string().max(255, 'Número de serie muy largo').optional(),
    type: zod_1.z.string().min(1, 'Tipo de equipo es requerido').max(255, 'Tipo muy largo').optional(),
    location: zod_1.z.string().max(255, 'Ubicación muy larga').optional(),
    installDate: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
    warrantyExpiry: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
    status: zod_1.z.nativeEnum(client_1.EquipmentStatus).optional(),
    notes: zod_1.z.string().max(1000, 'Notas muy largas').optional()
});
exports.EquipmentFiltersSchema = zod_1.z.object({
    clientId: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.EquipmentStatus).optional(),
    type: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    page: zod_1.z.string().regex(/^\d+$/, 'Página debe ser un número').optional(),
    limit: zod_1.z.string().regex(/^\d+$/, 'Límite debe ser un número').optional()
});
exports.EquipmentIdSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Equipment ID es requerido')
});
exports.EquipmentStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.EquipmentStatus, {
        errorMap: () => ({ message: 'Estado de equipo inválido' })
    })
});
exports.ClientIdSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, 'Client ID es requerido')
});
//# sourceMappingURL=equipmentValidators.js.map