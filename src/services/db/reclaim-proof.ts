import 'server-only';
import { Context, Proof } from '@reclaimprotocol/js-sdk';

import prisma from '@prisma/index';

export async function saveReclaimProof(args: {
  chainAccountAddress: string;
  proof: Proof;
  context: Context;
}) {
  const { chainAccountAddress, proof, context } = args;
  await prisma.proof.create({
    data: {
      id: proof.identifier,
      chainAccountAddress,
      proof: JSON.stringify(proof),
      context: JSON.stringify(context),
    },
  });
}
