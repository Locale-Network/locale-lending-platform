import { PlaidWebhookCode, PlaidWebhookType } from '@/constants/webhook.enum';
import {
  updateStatusOfKycVerification as dbUpdateStatusOfKycVerification,
  incrementAttemptsCountOfKycVerification as dbIncrementAttemptsCountOfKycVerification,
} from '@/services/db/plaid/kyc';
import { NextRequest, NextResponse } from 'next/server';
import plaidClient from '@/utils/plaid';

interface WebhookData {
  environment: string;
  identity_verification_id: string;
  webhook_code: PlaidWebhookCode;
  webhook_type: PlaidWebhookType;
}

const handleRetriedWebhook = async (webhookData: WebhookData) => {
  await dbIncrementAttemptsCountOfKycVerification(webhookData.identity_verification_id);
};

const handleStatusUpdatedWebhook = async (webhookData: WebhookData) => {
  const identityVerificationResponse = await plaidClient.identityVerificationGet({
    identity_verification_id: webhookData.identity_verification_id,
  });

  const status = identityVerificationResponse.data.status;

  await dbUpdateStatusOfKycVerification({
    identityVerificationId: webhookData.identity_verification_id,
    status,
  });
};

export async function POST(req: NextRequest) {
  try {
    const webhookData: WebhookData = await req.json();

    switch (webhookData.webhook_code) {
      case PlaidWebhookCode.RETRIED:
        await handleRetriedWebhook(webhookData);
        break;
      case PlaidWebhookCode.STATUS_UPDATED:
        await handleStatusUpdatedWebhook(webhookData);
        break;
    }

    return NextResponse.json(
      {
        message: `Webhook ${webhookData.webhook_type}:${webhookData.webhook_code} processed successfully`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Webhook failed to process: ${error.message}` },
      { status: 500 }
    );
  }
}
