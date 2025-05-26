import { PrismaClient, UserRole, ClientType } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const prisma = new PrismaClient();

// Interface para datos de registro
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  // Datos adicionales según el rol
  additionalData?: {
    // Para clientes
    companyName?: string;
    contactPerson?: string;
    address?: string;
    city?: string;
    clientType?: ClientType;
    // Para técnicos
    specialty?: string;
    experienceYears?: number;
    rating?: number;
    // Para ambos
    phone?: string;
  };
}

// Interface para datos de login
export interface LoginData {
  username: string;
  password: string;
}

// Interface para respuesta de autenticación
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    profile?: any;
  };
}

export class AuthService {
  /**
   * Registrar un nuevo usuario
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const { username, email, password, role, additionalData } = data;

      // Validar datos requeridos
      if (!username || !email || !password) {
        throw new Error('Username, email y password son requeridos');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Formato de email inválido');
      }

      // Validar longitud de password
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Verificar si el usuario ya existe
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

      // Hash password
      const passwordHash = await hashPassword(password);

      // Crear usuario en una transacción
      const result = await prisma.$transaction(async (tx) => {
        // Crear usuario base
        const user = await tx.user.create({
          data: {
            username,
            email,
            passwordHash,
            role,
          }
        });

        // Crear perfil específico según rol
        if (role === UserRole.CLIENT) {
          await tx.client.create({
            data: {
              userId: user.id,
              companyName: additionalData?.companyName || null,
              contactPerson: additionalData?.contactPerson || null,
              phone: additionalData?.phone || null,
              address: additionalData?.address || null,
              city: additionalData?.city || null,
              clientType: additionalData?.clientType || ClientType.PERSONAL,
            }
          });
        } else if (role === UserRole.TECHNICIAN) {
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

      // Generar token
      const token = generateToken({
        userId: result.id,
        username: result.username,
        role: result.role
      });

      // Obtener perfil completo
      const userWithProfile = await this.getProfile(result.id);

      return {
        token,
        user: userWithProfile
      };

    } catch (error) {
      console.error('Error en AuthService.register:', error);
      throw error;
    }
  }

  /**
   * Iniciar sesión
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('🔥 AuthService.login - Iniciando con datos:', { username: data.username });
      
      const { username, password } = data;

      // Validar datos requeridos
      if (!username || !password) {
        console.log('🔥 AuthService.login - Datos faltantes');
        throw new Error('Username y password son requeridos');
      }

      console.log('🔥 AuthService.login - Buscando usuario en BD:', username);
      
      // Buscar usuario con perfil
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
      
      // Verificar password
      const isValidPassword = await comparePassword(password, user.passwordHash);
      console.log('🔥 AuthService.login - Password válido:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('🔥 AuthService.login - Password inválido');
        throw new Error('Credenciales inválidas');
      }

      // Verificar estado del cliente si es un usuario CLIENT
      if (user.role === UserRole.CLIENT && user.client) {
        console.log('🔥 AuthService.login - Verificando estado del cliente:', user.client.status);
        if (user.client.status === 'INACTIVE') {
          throw new Error('Su cuenta se encuentra inactiva. Contacte al administrador para más información.');
        }
      }

      console.log('🔥 AuthService.login - Generando token');
      
      // Generar token
      const token = generateToken({
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

    } catch (error) {
      console.error('🔥 AuthService.login - Error:', error);
      throw error;
    }
  }

  /**
   * Obtener perfil de usuario
   */
  static async getProfile(userId: string) {
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

    } catch (error) {
      console.error('Error en AuthService.getProfile:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  static async updateProfile(userId: string, updateData: any) {
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
        // Actualizar datos base del usuario si se proporcionan
        if (updateData.email) {
          await tx.user.update({
            where: { id: userId },
            data: { email: updateData.email }
          });
        }

        // Actualizar perfil específico según rol
        if (user.role === UserRole.CLIENT && user.client) {
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
        } else if (user.role === UserRole.TECHNICIAN && user.technician) {
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

      // Retornar perfil actualizado
      return await this.getProfile(userId);

    } catch (error) {
      console.error('Error en AuthService.updateProfile:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Validar nueva contraseña
      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      // Hash nueva contraseña
      const newPasswordHash = await hashPassword(newPassword);

      // Actualizar contraseña
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash }
      });

      return { message: 'Contraseña actualizada exitosamente' };

    } catch (error) {
      console.error('Error en AuthService.changePassword:', error);
      throw error;
    }
  }
}