import prisma from '@prisma/index';
import { Context, Proof, verifyProof } from '@reclaimprotocol/js-sdk';
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
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

  console.log('ctx', context);
  console.log('extractedParameterValues', extractedParameterValues);

  // TODO: with a proof (ex: credit_score) we can filter out private data from the context and reference it later
  await prisma.proof.create({
    data: {
      address: context.contextAddress,
      proof: decodedProof,
      context: rawContext,
    },
  });

  return NextResponse.json(
    {
      message: 'Proof verified',
    },
    { status: 200 }
  );
}
