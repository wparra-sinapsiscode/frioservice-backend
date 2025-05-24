import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

interface FormattedZodError {
  field: string;
  message: string;
}

const formatZodError = (error: ZodError): FormattedZodError[] => {
  return error.errors.map((err: ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
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
      req.params = schema.parse(req.params);
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
      req.query = schema.parse(req.query);
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