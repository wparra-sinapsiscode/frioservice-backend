import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

// Interfaz para el error formateado (sin cambios)
interface FormattedZodError {
  field: string;
  message: string;
}

// Función para formatear el error de Zod (sin cambios)
const formatZodError = (error: ZodError): FormattedZodError[] => {
  return error.errors.map((err: ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};


// --- FUNCIONES CORREGIDAS ---

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      // Adjuntamos los datos validados a una nueva propiedad
      (req as any).validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
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

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      // Adjuntamos los datos validados a una nueva propiedad
      (req as any).validatedParams = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
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

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // *** LA CORRECCIÓN CLAVE ESTÁ AQUÍ ***
      const validatedData = schema.parse(req.query);
      
      // No reasignamos req.query. Creamos una nueva propiedad.
      // Usamos `(req as any)` para que TypeScript nos permita añadir una propiedad personalizada.
      (req as any).validatedQuery = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
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

// Custom validation for equipment creation based on user role
export const validateEquipmentCreation = (adminSchema: ZodSchema, clientSchema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userRole = (req as any).user?.role;
      const schema = userRole === 'CLIENT' ? clientSchema : adminSchema;
      
      const validatedData = schema.parse(req.body);
      (req as any).validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
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

// Custom validation for service creation based on user role
export const validateServiceCreation = (adminSchema: ZodSchema, clientSchema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userRole = (req as any).user?.role;
      const schema = userRole === 'CLIENT' ? clientSchema : adminSchema;
      
      const validatedData = schema.parse(req.body);
      (req as any).validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
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