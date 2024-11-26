import 'server-only';

import { PlaidItemAccessToken } from '@prisma/client';
import prisma from '@prisma/index';

export const saveItemAccessToken = async (
  data: Pick<PlaidItemAccessToken, 'accessToken' | 'itemId' | 'accountAddress'>
) => {
  return prisma.plaidItemAccessToken.create({
    data: {
      accountAddress: data.accountAddress,
      accessToken: data.accessToken,
      itemId: data.itemId,
    },
  });
};

export const getItemAccessTokensForChainAccount = async (
  accountAddress: string
): Promise<PlaidItemAccessToken[]> => {
  return prisma.plaidItemAccessToken.findMany({
    where: { accountAddress },
  });
};
