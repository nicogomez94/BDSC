import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const findOrCreateSection = async ({ title, content }) => {
  const existing = await prisma.section.findFirst({ where: { title } });
  if (existing) return existing;
  return prisma.section.create({ data: { title, content } });
};

const findOrCreatePlayer = async ({ divisionId, fullName, birthYear, active = true }) => {
  const existing = await prisma.player.findFirst({
    where: { divisionId, fullName },
  });

  if (existing) {
    return prisma.player.update({
      where: { id: existing.id },
      data: { birthYear, active },
    });
  }

  return prisma.player.create({
    data: {
      divisionId,
      fullName,
      birthYear,
      active,
    },
  });
};

async function main() {
  console.log('🌱 Iniciando seed...');

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedTrainerPassword = await bcrypt.hash('trainer123', 10);

  const coordinador = await prisma.user.upsert({
    where: { email: 'coordinador@bdsc.com' },
    update: {
      passwordHash: hashedAdminPassword,
      role: 'COORDINADOR',
    },
    create: {
      email: 'coordinador@bdsc.com',
      passwordHash: hashedAdminPassword,
      role: 'COORDINADOR',
    },
  });

  const trainer1 = await prisma.trainer.upsert({
    where: { slug: 'juan-perez' },
    update: {
      name: 'Juan Pérez',
      bio: 'Entrenador de hockey con 10 años de experiencia',
      specialty: 'Defensa',
      photoUrl: 'https://via.placeholder.com/300',
    },
    create: {
      name: 'Juan Pérez',
      slug: 'juan-perez',
      bio: 'Entrenador de hockey con 10 años de experiencia',
      specialty: 'Defensa',
      photoUrl: 'https://via.placeholder.com/300',
    },
  });

  const trainer2 = await prisma.trainer.upsert({
    where: { slug: 'maria-gonzalez' },
    update: {
      name: 'María González',
      bio: 'Especialista en técnicas de ataque',
      specialty: 'Ataque',
      photoUrl: 'https://via.placeholder.com/300',
    },
    create: {
      name: 'María González',
      slug: 'maria-gonzalez',
      bio: 'Especialista en técnicas de ataque',
      specialty: 'Ataque',
      photoUrl: 'https://via.placeholder.com/300',
    },
  });

  await prisma.user.upsert({
    where: { email: 'juan.perez@bdsc.com' },
    update: {
      passwordHash: hashedTrainerPassword,
      role: 'ENTRENADOR',
      trainerId: trainer1.id,
    },
    create: {
      email: 'juan.perez@bdsc.com',
      passwordHash: hashedTrainerPassword,
      role: 'ENTRENADOR',
      trainerId: trainer1.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'maria.gonzalez@bdsc.com' },
    update: {
      passwordHash: hashedTrainerPassword,
      role: 'ENTRENADOR',
      trainerId: trainer2.id,
    },
    create: {
      email: 'maria.gonzalez@bdsc.com',
      passwordHash: hashedTrainerPassword,
      role: 'ENTRENADOR',
      trainerId: trainer2.id,
    },
  });

  const section1 = await findOrCreateSection({
    title: 'Planificación Semanal',
    content: 'Aquí va la planificación de entrenamientos de la semana',
  });

  const section2 = await findOrCreateSection({
    title: 'Documentos Técnicos',
    content: 'Material técnico y estratégico para entrenadores',
  });

  await prisma.sectionAccess.upsert({
    where: { sectionId_trainerId: { sectionId: section1.id, trainerId: trainer1.id } },
    update: {},
    create: { sectionId: section1.id, trainerId: trainer1.id },
  });

  await prisma.sectionAccess.upsert({
    where: { sectionId_trainerId: { sectionId: section1.id, trainerId: trainer2.id } },
    update: {},
    create: { sectionId: section1.id, trainerId: trainer2.id },
  });

  await prisma.sectionAccess.upsert({
    where: { sectionId_trainerId: { sectionId: section2.id, trainerId: trainer1.id } },
    update: {},
    create: { sectionId: section2.id, trainerId: trainer1.id },
  });

  const division9na = await prisma.division.upsert({
    where: { name_seasonYear: { name: '9na', seasonYear: 2026 } },
    update: {},
    create: {
      name: '9na',
      seasonYear: 2026,
    },
  });

  const division8va = await prisma.division.upsert({
    where: { name_seasonYear: { name: '8va', seasonYear: 2026 } },
    update: {},
    create: {
      name: '8va',
      seasonYear: 2026,
    },
  });

  await prisma.trainerDivisionAccess.upsert({
    where: { trainerId_divisionId: { trainerId: trainer1.id, divisionId: division9na.id } },
    update: {},
    create: { trainerId: trainer1.id, divisionId: division9na.id },
  });

  await prisma.trainerDivisionAccess.upsert({
    where: { trainerId_divisionId: { trainerId: trainer2.id, divisionId: division8va.id } },
    update: {},
    create: { trainerId: trainer2.id, divisionId: division8va.id },
  });

  await prisma.trainerDivisionAccess.upsert({
    where: { trainerId_divisionId: { trainerId: trainer1.id, divisionId: division8va.id } },
    update: {},
    create: { trainerId: trainer1.id, divisionId: division8va.id },
  });

  const players9na = await Promise.all([
    findOrCreatePlayer({ divisionId: division9na.id, fullName: 'Agustina Ruiz', birthYear: 2011 }),
    findOrCreatePlayer({ divisionId: division9na.id, fullName: 'Valentina Sosa', birthYear: 2011 }),
    findOrCreatePlayer({ divisionId: division9na.id, fullName: 'Josefina Díaz', birthYear: 2012 }),
    findOrCreatePlayer({ divisionId: division9na.id, fullName: 'Lara Gaitán', birthYear: 2011 }),
  ]);

  const players8va = await Promise.all([
    findOrCreatePlayer({ divisionId: division8va.id, fullName: 'Martina Quiroga', birthYear: 2010 }),
    findOrCreatePlayer({ divisionId: division8va.id, fullName: 'Camila Benítez', birthYear: 2010 }),
    findOrCreatePlayer({ divisionId: division8va.id, fullName: 'Abril Medina', birthYear: 2009 }),
    findOrCreatePlayer({ divisionId: division8va.id, fullName: 'Renata López', birthYear: 2010 }),
  ]);

  const division9naDates = ['2026-02-10', '2026-03-07', '2026-04-04', '2026-05-02', '2026-06-06', '2026-07-04', '2026-08-08', '2026-09-05', '2026-10-03', '2026-11-07'];
  const division8vaDates = ['2026-02-12', '2026-03-09', '2026-04-06', '2026-05-04', '2026-06-08', '2026-07-06', '2026-08-10', '2026-09-07', '2026-10-05', '2026-11-09'];

  const sessions9na = [];
  for (const rawDate of division9naDates) {
    const date = new Date(`${rawDate}T00:00:00.000Z`);
    const session = await prisma.trainingSession.upsert({
      where: {
        divisionId_date: {
          divisionId: division9na.id,
          date,
        },
      },
      update: {
        notes: 'Entrenamiento regular 9na',
      },
      create: {
        divisionId: division9na.id,
        date,
        month: date.getUTCMonth() + 1,
        notes: 'Entrenamiento regular 9na',
      },
    });
    sessions9na.push(session);
  }

  const sessions8va = [];
  for (const rawDate of division8vaDates) {
    const date = new Date(`${rawDate}T00:00:00.000Z`);
    const session = await prisma.trainingSession.upsert({
      where: {
        divisionId_date: {
          divisionId: division8va.id,
          date,
        },
      },
      update: {
        notes: 'Entrenamiento regular 8va',
      },
      create: {
        divisionId: division8va.id,
        date,
        month: date.getUTCMonth() + 1,
        notes: 'Entrenamiento regular 8va',
      },
    });
    sessions8va.push(session);
  }

  const statuses = ['PRESENTE', 'PRESENTE', 'TARDE', 'JUSTIFICADA', 'AUSENTE'];

  for (const session of sessions9na) {
    for (const [index, player] of players9na.entries()) {
      const status = statuses[(session.month + index) % statuses.length];
      await prisma.attendance.upsert({
        where: {
          playerId_trainingSessionId: {
            playerId: player.id,
            trainingSessionId: session.id,
          },
        },
        update: {
          status,
          observation: status === 'AUSENTE' ? 'Sin aviso' : null,
        },
        create: {
          playerId: player.id,
          trainingSessionId: session.id,
          status,
          observation: status === 'AUSENTE' ? 'Sin aviso' : null,
          createdByUserId: coordinador.id,
        },
      });
    }
  }

  for (const session of sessions8va) {
    for (const [index, player] of players8va.entries()) {
      const status = statuses[(session.month + index + 1) % statuses.length];
      await prisma.attendance.upsert({
        where: {
          playerId_trainingSessionId: {
            playerId: player.id,
            trainingSessionId: session.id,
          },
        },
        update: {
          status,
          observation: status === 'JUSTIFICADA' ? 'Certificado médico' : null,
        },
        create: {
          playerId: player.id,
          trainingSessionId: session.id,
          status,
          observation: status === 'JUSTIFICADA' ? 'Certificado médico' : null,
          createdByUserId: coordinador.id,
        },
      });
    }
  }

  console.log('✅ Seed completado');
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
