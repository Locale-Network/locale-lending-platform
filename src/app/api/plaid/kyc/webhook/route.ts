import { PlaidWebhookCode, PlaidWebhookType } from "@/constants/webhook.enum";
import { updateKyVerification } from "@/services/db/plaid/kyc";
import { getPlaidKycVerification } from "@/services/plaid";
import { NextRequest, NextResponse } from "next/server";

interface WebhookData {
  environment: string;
  identity_verification_id: string;
  webhook_code: PlaidWebhookCode;
  webhook_type: PlaidWebhookType;
}

export async function POST(req: NextRequest) {
  try {
    const webhookData: WebhookData = await req.json();

    const {data} = await getPlaidKycVerification(
      webhookData.identity_verification_id
    );

    await updateKyVerification({
      identityVerificationId: webhookData.identity_verification_id,
      status: data.status,
    });

    return NextResponse.json(data, {status: 200});
  } catch (error: any) {
    return NextResponse.json(error, {status: 500});
  }
}
