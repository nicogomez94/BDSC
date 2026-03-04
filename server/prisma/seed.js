import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear usuario coordinador por defecto
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const coordinador = await prisma.user.upsert({
    where: { email: 'coordinador@bdsc.com' },
    update: {},
    create: {
      email: 'coordinador@bdsc.com',
      passwordHash: hashedPassword,
      role: 'COORDINADOR',
    },
  });

  console.log('✅ Usuario coordinador creado:', coordinador.email);

  // Crear algunos entrenadores de ejemplo
  const trainer1 = await prisma.trainer.create({
    data: {
      name: 'Juan Pérez',
      slug: 'juan-perez',
      bio: 'Entrenador de hockey con 10 años de experiencia',
      specialty: 'Defensa',
      photoUrl: 'https://via.placeholder.com/300',
    },
  });

  const trainer2 = await prisma.trainer.create({
    data: {
      name: 'María González',
      slug: 'maria-gonzalez',
      bio: 'Especialista en técnicas de ataque',
      specialty: 'Ataque',
      photoUrl: 'https://via.placeholder.com/300',
    },
  });

  console.log('✅ Entrenadores de ejemplo creados');

  // Crear usuarios para los entrenadores
  const hashedTrainerPass = await bcrypt.hash('trainer123', 10);

  await prisma.user.create({
    data: {
      email: 'juan.perez@bdsc.com',
      passwordHash: hashedTrainerPass,
      role: 'ENTRENADOR',
      trainerId: trainer1.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'maria.gonzalez@bdsc.com',
      passwordHash: hashedTrainerPass,
      role: 'ENTRENADOR',
      trainerId: trainer2.id,
    },
  });

  console.log('✅ Usuarios entrenadores creados');

  // Crear secciones de ejemplo
  const section1 = await prisma.section.create({
    data: {
      title: 'Planificación Semanal',
      content: 'Aquí va la planificación de entrenamientos de la semana',
    },
  });

  const section2 = await prisma.section.create({
    data: {
      title: 'Documentos Técnicos',
      content: 'Material técnico y estratégico para entrenadores',
    },
  });

  console.log('✅ Secciones de ejemplo creadas');

  // Asignar accesos
  await prisma.sectionAccess.create({
    data: {
      sectionId: section1.id,
      trainerId: trainer1.id,
    },
  });

  await prisma.sectionAccess.create({
    data: {
      sectionId: section1.id,
      trainerId: trainer2.id,
    },
  });

  await prisma.sectionAccess.create({
    data: {
      sectionId: section2.id,
      trainerId: trainer1.id,
    },
  });

  console.log('✅ Accesos asignados');
  console.log('\n📋 Credenciales de acceso:');
  console.log('Coordinador: coordinador@bdsc.com / admin123');
  console.log('Entrenador 1: juan.perez@bdsc.com / trainer123');
  console.log('Entrenador 2: maria.gonzalez@bdsc.com / trainer123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
