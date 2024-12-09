import { getLoanApplication } from './actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import BusinessInformation from './business-information';
import LoanInformation from './loan-information';
import OutstandingLoans from './outstanding-loans';

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

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
      <LoanInformation loanApplication={loanApplication} />
      <BusinessInformation business={loanApplication} />
      <OutstandingLoans loans={loanApplication.outstandingLoans} />
    </div>
  );
}
