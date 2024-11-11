import client, { formatError } from "@/utils/plaid";
import { NextRequest, NextResponse } from "next/server";
import { IdentityVerificationGetRequest } from "plaid";

export async function GET(req: NextRequest) {
  const {identity_verification_id} = await req.json();

  const request: IdentityVerificationGetRequest = {
    identity_verification_id,
  };
  try {
    const response = await client.identityVerificationGet(request);

    return NextResponse.json({data: response.data}, {status: 200});
  } catch (error: any) {
    const formattedError = formatError(error?.response);
    return NextResponse.json(
      {message: "Error retrieving KYC verification", error: formattedError},
      {status: 500}
    );
  }
}
