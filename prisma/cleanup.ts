import { Prisma, PrismaClient } from '@prisma/client';

const cleanupDatabase = () => {
  const prisma = new PrismaClient();
  const modelNames = Prisma.dmmf.datamodel.models.map((model) => model.name);

  return Promise.all(
    modelNames.map((modelName) => prisma[modelName.toLowerCase()].deleteMany()),
  );
};

cleanupDatabase();
