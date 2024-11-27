'use server';
import { isAddress } from 'viem';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { upsertAccount } from '@/services/db/accounts';
import { Account } from '@prisma/client';

export async function signIn(address: string): Promise<Account | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isAddress(address)) {
      return null;
    }

    const account = await upsertAccount(address);

    return account;
  } catch (error) {
    console.error('Error in signIn action:', error);
    return null;
  }
}
