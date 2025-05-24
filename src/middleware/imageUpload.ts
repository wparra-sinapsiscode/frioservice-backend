import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';

// Configurar multer para usar memoria
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (_req, file, cb) => {
    // Permitir solo imágenes
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Middleware para optimizar imágenes
export const optimizeImage = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next();
    }

    // Crear directorio uploads si no existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generar nombre único para la imagen
    const filename = `${path.parse(req.file.originalname).name}-${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);

    // Optimizar y convertir a WebP
    await sharp(req.file.buffer)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ 
        quality: 80,
        effort: 6 
      })
      .toFile(filepath);

    // Agregar información del archivo procesado al request
    req.file.filename = filename;
    req.file.path = filepath;

    next();
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    next(error);
  }
};

// Middleware combinado para upload y optimización
export const uploadAndOptimize = [
  upload.single('image'),
  optimizeImage
];

// Para múltiples archivos
export const uploadMultipleAndOptimize = [
  upload.array('images', 10), // máximo 10 imágenes
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return next();
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const processedFiles = [];

      for (const file of req.files) {
        const filename = `${path.parse(file.originalname).name}-${Date.now()}.webp`;
        const filepath = path.join(uploadsDir, filename);

        await sharp(file.buffer)
          .resize(800, 600, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .webp({ 
            quality: 80,
            effort: 6 
          })
          .toFile(filepath);

        processedFiles.push({
          ...file,
          filename,
          path: filepath
        });
      }

      req.files = processedFiles;
      next();
    } catch (error) {
      console.error('Error optimizando imágenes múltiples:', error);
      next(error);
    }
  }
];