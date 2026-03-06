import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export type ResearchDelegateRecord = {
  id: string;
  slug: string;
  title: string;
  featured?: boolean;
  summary?: string;
  abstract?: string;
  content?: unknown;
  status?: string;
  year?: number | string | null;
  updatedAt?: Date;
  publishedAt?: Date | null;
  codeUrl?: string | null;
  coverImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

type DelegateArgs = Record<string, unknown>;

export type ResearchDelegateCompat = {
  count: (args?: DelegateArgs) => Promise<number>;
  findMany: (args?: DelegateArgs) => Promise<ResearchDelegateRecord[]>;
  findUnique: (args: DelegateArgs) => Promise<ResearchDelegateRecord | null>;
  findFirst: (args?: DelegateArgs) => Promise<ResearchDelegateRecord | null>;
  create: (args: DelegateArgs) => Promise<ResearchDelegateRecord>;
  createMany: (args: DelegateArgs) => Promise<{ count: number }>;
  update: (args: DelegateArgs) => Promise<ResearchDelegateRecord>;
  updateMany: (args: DelegateArgs) => Promise<{ count: number }>;
  delete: (args: DelegateArgs) => Promise<ResearchDelegateRecord>;
  upsert: (args: DelegateArgs) => Promise<ResearchDelegateRecord>;
};

export const researchDelegate = (prisma as unknown as { research: ResearchDelegateCompat }).research;

export function txResearchDelegate(tx: Prisma.TransactionClient) {
  return (tx as unknown as { research: ResearchDelegateCompat }).research;
}
