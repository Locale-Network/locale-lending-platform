import PlaidLink from './plaid-link';
import { createLinkTokenForTransactions } from './actions';
import { generateRandomString } from '@/utils/random';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { headers } from 'next/headers';
import Redirect from './redirect';
import { getLatestLoanApplicationOfBorrower } from '@/services/db/loan-applications';

interface Props {
  searchParams: {
    accountAddress: string;
  };
}

export default async function Page() {
  // const { isError, errorMessage, account } = await getLoanApplicationCreator(loan_id);

  // if (isError || !account) {
  //   return <div>{errorMessage}</div>;
  // }

  const accountAddress = '0xbe9E7b0ed19526544B55b697107231f9467a805f';

  console.log('accountAddress', accountAddress);

  const headersList = headers();
  const fullUrl = headersList.get('host') || headersList.get('referer') || '/';
  const pathname = headers().get('x-invoke-path') || '';

  console.log('fullUrl', fullUrl);
  console.log('pathname', pathname);

  const {
    isError: isErrorLinkToken,
    errorMessage: errorMessageLinkToken,
    linkToken,
  } = await createLinkTokenForTransactions(generateRandomString());

  if (isErrorLinkToken || !linkToken) {
    return <div>err: {errorMessageLinkToken}</div>;
  }

  if (!accountAddress) {
    return <Redirect accountAddress={accountAddress} />;
  }

  const loanApplication = await getLatestLoanApplicationOfBorrower(accountAddress);

  if (!loanApplication) {
    return <div>No loan application found</div>;
  }

  return (
    <div>
      {/* <p>Credit Score for loan: {loan_id}</p>
      <p>Loan creator: {accountAddress}</p> */}
      <p>Link Token: {linkToken}</p>
      <PlaidLink linkToken={linkToken} loanApplicationId={loanApplication?.id} />
    </div>
  );
}
