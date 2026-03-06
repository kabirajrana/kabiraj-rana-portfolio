import { PrismaClient } from "@prisma/client";

import { serverEnv } from "@/lib/env.server";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaUrl: string | undefined;
}

const databaseUrl = serverEnv.DATABASE_URL;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

const shouldReuseClient = Boolean(global.prisma) && global.prismaUrl === databaseUrl;

export const prisma = shouldReuseClient
  ? (global.prisma as PrismaClient)
  : new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
  global.prismaUrl = databaseUrl;
}
