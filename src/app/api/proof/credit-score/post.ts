import { Context, Proof, verifyProof } from '@reclaimprotocol/js-sdk';
import { NextResponse } from 'next/server';
import { saveReclaimProof } from '@/services/db/reclaim-proof';

export async function POST(req: Request) {
  try {
    console.log('req', req);

    const rawProof = await req.text();

    const decodedProof = decodeURIComponent(rawProof);

    const proof = JSON.parse(decodedProof) as Proof;

    console.log('proof', proof);

    const isProofVerified = await verifyProof(proof);
    if (!isProofVerified) {
      return NextResponse.json(
        {
          message: 'Proof verification failed',
        },
        { status: 400 }
      );
    }

    const rawContext = proof.claimData.context;
    const context = JSON.parse(rawContext) as Context;
    const extractedParameterValues = proof.extractedParameterValues;

    console.log('proof identifier', proof.identifier);
    console.log('ctx', context);
    console.log('extractedParameterValues', extractedParameterValues);

    // TODO: with a proof (ex: credit_score) we can filter out private data from the context and reference it later
    await saveReclaimProof({
      accountAddress: context.contextAddress,
      proof,
      context,
    });

    return NextResponse.json(
      {
        message: 'Proof verified',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Error verifying proof',
      },
      { status: 500 }
    );
  }
}
