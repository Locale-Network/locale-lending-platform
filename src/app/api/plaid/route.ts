import {
  createKycVerification,
  isKycVerifiedByUser,
  updateKyVerification,
} from "@/services/db/plaid/kyc";
import { formatError } from "@/utils/plaid";
import { KYCVerificationStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data: {
      chainAccountAddress: string;
      identityVerificationId: string;
      status: KYCVerificationStatus;
    } = await req.json();

    const response = await createKycVerification(data);
    return NextResponse.json(response);
  } catch (error: any) {
    const formattedError = error?.response
      ? formatError(error?.response)
      : error;
    return NextResponse.json(
      {message: "Error creating KYC verification", error: formattedError},
      {status: 500}
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const response = await updateKyVerification(data);
    return NextResponse.json(response);
  } catch (error: any) {
    const formattedError = error?.response
      ? formatError(error?.response)
      : error;
    return NextResponse.json(
      {message: "Error updating KYC verification", error: formattedError},
      {status: 500}
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req?.url);
  const user = url.searchParams.get("user");

  if (!user) {
    return NextResponse.json("User ID not found", {status: 404});
  }

  const result = await isKycVerifiedByUser(user);

  // Ensure the result is a valid Response type
  if (typeof result === "object" && result !== null) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json("No KYC verification message for specific user", {
      status: 404,
    });
  }
}
