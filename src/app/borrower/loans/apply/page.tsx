import LoanApplicationForm from './loan-application-form';
import CompleteIdentityVerification from './complete-identity-verification';
import RetryIdentityVerification from './retry-identity-verification';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { initialiseLoanApplication } from './actions/loan-application-actions';
import {
  getIdentityVerificationStatus,
  createLinkTokenForIdentityVerification,
  retryIdentityVerification,
} from './actions/identity-verifications-actions';
import { KYCVerificationStatus } from '@prisma/client';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const accountAddress = session?.address;

  if (!accountAddress) {
    return null;
  }

  /*KYC STATUS CHECK*/
  const {
    isError: isIdentityVerificationError,
    errorMessage: identityVerificationErrorMessage,
    hasAttemptedKyc,
    identityVerificationData,
  } = await getIdentityVerificationStatus(accountAddress);

  if (isIdentityVerificationError) {
    return <div>{identityVerificationErrorMessage}</div>;
  }

  if (!hasAttemptedKyc || !identityVerificationData) {
    const { isError, errorMessage, linkToken } =
      await createLinkTokenForIdentityVerification(accountAddress);

    if (isError || !linkToken) {
      return <div>{errorMessage}</div>;
    }

    return <CompleteIdentityVerification linkToken={linkToken} accountAddress={accountAddress} />;
  }

  if (hasAttemptedKyc && identityVerificationData.status === KYCVerificationStatus.failed) {
    const { isError, errorMessage, retryIdentityVerificationData } =
      await retryIdentityVerification(accountAddress);

    if (isError || !retryIdentityVerificationData) {
      return <div>{errorMessage}</div>;
    }

    return (
      <RetryIdentityVerification
        accountAddress={accountAddress}
        retryIdentityVerificationData={retryIdentityVerificationData}
        identityVerificationData={identityVerificationData}
      />
    );
  }
  /*KYC STATUS CHECK*/

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
