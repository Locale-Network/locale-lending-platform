'use server';
import { isAddress } from 'viem';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { upsertChainAccount } from '@/services/db/chain-accounts';
import { ChainAccount } from '@prisma/client';

export async function signIn(address: string): Promise<ChainAccount | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isAddress(address)) {
      return null;
    }

    const chainAccount = await upsertChainAccount(address);

    return chainAccount;
  } catch (error) {
    console.error('Error in signIn action:', error);
    return null;
  }
}
