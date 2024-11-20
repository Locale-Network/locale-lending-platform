import { Reason } from '@/constants/reason.enum';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { NextResponse } from 'next/server';

interface SignInBody {
  providerId: string;
  account: string;
  deeplink_url: string;
  reason: Reason;
}

export async function POST(request: Request) {
  // Add CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  const {
    providerId,
    account,
    deeplink_url: deepLinkUrl,
    reason,
  } = (await request.json()) as SignInBody;

  const appSecret = process.env.SECRET_ID;
  const appId = process.env.APP_ID;
  const callbackUrl = process.env.RECLAIM_CALLBACK_URL;
  if (!appSecret || !appId || !callbackUrl) {
    return NextResponse.json({ message: 'missing configuration' }, { status: 500 });
  }

  const reclaimProofRequest = await ReclaimProofRequest.init(appId, appSecret, providerId);

  if (providerId) {
    // await reclaimClient.buildProofRequest(providerId);

    reclaimProofRequest.setAppCallbackUrl(callbackUrl);
    if (deepLinkUrl) {
      reclaimProofRequest.setRedirectUrl(deepLinkUrl);
    }

    // reclaimClient.setSignature(
    //   await reclaimClient.generateSignature(appSecret)
    // );

    if (account) {
      let message = '';
      switch (reason) {
        case Reason.AccountVerification:
          message = 'for account verification ';
          break;
        default:
          return NextResponse.json({ message: 'reason not found' }, { status: 400 });
      }
      message += `${account} ${Date.now().toString()}`;
      reclaimProofRequest.addContext(account, message);
    }

    const signedUrl = await reclaimProofRequest.getRequestUrl();

    return NextResponse.json(
      {
        name: 'response',
        error: false,
        data: {
          signedUrl,
        },
      },
      { headers }
    ); // Add headers to the response
  }
}

// Add OPTIONS method handler
export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  return new NextResponse(null, { headers });
}
