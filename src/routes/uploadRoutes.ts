import { Router, Request, Response } from 'express';
import { uploadAndOptimize, uploadMultipleAndOptimize } from '../middleware/imageUpload';
import { authenticate } from '../middleware/auth';

const router = Router();

// Subir una imagen individual
router.post('/single', authenticate, uploadAndOptimize, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Imagen subida y optimizada exitosamente',
      data: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        originalName: req.file.originalname
      }
    });

  } catch (error) {
    console.error('Error en upload single:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'UPLOAD_FAILED'
    });
  }
});

// Subir múltiples imágenes
router.post('/multiple', authenticate, uploadMultipleAndOptimize, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionaron imágenes'
      });
      return;
    }

    const uploadedFiles = req.files.map((file: any) => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      originalName: file.originalname
    }));

    res.status(200).json({
      success: true,
      message: `${req.files.length} imágenes subidas y optimizadas exitosamente`,
      data: {
        files: uploadedFiles,
        count: req.files.length
      }
    });

  } catch (error) {
    console.error('Error en upload multiple:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'UPLOAD_FAILED'
    });
  }
});

// Endpoint de prueba sin autenticación (solo para desarrollo)
router.post('/test', uploadAndOptimize, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Imagen de prueba subida exitosamente',
      data: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        originalName: req.file.originalname
      }
    });

  } catch (error) {
    console.error('Error en upload test:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'UPLOAD_FAILED'
    });
  }
});

export default router;