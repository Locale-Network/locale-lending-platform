import 'server-only';
import { Context, Proof } from '@reclaimprotocol/js-sdk';

import prisma from '@prisma/index';

export async function saveReclaimProof(args: {
  accountAddress: string;
  proof: Proof;
  context: Context;
}) {
  const { accountAddress, proof, context } = args;
  await prisma.proof.create({
    data: {
      id: proof.identifier,
      accountAddress,
      proof: JSON.stringify(proof),
      context: JSON.stringify(context),
    },
  });
}
