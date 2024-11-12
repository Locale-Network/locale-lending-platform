import { getPlaidKycVerification } from "@/services/plaid";
import { formatError } from "@/utils/plaid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req?.url);
  const identity_verification_id = url.searchParams.get("access_token");

  try {
    const response = await getPlaidKycVerification(identity_verification_id);

    return NextResponse.json({data: response.data}, {status: 200});
  } catch (error: any) {
    const formattedError = formatError(error?.response);
    return NextResponse.json(
      {message: "Error retrieving KYC verification", error: formattedError},
      {status: 500}
    );
  }
}
