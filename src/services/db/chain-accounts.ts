import 'server-only';

import prisma from '@prisma/index';
import { ChainAccount } from '@prisma/client';

export async function upsertChainAccount(address: string): Promise<ChainAccount> {
  const result = await prisma.chainAccount.upsert({
    where: { address },
    create: { address },
    update: {
      updatedAt: new Date(), // existing accounts login in
    },
  });

  return result;
}
