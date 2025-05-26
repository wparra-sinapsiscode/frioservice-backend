import { PrismaClient, UserRole, ClientType, ClientStatus } from '@prisma/client';
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

    // Crear técnicos realistas
    const technicians = [
      {
        username: 'carlos.mendez',
        email: 'carlos.mendez@frioservice.com',
        firstName: 'Carlos',
        lastName: 'Méndez',
        specialty: 'Refrigeración Industrial',
        experienceYears: 8,
        rating: 4.9,
        phone: '+51987654321',
        servicesCompleted: 156
      },
      {
        username: 'ana.torres',
        email: 'ana.torres@frioservice.com',
        firstName: 'Ana',
        lastName: 'Torres',
        specialty: 'Aires Acondicionados',
        experienceYears: 6,
        rating: 4.7,
        phone: '+51976543210',
        servicesCompleted: 128
      },
      {
        username: 'miguel.vasquez',
        email: 'miguel.vasquez@frioservice.com',
        firstName: 'Miguel',
        lastName: 'Vásquez',
        specialty: 'Refrigeración Comercial',
        experienceYears: 10,
        rating: 4.8,
        phone: '+51965432109',
        servicesCompleted: 203
      },
      {
        username: 'lucia.fernandez',
        email: 'lucia.fernandez@frioservice.com',
        firstName: 'Lucía',
        lastName: 'Fernández',
        specialty: 'Mantenimiento Preventivo',
        experienceYears: 5,
        rating: 4.6,
        phone: '+51954321098',
        servicesCompleted: 89
      },
      {
        username: 'roberto.castro',
        email: 'roberto.castro@frioservice.com',
        firstName: 'Roberto',
        lastName: 'Castro',
        specialty: 'Instalación y Reparación',
        experienceYears: 12,
        rating: 4.9,
        phone: '+51943210987',
        servicesCompleted: 267
      }
    ];

    for (const techData of technicians) {
      const techPasswordHash = await hashPassword('tech123');
      
      const tech = await prisma.user.upsert({
        where: { username: techData.username },
        update: {},
        create: {
          username: techData.username,
          email: techData.email,
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
          firstName: techData.firstName,
          lastName: techData.lastName,
          name: `${techData.firstName} ${techData.lastName}`,
          specialty: techData.specialty,
          experienceYears: techData.experienceYears,
          rating: techData.rating,
          phone: techData.phone,
          isAvailable: true,
          servicesCompleted: techData.servicesCompleted,
          averageTime: '2-3 horas'
        }
      });

      console.log(`✅ Técnico creado: ${techData.firstName} ${techData.lastName}`);
    }

    // Crear clientes realistas
    const clients = [
      {
        username: 'restaurante.lameña',
        email: 'gerencia@restaurantelameña.com',
        companyName: 'Restaurante La Meña S.A.C.',
        contactPerson: 'María González',
        businessRegistration: '20567890123',
        phone: '+51987123456',
        clientEmail: 'contacto@restaurantelameña.com',
        emergencyContact: '+51987123457',
        address: 'Av. Pardo 458',
        city: 'Lima',
        district: 'Miraflores',
        postalCode: '15074',
        clientType: ClientType.COMPANY,
        sector: 'Restaurantes',
        preferredSchedule: 'morning',
        totalServices: 23,
        isVip: true,
        discount: 15.0
      },
      {
        username: 'supermercado.fresh',
        email: 'operaciones@superfresh.com.pe',
        companyName: 'Supermercado Fresh Market E.I.R.L.',
        contactPerson: 'Carlos Ramírez',
        businessRegistration: '20456789012',
        phone: '+51976234567',
        clientEmail: 'mantenimiento@superfresh.com.pe',
        emergencyContact: '+51976234568',
        address: 'Av. Javier Prado 2847',
        city: 'Lima',
        district: 'San Borja',
        postalCode: '15036',
        clientType: ClientType.COMPANY,
        sector: 'Retail',
        preferredSchedule: 'evening',
        totalServices: 18,
        isVip: true,
        discount: 12.0
      },
      {
        username: 'hotel.plaza',
        email: 'mantenimiento@hotelplaza.com',
        companyName: 'Hotel Plaza Executive S.A.',
        contactPerson: 'Ana Morales',
        businessRegistration: '20345678901',
        phone: '+51965345678',
        clientEmail: 'servicios@hotelplaza.com',
        emergencyContact: '+51965345679',
        address: 'Jr. de la Unión 827',
        city: 'Lima',
        district: 'Cercado de Lima',
        postalCode: '15001',
        clientType: ClientType.COMPANY,
        sector: 'Hotelería',
        preferredSchedule: 'afternoon',
        totalServices: 31,
        isVip: true,
        discount: 20.0
      },
      {
        username: 'farmacia.salud',
        email: 'administracion@farmaciasalud.pe',
        companyName: 'Farmacia Salud Total S.R.L.',
        contactPerson: 'Dr. Luis Herrera',
        businessRegistration: '20234567890',
        phone: '+51954456789',
        clientEmail: 'info@farmaciasalud.pe',
        emergencyContact: '+51954456790',
        address: 'Av. Brasil 1234',
        city: 'Lima',
        district: 'Jesús María',
        postalCode: '15072',
        clientType: ClientType.COMPANY,
        sector: 'Farmacéutico',
        preferredSchedule: 'morning',
        totalServices: 12,
        isVip: false,
        discount: 5.0
      },
      {
        username: 'panaderia.artesanal',
        email: 'dueño@panaderiaartesanal.com',
        companyName: 'Panadería Artesanal Don Juan E.I.R.L.',
        contactPerson: 'Juan Pérez',
        businessRegistration: '20123456789',
        phone: '+51943567890',
        clientEmail: 'ventas@panaderiaartesanal.com',
        emergencyContact: '+51943567891',
        address: 'Calle Los Pinos 567',
        city: 'Lima',
        district: 'San Miguel',
        postalCode: '15087',
        clientType: ClientType.COMPANY,
        sector: 'Panadería',
        preferredSchedule: 'morning',
        totalServices: 8,
        isVip: false,
        discount: 0.0
      },
      {
        username: 'clinica.moderna',
        email: 'administracion@clinicamoderna.pe',
        companyName: 'Clínica Moderna S.A.',
        contactPerson: 'Dra. Patricia Silva',
        businessRegistration: '20987654321',
        phone: '+51932678901',
        clientEmail: 'servicios@clinicamoderna.pe',
        emergencyContact: '+51932678902',
        address: 'Av. Angamos 1456',
        city: 'Lima',
        district: 'Surquillo',
        postalCode: '15038',
        clientType: ClientType.COMPANY,
        sector: 'Salud',
        preferredSchedule: 'afternoon',
        totalServices: 27,
        isVip: true,
        discount: 18.0
      },
      {
        username: 'carniceria.prime',
        email: 'gerente@carniceriaprime.com',
        companyName: 'Carnicería Prime Cuts S.A.C.',
        contactPerson: 'Ricardo Mendoza',
        businessRegistration: '20876543210',
        phone: '+51921789012',
        clientEmail: 'pedidos@carniceriaprime.com',
        emergencyContact: '+51921789013',
        address: 'Av. Universitaria 2789',
        city: 'Lima',
        district: 'Los Olivos',
        postalCode: '15304',
        clientType: ClientType.COMPANY,
        sector: 'Carnicería',
        preferredSchedule: 'morning',
        totalServices: 15,
        isVip: false,
        discount: 8.0
      },
      {
        username: 'laboratorio.análisis',
        email: 'coordinacion@labanalisis.pe',
        companyName: 'Laboratorio de Análisis Clínicos San Rafael E.I.R.L.',
        contactPerson: 'Mg. Carmen Vega',
        businessRegistration: '20765432109',
        phone: '+51910890123',
        clientEmail: 'resultados@labanalisis.pe',
        emergencyContact: '+51910890124',
        address: 'Calle San Martín 890',
        city: 'Lima',
        district: 'Pueblo Libre',
        postalCode: '15084',
        clientType: ClientType.COMPANY,
        sector: 'Laboratorio',
        preferredSchedule: 'afternoon',
        totalServices: 19,
        isVip: false,
        discount: 10.0
      }
    ];

    for (const clientData of clients) {
      const clientPasswordHash = await hashPassword('client123');
      
      const client = await prisma.user.upsert({
        where: { username: clientData.username },
        update: {},
        create: {
          username: clientData.username,
          email: clientData.email,
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
          companyName: clientData.companyName,
          contactPerson: clientData.contactPerson,
          businessRegistration: clientData.businessRegistration,
          phone: clientData.phone,
          email: clientData.clientEmail,
          emergencyContact: clientData.emergencyContact,
          address: clientData.address,
          city: clientData.city,
          district: clientData.district,
          postalCode: clientData.postalCode,
          clientType: clientData.clientType,
          sector: clientData.sector,
          status: ClientStatus.ACTIVE,
          preferredSchedule: clientData.preferredSchedule,
          totalServices: clientData.totalServices,
          isVip: clientData.isVip,
          discount: clientData.discount,
          notes: clientData.isVip ? 'Cliente VIP - Atención prioritaria' : 'Cliente regular'
        }
      });

      console.log(`✅ Cliente creado: ${clientData.companyName}`);
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📋 Usuarios creados:');
    console.log('- Admin: admin / admin123');
    console.log('\n👷 Técnicos:');
    console.log('- carlos.mendez / tech123');
    console.log('- ana.torres / tech123');
    console.log('- miguel.vasquez / tech123');
    console.log('- lucia.fernandez / tech123');
    console.log('- roberto.castro / tech123');
    console.log('\n🏢 Clientes:');
    console.log('- restaurante.lameña / client123');
    console.log('- supermercado.fresh / client123');
    console.log('- hotel.plaza / client123');
    console.log('- farmacia.salud / client123');
    console.log('- panaderia.artesanal / client123');
    console.log('- clinica.moderna / client123');
    console.log('- carniceria.prime / client123');
    console.log('- laboratorio.análisis / client123');

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