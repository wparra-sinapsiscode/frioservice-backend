"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const auth_1 = require("../utils/auth");
const prisma = new client_1.PrismaClient();
class AuthService {
    static async register(data) {
        try {
            const { username, email, password, role, additionalData } = data;
            if (!username || !email || !password) {
                throw new Error('Username, email y password son requeridos');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Formato de email inválido');
            }
            if (password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username },
                        { email }
                    ]
                }
            });
            if (existingUser) {
                if (existingUser.username === username) {
                    throw new Error('El nombre de usuario ya está en uso');
                }
                if (existingUser.email === email) {
                    throw new Error('El email ya está registrado');
                }
            }
            const passwordHash = await (0, auth_1.hashPassword)(password);
            const result = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        username,
                        email,
                        passwordHash,
                        role,
                    }
                });
                if (role === client_1.UserRole.CLIENT) {
                    await tx.client.create({
                        data: {
                            userId: user.id,
                            companyName: additionalData?.companyName || null,
                            contactPerson: additionalData?.contactPerson || null,
                            phone: additionalData?.phone || null,
                            address: additionalData?.address || null,
                            city: additionalData?.city || null,
                            clientType: additionalData?.clientType || client_1.ClientType.PERSONAL,
                        }
                    });
                }
                else if (role === client_1.UserRole.TECHNICIAN) {
                    await tx.technician.create({
                        data: {
                            userId: user.id,
                            specialty: additionalData?.specialty || 'General',
                            experienceYears: additionalData?.experienceYears || 0,
                            rating: additionalData?.rating || 5.0,
                            phone: additionalData?.phone || null,
                        }
                    });
                }
                return user;
            });
            const token = (0, auth_1.generateToken)({
                userId: result.id,
                username: result.username,
                role: result.role
            });
            const userWithProfile = await this.getProfile(result.id);
            return {
                token,
                user: userWithProfile
            };
        }
        catch (error) {
            console.error('Error en AuthService.register:', error);
            throw error;
        }
    }
    static async login(data) {
        try {
            console.log('🔥 AuthService.login - Iniciando con datos:', { username: data.username });
            const { username, password } = data;
            if (!username || !password) {
                console.log('🔥 AuthService.login - Datos faltantes');
                throw new Error('Username y password son requeridos');
            }
            console.log('🔥 AuthService.login - Buscando usuario en BD:', username);
            const user = await prisma.user.findUnique({
                where: { username },
                include: {
                    client: true,
                    technician: true
                }
            });
            console.log('🔥 AuthService.login - Usuario encontrado:', !!user);
            if (user) {
                console.log('🔥 AuthService.login - Detalles usuario:', {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    isActive: user.isActive,
                    hasClient: !!user.client,
                    hasTechnician: !!user.technician
                });
            }
            if (!user) {
                console.log('🔥 AuthService.login - Usuario no encontrado');
                throw new Error('Credenciales inválidas');
            }
            if (!user.isActive) {
                console.log('🔥 AuthService.login - Usuario inactivo');
                throw new Error('Credenciales inválidas');
            }
            console.log('🔥 AuthService.login - Verificando password');
            const isValidPassword = await (0, auth_1.comparePassword)(password, user.passwordHash);
            console.log('🔥 AuthService.login - Password válido:', isValidPassword);
            if (!isValidPassword) {
                console.log('🔥 AuthService.login - Password inválido');
                throw new Error('Credenciales inválidas');
            }
            if (user.role === client_1.UserRole.CLIENT && user.client) {
                console.log('🔥 AuthService.login - Verificando estado del cliente:', user.client.status);
                if (user.client.status === 'INACTIVE') {
                    throw new Error('Su cuenta se encuentra inactiva. Contacte al administrador para más información.');
                }
            }
            console.log('🔥 AuthService.login - Generando token');
            const token = (0, auth_1.generateToken)({
                userId: user.id,
                username: user.username,
                role: user.role
            });
            console.log('🔥 AuthService.login - Token generado, preparando respuesta');
            const response = {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profile: user.client || user.technician || null
                }
            };
            console.log('🔥 AuthService.login - Login exitoso para usuario:', user.username);
            return response;
        }
        catch (error) {
            console.error('🔥 AuthService.login - Error:', error);
            throw error;
        }
    }
    static async getProfile(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    client: true,
                    technician: true
                }
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            if (!user.isActive) {
                throw new Error('Usuario desactivado');
            }
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                profile: user.client || user.technician || null
            };
        }
        catch (error) {
            console.error('Error en AuthService.getProfile:', error);
            throw error;
        }
    }
    static async updateProfile(userId, updateData) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    client: true,
                    technician: true
                }
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            await prisma.$transaction(async (tx) => {
                if (updateData.email) {
                    await tx.user.update({
                        where: { id: userId },
                        data: { email: updateData.email }
                    });
                }
                if (user.role === client_1.UserRole.CLIENT && user.client) {
                    await tx.client.update({
                        where: { userId },
                        data: {
                            ...(updateData.companyName && { companyName: updateData.companyName }),
                            ...(updateData.contactPerson && { contactPerson: updateData.contactPerson }),
                            ...(updateData.phone && { phone: updateData.phone }),
                            ...(updateData.address && { address: updateData.address }),
                            ...(updateData.city && { city: updateData.city }),
                            ...(updateData.clientType && { clientType: updateData.clientType }),
                        }
                    });
                }
                else if (user.role === client_1.UserRole.TECHNICIAN && user.technician) {
                    await tx.technician.update({
                        where: { userId },
                        data: {
                            ...(updateData.specialty && { specialty: updateData.specialty }),
                            ...(updateData.experienceYears && { experienceYears: updateData.experienceYears }),
                            ...(updateData.phone && { phone: updateData.phone }),
                            ...(updateData.isAvailable !== undefined && { isAvailable: updateData.isAvailable }),
                        }
                    });
                }
            });
            return await this.getProfile(userId);
        }
        catch (error) {
            console.error('Error en AuthService.updateProfile:', error);
            throw error;
        }
    }
    static async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const isValidPassword = await (0, auth_1.comparePassword)(currentPassword, user.passwordHash);
            if (!isValidPassword) {
                throw new Error('Contraseña actual incorrecta');
            }
            if (newPassword.length < 6) {
                throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
            }
            const newPasswordHash = await (0, auth_1.hashPassword)(newPassword);
            await prisma.user.update({
                where: { id: userId },
                data: { passwordHash: newPasswordHash }
            });
            return { message: 'Contraseña actualizada exitosamente' };
        }
        catch (error) {
            console.error('Error en AuthService.changePassword:', error);
            throw error;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map