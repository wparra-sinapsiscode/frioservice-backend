"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imageUpload_1 = require("../middleware/imageUpload");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/single', auth_1.authenticate, imageUpload_1.uploadAndOptimize, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error en upload single:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: 'UPLOAD_FAILED'
        });
    }
});
router.post('/multiple', auth_1.authenticate, imageUpload_1.uploadMultipleAndOptimize, async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({
                success: false,
                message: 'No se proporcionaron imágenes'
            });
            return;
        }
        const uploadedFiles = req.files.map((file) => ({
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
    }
    catch (error) {
        console.error('Error en upload multiple:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: 'UPLOAD_FAILED'
        });
    }
});
router.post('/test', imageUpload_1.uploadAndOptimize, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error en upload test:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: 'UPLOAD_FAILED'
        });
    }
});
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map