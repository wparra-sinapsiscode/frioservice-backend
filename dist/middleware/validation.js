"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateServiceCreation = exports.validateEquipmentCreation = exports.validateQuery = exports.validateParams = exports.validateBody = void 0;
const zod_1 = require("zod");
const formatZodError = (error) => {
    return error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
};
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.validatedBody = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos en el cuerpo',
                    errors: formatZodError(error),
                });
                return;
            }
            console.error('Error inesperado en validateBody:', error);
            next(error);
        }
    };
};
exports.validateBody = validateBody;
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.params);
            req.validatedParams = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Parámetros de ruta inválidos',
                    errors: formatZodError(error),
                });
                return;
            }
            console.error('Error inesperado en validateParams:', error);
            next(error);
        }
    };
};
exports.validateParams = validateParams;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.query);
            req.validatedQuery = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Parámetros de consulta inválidos',
                    errors: formatZodError(error),
                });
                return;
            }
            console.error('Error inesperado en validateQuery:', error);
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
const validateEquipmentCreation = (adminSchema, clientSchema) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role;
            const schema = userRole === 'CLIENT' ? clientSchema : adminSchema;
            const validatedData = schema.parse(req.body);
            req.validatedBody = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos en el cuerpo',
                    errors: formatZodError(error),
                });
                return;
            }
            console.error('Error inesperado en validateEquipmentCreation:', error);
            next(error);
        }
    };
};
exports.validateEquipmentCreation = validateEquipmentCreation;
const validateServiceCreation = (adminSchema, clientSchema) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role;
            const schema = userRole === 'CLIENT' ? clientSchema : adminSchema;
            const validatedData = schema.parse(req.body);
            req.validatedBody = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos en el cuerpo',
                    errors: formatZodError(error),
                });
                return;
            }
            console.error('Error inesperado en validateServiceCreation:', error);
            next(error);
        }
    };
};
exports.validateServiceCreation = validateServiceCreation;
//# sourceMappingURL=validation.js.map