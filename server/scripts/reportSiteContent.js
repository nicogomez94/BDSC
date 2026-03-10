import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  const subdivisions = await prisma.siteSubdivision.findMany({
    orderBy: [{ sectionKey: 'asc' }, { sortOrder: 'asc' }],
    include: {
      pages: {
        orderBy: [{ sortOrder: 'asc' }],
      },
    },
  });

  const grouped = subdivisions.reduce((acc, item) => {
    acc[item.sectionKey] = (acc[item.sectionKey] || 0) + 1;
    return acc;
  }, {});

  const totalPages = subdivisions.reduce((count, item) => count + item.pages.length, 0);

  console.log(
    JSON.stringify(
      {
        grouped,
        totalSubdivisions: subdivisions.length,
        totalPages,
      },
      null,
      2
    )
  );
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
