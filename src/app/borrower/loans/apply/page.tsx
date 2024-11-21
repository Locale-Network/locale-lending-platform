import LoanApplicationForm from './form';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { initialiseLoanApplication } from './actions';

// TODO: hide show Loan Application form based on KYC status

export default async function Page() {
  const session = await getServerSession(authOptions);
  const chainAccountAddress = session?.address;

  if (!chainAccountAddress) {
    return null;
  }

  const { isError, errorMessage, loanApplicationId } =
    await initialiseLoanApplication(chainAccountAddress);

  if (isError || !loanApplicationId) {
    return <div>{errorMessage}</div>;
  }

  const redirectUrl = process.env.PLAID_REDIRECT_URI ?? '';

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

  const message = `credit score calculation for ${chainAccountAddress} at ${new Date().toISOString()} for loan application ${loanApplicationId}`;
  reclaimProofRequest.addContext(chainAccountAddress, message);

  const requestUrl = await reclaimProofRequest.getRequestUrl();
  const statusUrl = reclaimProofRequest.getStatusUrl();

  return (
    <LoanApplicationForm
      loanApplicationId={loanApplicationId}
      chainAccountAddress={chainAccountAddress}
      reclaimRequestUrl={requestUrl}
      reclaimStatusUrl={statusUrl}
    />
  );
}
