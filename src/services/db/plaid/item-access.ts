import 'server-only';

import { PlaidItemAccessToken } from '@prisma/client';
import prisma from '@prisma/index';

export const saveItemAccessToken = async (
  data: Pick<PlaidItemAccessToken, 'accessToken' | 'itemId' | 'chainAccountAddress'>
) => {
  return prisma.plaidItemAccessToken.create({
    data: {
      chainAccountAddress: data.chainAccountAddress,
      accessToken: data.accessToken,
      itemId: data.itemId,
    },
  });
};

export const getItemAccessTokensForChainAccount = async (
  chainAccountAddress: string
): Promise<PlaidItemAccessToken[]> => {
  return prisma.plaidItemAccessToken.findMany({
    where: { chainAccountAddress },
  });
};
