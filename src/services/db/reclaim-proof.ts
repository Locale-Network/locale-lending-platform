import 'server-only';
import { Context, Proof } from '@reclaimprotocol/js-sdk';

import prisma from '@prisma/index';

export async function saveCreditScoreProof(args: {
  creditScoreId: string;
  proof: Proof;
  context: Context;
}) {
  const { creditScoreId, proof, context } = args;

  await prisma.creditScore.update({
    where: {
      id: creditScoreId,
    },
    data: {
      creditScoreProofId: proof.identifier,
      creditScoreProof: {
        create: {
          id: proof.identifier,
          proof: JSON.stringify(proof),
          context: JSON.stringify(context),
        },
      },
    },
  });
}

export async function saveDebtServiceProof(args: {
  debtServiceId: string;
  proof: Proof;
  context: Context;
}) {
  const { debtServiceId, proof, context } = args;

  await prisma.debtService.update({
    where: {
      id: debtServiceId,
    },
    data: {
      debtServiceProofId: proof.identifier,
      debtServiceProof: {
        create: {
          id: proof.identifier,
          proof: JSON.stringify(proof),
          context: JSON.stringify(context),
        },
      },
    },
  });
}
