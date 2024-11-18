import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import VerificationStatus from '@/containers/VerificationStatus/VerificationStatus';
import { Suspense } from 'react';

// TODO: convert to server action to download transaction history for credit score calculation

interface ReclaimPageProps {
  searchParams: {
    account: string;
    redirectUrl: string;
  };
}

const VerificationStatusComponent = async ({
  redirectUrl,
  account,
}: {
  redirectUrl: string;
  account: string;
}) => {
  const appSecret = process.env.SECRET_ID;
  const appId = process.env.APP_ID;
  const callbackUrl = process.env.RECLAIM_CALLBACK_URL;
  const providerId = process.env.RECLAIM_PROVIDER_ID;
  if (!appSecret || !appId || !callbackUrl || !providerId) {
    throw new Error('Missing configuration');
  }

  const reclaimProofRequest = await ReclaimProofRequest.init(appId, appSecret, providerId);

  // await reclaimProofRequest.buildProofRequest(providerId, true, "V2Linking");

  if (!redirectUrl) {
    return <div>No redirectUrl provided</div>;
  }

  reclaimProofRequest.setRedirectUrl(decodeURIComponent(redirectUrl));
  reclaimProofRequest.setAppCallbackUrl(callbackUrl);

  // reclaimProofRequest.setSignature(await reclaimProofRequest.generateSignature(appSecret));

  const message = `for account verification ${account} ${Date.now().toString()}`;
  reclaimProofRequest.addContext(account, message);

  const requestUrl = await reclaimProofRequest.getRequestUrl();
  const statusUrl = reclaimProofRequest.getStatusUrl();

  // const { requestUrl: signedUrl, statusUrl } =
  //   await reclaimClient.createVerificationRequest();

  return <VerificationStatus signedUrl={requestUrl} statusUrl={statusUrl} />;
};

export default async function ReclaimPage({ searchParams }: ReclaimPageProps) {
  const { account, redirectUrl } = searchParams;

  if (!account) {
    return <div className="">No account provided</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Suspense
        fallback={
          <>
            <div className="mb-4">
              <Skeleton className="h-[256px] w-[256px]" />
            </div>
            <Button disabled>
              <span className="mr-2">
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              Verifying...
            </Button>
            <div className="mt-4">
              <Skeleton className="h-[20px] w-[160px]" />
            </div>
            <div>
              <Skeleton className="h-[20px] w-[20px]" />
            </div>
          </>
        }
      >
        <VerificationStatusComponent account={account} redirectUrl={redirectUrl} />
      </Suspense>
    </div>
  );
}
