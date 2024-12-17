import { Context, Proof, verifyProof } from '@reclaimprotocol/js-sdk';
import { NextResponse } from 'next/server';
import { getLoanApplication } from '@/services/db/loan-applications/borrower';
import prisma from '@prisma/index';

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
    const context = JSON.parse(rawContext) as Context & {
      extractedParameters: Record<string, string>;
    };

    /*
     extractedParameters: {
    equifax_score: '700',
    transunion_score: '700',
  }
    */

    const loanApplicationId = context.contextAddress; // as part of initialising session
    const equifaxScore = context.extractedParameters.equifax_score;
    const transunionScore = context.extractedParameters.transunion_score;

    console.log('proof identifier', proof.identifier);
    console.log('ctx', context);
    console.log('loanApplicationId', loanApplicationId);
    console.log('equifaxScore', equifaxScore);
    console.log('transunionScore', transunionScore);

    const loanApplication = await getLoanApplication({
      loanApplicationId,
    });

    if (!loanApplication) {
      return NextResponse.json(
        {
          message: 'Loan application not found',
        },
        { status: 404 }
      );
    }

    await prisma.creditScore.create({
      data: {
        loanApplication: {
          connect: {
            id: loanApplicationId,
          },
        },
        creditScoreEquifax: Number(equifaxScore),
        creditScoreTransUnion: Number(transunionScore),
        creditScoreProof: {
          create: {
            id: proof.identifier,
            proof: JSON.stringify(proof),
            context: JSON.stringify(context),
          },
        },
      },
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
