import { retryPlaidKycVerification } from "@/services/plaid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {account} = await req.json();

    const {data} = await retryPlaidKycVerification(account);

    return NextResponse.json(data, {status: 200});
  } catch (error: any) {
    return NextResponse.json(error, {status: 500});
  }
}
