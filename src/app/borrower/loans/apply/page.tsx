import LoanApplicationForm from './form';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { initialiseLoanApplication } from './actions';
import { getIdentityVerificationStatus } from '@/app/borrower/account/actions';
import { redirect } from 'next/navigation';
import { initialiseReclaimCreditKarmaProof, initialiseReclaimPlaidProof } from './actions-reclaim';

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

  // reclaim credit karma proof
  const { requestUrl: reclaimCreditKarmaRequestUrl, statusUrl: reclaimCreditKarmaStatusUrl } =
    await initialiseReclaimCreditKarmaProof({
      accountAddress,
      loanApplicationId,
    });

  // reclaim plaid proof
  const { requestUrl: reclaimPlaidRequestUrl, statusUrl: reclaimPlaidStatusUrl } =
    await initialiseReclaimPlaidProof({
      accountAddress,
      loanApplicationId,
    });

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
