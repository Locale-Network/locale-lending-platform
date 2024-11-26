import PlaidLink from './plaid-link';
import { createLinkTokenForTransactions } from './actions';
import { generateRandomString } from '@/utils/random';
import { headers } from 'next/headers';
import { getLatestLoanApplicationOfBorrower } from '@/services/db/loan-applications';
import AddressInput from './input-address';

interface Props {
  searchParams: {
    accountAddress: string;
  };
}

export default async function Page({ searchParams: { accountAddress } }: Props) {
  // const { isError, errorMessage, account } = await getLoanApplicationCreator(loan_id);

  // if (isError || !account) {
  //   return <div>{errorMessage}</div>;
  // }

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
    return <AddressInput />;
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
