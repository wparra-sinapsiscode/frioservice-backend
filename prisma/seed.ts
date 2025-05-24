import { PrismaClient, UserRole, ClientType } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Crear usuario administrador
    const adminPasswordHash = await hashPassword('admin123');
    
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@frioservice.com',
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        isActive: true
      }
    });

    console.log('✅ Usuario admin creado:', admin.username);

    // Crear usuario técnico de prueba
    const techPasswordHash = await hashPassword('tech123');
    
    const tech = await prisma.user.upsert({
      where: { username: 'tecnico1' },
      update: {},
      create: {
        username: 'tecnico1',
        email: 'tecnico1@frioservice.com',
        passwordHash: techPasswordHash,
        role: UserRole.TECHNICIAN,
        isActive: true
      }
    });

    await prisma.technician.upsert({
      where: { userId: tech.id },
      update: {},
      create: {
        userId: tech.id,
        specialty: 'Refrigeración Industrial',
        experienceYears: 5,
        phone: '+123456789',
        isAvailable: true
      }
    });

    console.log('✅ Usuario técnico creado:', tech.username);

    // Crear usuario cliente de prueba
    const clientPasswordHash = await hashPassword('client123');
    
    const client = await prisma.user.upsert({
      where: { username: 'cliente1' },
      update: {},
      create: {
        username: 'cliente1',
        email: 'cliente1@empresa.com',
        passwordHash: clientPasswordHash,
        role: UserRole.CLIENT,
        isActive: true
      }
    });

    await prisma.client.upsert({
      where: { userId: client.id },
      update: {},
      create: {
        userId: client.id,
        companyName: 'Empresa Test S.A.',
        contactPerson: 'Juan Pérez',
        phone: '+987654321',
        address: 'Calle Principal 123',
        city: 'Ciudad Test',
        clientType: ClientType.COMPANY,
        isVip: false
      }
    });

    console.log('✅ Usuario cliente creado:', client.username);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📋 Usuarios creados:');
    console.log('- Admin: admin / admin123');
    console.log('- Técnico: tecnico1 / tech123');
    console.log('- Cliente: cliente1 / client123');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });