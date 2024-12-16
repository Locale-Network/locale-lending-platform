import 'server-only';

import { PlaidItemAccessToken } from '@prisma/client';
import prisma from '@prisma/index';

export const saveItemAccessToken = async (
  data: Pick<
    PlaidItemAccessToken,
    'accessToken' | 'itemId' | 'accountAddress' | 'loanApplicationId'
  >
) => {
  return prisma.plaidItemAccessToken.upsert({
    where: {
      loanApplicationId: data.loanApplicationId,
    },
    create: {
      accessToken: data.accessToken,
      itemId: data.itemId,
      account: {
        connect: {
          address: data.accountAddress,
        },
      },
      loanApplication: {
        connect: {
          id: data.loanApplicationId,
        },
      },
    },
    update: {
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
