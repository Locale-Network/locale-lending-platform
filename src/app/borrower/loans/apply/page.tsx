import LoanApplicationForm from './form';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { initialiseLoanApplication } from './actions';
import { getIdentityVerificationStatus } from '@/app/borrower/account/actions';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const accountAddress = session?.address;

  if (!accountAddress) {
    return null;
  }

  const { hasAttemptedKyc, identityVerificationData } =
    await getIdentityVerificationStatus(accountAddress);

  if (!hasAttemptedKyc || !identityVerificationData) {
    redirect('/borrower/account');
  }

  const { isError, errorMessage, loanApplicationId } =
    await initialiseLoanApplication(accountAddress);

  if (isError || !loanApplicationId) {
    return <div>{errorMessage}</div>;
  }

  const reclaimSuccessUrl = process.env.RECLAIM_SUCCESS_URL ?? '';

  // reclaim credit karma proof
  const reclaimCreditKarmaAppId = process.env.RECLAIM_CREDIT_KARMA_APP_ID;
  const reclaimCreditKarmaSecretId = process.env.RECLAIM_CREDIT_KARMA_SECRET_ID;
  const reclaimCreditKarmaProviderId = process.env.RECLAIM_CREDIT_KARMA_PROVIDER_ID;
  const reclaimCreditKarmaCallbackUrl = process.env.RECLAIM_CREDIT_KARMA_CALLBACK_URL;

  if (
    !reclaimCreditKarmaAppId ||
    !reclaimCreditKarmaSecretId ||
    !reclaimCreditKarmaProviderId ||
    !reclaimCreditKarmaCallbackUrl
  ) {
    throw new Error('Missing credit karma reclaim configuration');
  }

  const reclaimCreditKarmaProofRequest = await ReclaimProofRequest.init(
    reclaimCreditKarmaAppId,
    reclaimCreditKarmaSecretId,
    reclaimCreditKarmaProviderId,
    {
      log: false,
    }
  );

  reclaimCreditKarmaProofRequest.setRedirectUrl(reclaimSuccessUrl);
  reclaimCreditKarmaProofRequest.setAppCallbackUrl(reclaimCreditKarmaCallbackUrl);

  const reclaimCreditKarmaMessage = `credit score calculation for ${accountAddress} at ${new Date().toISOString()} for loan application ${loanApplicationId}`;
  reclaimCreditKarmaProofRequest.addContext(accountAddress, reclaimCreditKarmaMessage);

  const reclaimCreditKarmaRequestUrl = await reclaimCreditKarmaProofRequest.getRequestUrl();
  const reclaimCreditKarmaStatusUrl = reclaimCreditKarmaProofRequest.getStatusUrl();

  // reclaim plaid proof
  const reclaimPlaidAppId = process.env.RECLAIM_PLAID_APP_ID;
  const reclaimPlaidSecretId = process.env.RECLAIM_PLAID_SECRET_ID;
  const reclaimPlaidProviderId = process.env.RECLAIM_PLAID_PROVIDER_ID;
  const reclaimPlaidCallbackUrl = process.env.RECLAIM_PLAID_CALLBACK_URL;

  if (
    !reclaimPlaidAppId ||
    !reclaimPlaidSecretId ||
    !reclaimPlaidProviderId ||
    !reclaimPlaidCallbackUrl
  ) {
    throw new Error('Missing plaid reclaim configuration');
  }

  const reclaimPlaidProofRequest = await ReclaimProofRequest.init(
    reclaimPlaidAppId,
    reclaimPlaidSecretId,
    reclaimPlaidProviderId,
    {
      log: false,
    }
  );

  reclaimPlaidProofRequest.setRedirectUrl(reclaimSuccessUrl);
  reclaimPlaidProofRequest.setAppCallbackUrl(reclaimPlaidCallbackUrl);

  const reclaimPlaidMessage = `debt service calculation for ${accountAddress} at ${new Date().toISOString()} for loan application ${loanApplicationId}`;
  reclaimPlaidProofRequest.addContext(accountAddress, reclaimPlaidMessage);

  const reclaimPlaidRequestUrl = await reclaimPlaidProofRequest.getRequestUrl();
  const reclaimPlaidStatusUrl = reclaimPlaidProofRequest.getStatusUrl();

  return (
    <LoanApplicationForm
      loanApplicationId={loanApplicationId}
      accountAddress={accountAddress}
      reclaimCreditKarmaRequestUrl={reclaimCreditKarmaRequestUrl}
      reclaimCreditKarmaStatusUrl={reclaimCreditKarmaStatusUrl}
      reclaimPlaidRequestUrl={reclaimPlaidRequestUrl}
      reclaimPlaidStatusUrl={reclaimPlaidStatusUrl}
    />
  );
}
