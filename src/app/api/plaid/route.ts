import {
  createKycVerification,
  isKycVerifiedByUser,
  updateKyVerification,
} from "@/services/db/plaid/kyc";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data: {
    user: string;
    plaidSessionId: string;
    status: string;
  } = await req.json();

  return createKycVerification(data);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();

  return updateKyVerification(data);
}

export async function GET(req: NextRequest) {
  const url = new URL(req?.url);
  const user = url.searchParams.get("user");

  if (!user) {
    return NextResponse.json("User ID not found", {status: 404});
  }

  return isKycVerifiedByUser(user);
}
