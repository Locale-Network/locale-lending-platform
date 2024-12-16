import { Context, Proof, verifyProof } from '@reclaimprotocol/js-sdk';
import { NextResponse } from 'next/server';
import { saveDebtServiceProof } from '@/services/db/reclaim-proof';
import { getLoanApplication } from '@/services/db/loan-applications/borrower';

// called as part of Reclaim's Debt Service flow

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
    URL_PARAMS_1: 'cm4r27onf0005uitnop2ty8rf',
    dscr: '10',
    netOperatingIncome: '100000',
    totalDebtService: '10000'
  }
    */
    const loanApplicationId = context.extractedParameters.URL_PARAMS_1;

    console.log('proof identifier', proof.identifier);
    console.log('ctx', context);
    console.log('loanApplicationId', loanApplicationId);

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

    const debtServiceId = loanApplication.debtService?.[0]?.id;

    if (!debtServiceId) {
      return NextResponse.json(
        {
          message: 'Debt service not found',
        },
        { status: 404 }
      );
    }

    await saveDebtServiceProof({
      debtServiceId,
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
    console.error(error);
    return NextResponse.json(
      {
        message: 'Error verifying proof',
      },
      { status: 500 }
    );
  }
}
