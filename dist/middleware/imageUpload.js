"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleAndOptimize = exports.uploadAndOptimize = exports.optimizeImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
        }
    }
});
const optimizeImage = async (req, _res, next) => {
    try {
        if (!req.file) {
            return next();
        }
        const uploadsDir = path_1.default.join(process.cwd(), 'public', 'uploads');
        await promises_1.default.mkdir(uploadsDir, { recursive: true });
        const filename = `${path_1.default.parse(req.file.originalname).name}-${Date.now()}.webp`;
        const filepath = path_1.default.join(uploadsDir, filename);
        await (0, sharp_1.default)(req.file.buffer)
            .resize(800, 600, {
            fit: 'inside',
            withoutEnlargement: true
        })
            .webp({
            quality: 80,
            effort: 6
        })
            .toFile(filepath);
        req.file.filename = filename;
        req.file.path = filepath;
        next();
    }
    catch (error) {
        console.error('Error optimizando imagen:', error);
        next(error);
    }
};
exports.optimizeImage = optimizeImage;
exports.uploadAndOptimize = [
    exports.upload.single('image'),
    exports.optimizeImage
];
exports.uploadMultipleAndOptimize = [
    exports.upload.array('images', 10),
    async (req, _res, next) => {
        try {
            if (!req.files || !Array.isArray(req.files)) {
                return next();
            }
            const uploadsDir = path_1.default.join(process.cwd(), 'public', 'uploads');
            await promises_1.default.mkdir(uploadsDir, { recursive: true });
            const processedFiles = [];
            for (const file of req.files) {
                const filename = `${path_1.default.parse(file.originalname).name}-${Date.now()}.webp`;
                const filepath = path_1.default.join(uploadsDir, filename);
                await (0, sharp_1.default)(file.buffer)
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
        }
        catch (error) {
            console.error('Error optimizando imágenes múltiples:', error);
            next(error);
        }
    }
];
//# sourceMappingURL=imageUpload.js.map