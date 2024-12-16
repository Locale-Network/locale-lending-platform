import 'server-only';
import { Context, Proof } from '@reclaimprotocol/js-sdk';

import prisma from '@prisma/index';

export async function saveCreditScoreProof(args: {
  creditScoreId: string;
  proof: Proof;
  context: Context;
}) {
  const { creditScoreId, proof, context } = args;
  await prisma.creditScoreProof.create({
    data: {
      id: proof.identifier,
      creditScoreId,
      proof: JSON.stringify(proof),
      context: JSON.stringify(context),
    },
  });
}

export async function saveDebtServiceProof(args: {
  debtServiceId: string;
  proof: Proof;
  context: Context;
}) {
  const { debtServiceId, proof, context } = args;
  await prisma.debtServiceProof.create({
    data: {
      id: proof.identifier,
      debtServiceId,
      proof: JSON.stringify(proof),
      context: JSON.stringify(context),
    },
  });
}
