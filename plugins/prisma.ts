import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export default defineNuxtPlugin(() => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return {
    provide: {
      prisma: prisma
    }
  };
});
