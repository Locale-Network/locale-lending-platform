import 'server-only';

import { PlaidItemAccessToken } from '@prisma/client';
import prisma from '@prisma/index';

export const saveItemAccessToken = async (
  data: Pick<
    PlaidItemAccessToken,
    'accessToken' | 'itemId' | 'accountAddress' | 'loanApplicationId'
  >
) => {
  await prisma.plaidItemAccessToken.create({
    data: {
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
  });
};

export const getItemAccessTokensForChainAccount = async (
  accountAddress: string
): Promise<PlaidItemAccessToken[]> => {
  return prisma.plaidItemAccessToken.findMany({
    where: { accountAddress },
  });
};
