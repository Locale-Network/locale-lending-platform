import LoanApplicationForm from './form';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { initialiseLoanApplication } from './actions';

// TODO: hide show Loan Application form based on KYC status

export default async function Page() {
  const session = await getServerSession(authOptions);
  const accountAddress = session?.address;

  if (!accountAddress) {
    return null;
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

  const reclaimProofRequest = await ReclaimProofRequest.init(appId, appSecret, providerId);

  reclaimProofRequest.setRedirectUrl(redirectUrl);
  reclaimProofRequest.setAppCallbackUrl(callbackUrl);

  const message = `credit score calculation for ${accountAddress} at ${new Date().toISOString()} for loan application ${loanApplicationId}`;
  reclaimProofRequest.addContext(accountAddress, message);

  reclaimProofRequest.setParams({ URL_PARAMS_1: loanApplicationId });

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
