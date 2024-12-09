import LoanApplicationForm from './form';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { initialiseLoanApplication } from './actions';
import { getIdentityVerificationStatus } from '@/app/borrower/account/actions';
import { KYCVerificationStatus } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const accountAddress = session?.address;

  if (!accountAddress) {
    return null;
  }

  const { hasAttemptedKyc, identityVerificationData } =
    await getIdentityVerificationStatus(accountAddress);

  if (
    !hasAttemptedKyc ||
    !identityVerificationData ||
    identityVerificationData.status === KYCVerificationStatus.active ||
    identityVerificationData.status === KYCVerificationStatus.canceled ||
    identityVerificationData.status === KYCVerificationStatus.expired ||
    identityVerificationData.status === KYCVerificationStatus.failed
  ) {
    redirect('/borrower/account');
  }

  const { isError, errorMessage, loanApplicationId } =
    await initialiseLoanApplication(accountAddress);

  if (isError || !loanApplicationId) {
    return <div>{errorMessage}</div>;
  }

  const redirectUrl = process.env.RECLAIM_SUCCESS_URL ?? '';
  const appSecret = process.env.SECRET_ID;
  const appId = process.env.APP_ID;
  const callbackUrl = process.env.RECLAIM_CALLBACK_URL;
  const providerId = process.env.RECLAIM_PROVIDER_ID;

  if (!appSecret || !appId || !callbackUrl || !providerId) {
    throw new Error('Missing reclaim configuration');
  }

  const reclaimProofRequest = await ReclaimProofRequest.init(appId, appSecret, providerId, {
    log: false,
  });

  reclaimProofRequest.setRedirectUrl(redirectUrl);
  reclaimProofRequest.setAppCallbackUrl(callbackUrl);

  const message = `credit score calculation for ${accountAddress} at ${new Date().toISOString()} for loan application ${loanApplicationId}`;
  reclaimProofRequest.addContext(accountAddress, message);

  const requestUrl = await reclaimProofRequest.getRequestUrl();
  const statusUrl = reclaimProofRequest.getStatusUrl();

  return (
    <LoanApplicationForm
      loanApplicationId={loanApplicationId}
      accountAddress={accountAddress}
      reclaimRequestUrl={requestUrl}
      reclaimStatusUrl={statusUrl}
    />
  );
}
