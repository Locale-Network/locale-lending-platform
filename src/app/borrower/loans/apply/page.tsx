import LoanApplicationForm from './form';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { initialiseLoanApplication } from './actions';
import { getIdentityVerificationStatus } from '@/app/borrower/account/actions';
import { redirect } from 'next/navigation';
import {
  initialiseReclaimCreditKarmaProof,
  initialiseReclaimDebtServiceProof,
} from './actions-reclaim';

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

  // reclaim debt service proof
  const { requestUrl: reclaimDebtServiceRequestUrl, statusUrl: reclaimDebtServiceStatusUrl } =
    await initialiseReclaimDebtServiceProof({
      accountAddress,
      loanApplicationId,
    });

  return (
    <LoanApplicationForm
      loanApplicationId={loanApplicationId}
      accountAddress={accountAddress}
      reclaimCreditKarmaRequestUrl={reclaimCreditKarmaRequestUrl}
      reclaimCreditKarmaStatusUrl={reclaimCreditKarmaStatusUrl}
      reclaimDebtServiceRequestUrl={reclaimDebtServiceRequestUrl}
      reclaimDebtServiceStatusUrl={reclaimDebtServiceStatusUrl}
    />
  );
}
