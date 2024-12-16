import { getLoanApplication } from './actions';
import { initialiseReclaimPlaidProof } from '@/app/borrower/loans/apply/actions-reclaim';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import BusinessInformation from './business-information';
import LoanInformation from './loan-information';
import OutstandingLoans from './outstanding-loans';
import { LoanApplicationStatus } from '@prisma/client';
import ReclaimPlaid from './reclaim-plaid';

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  const session = await getServerSession(authOptions);
  const accountAddress = session?.address;

  if (!accountAddress) {
    return <>No account address found</>;
  }

  const { loanApplication, isError, errorMessage } = await getLoanApplication({
    accountAddress: accountAddress,
    loanApplicationId: id,
  });

  if (isError) {
    return <>Error: {errorMessage}</>;
  }

  if (!loanApplication) {
    return <>loan with id {id} not found</>;
  }

  const { requestUrl: reclaimPlaidRequestUrl, statusUrl: reclaimPlaidStatusUrl } =
    await initialiseReclaimPlaidProof({
      accountAddress,
      loanApplicationId: id,
    });

  return (
    <>
      {loanApplication.status !== LoanApplicationStatus.APPROVED && (
        <div className="flex justify-end">
          <ReclaimPlaid
            requestUrl={reclaimPlaidRequestUrl}
            statusUrl={reclaimPlaidStatusUrl}
            loanApplicationId={id}
          />
        </div>
      )}
      <div className="my-4" />
      <div className="grid grid-cols-1 gap-4 p-0 md:grid-cols-2">
        <LoanInformation loanApplication={loanApplication} />
        <BusinessInformation business={loanApplication} />
        <OutstandingLoans loans={loanApplication.outstandingLoans} />
      </div>
    </>
  );
}
