import { Context, Proof, verifyProof } from '@reclaimprotocol/js-sdk';
import { NextResponse } from 'next/server';
import { saveCreditScoreProof } from '@/services/db/reclaim-proof';

// called as part of Reclaim's Credit Karma flow

export async function POST(req: Request) {
  try {
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

    console.log('proof identifier', proof.identifier);
    console.log('ctx', context);

    // TODO: uncomment this
    // await saveCreditScoreProof({
    //   creditScoreId: context.contextAddress,
    //   proof,
    //   context,
    // });

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
