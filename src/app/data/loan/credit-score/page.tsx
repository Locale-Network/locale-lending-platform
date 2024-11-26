import PlaidLink from './plaid-link';
import { createLinkTokenForTransactions } from './actions';
import { generateRandomString } from '@/utils/random';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';

export default async function Page() {
  // const { isError, errorMessage, account } = await getLoanApplicationCreator(loan_id);

  // if (isError || !account) {
  //   return <div>{errorMessage}</div>;
  // }

  const session = await getServerSession(authOptions);
  const accountAddress = session?.address;

  console.log(accountAddress);

  if (!accountAddress) {
    redirect(`/signin?callbackUrl=${window.location.href}`);
  }

  const {
    isError: isErrorLinkToken,
    errorMessage: errorMessageLinkToken,
    linkToken,
  } = await createLinkTokenForTransactions(generateRandomString());

  if (isErrorLinkToken || !linkToken) {
    return <div>{errorMessageLinkToken}</div>;
  }

  return (
    <div>
      {/* <p>Credit Score for loan: {loan_id}</p>
      <p>Loan creator: {account}</p> */}
      <p>Link Token: {linkToken}</p>
      <PlaidLink linkToken={linkToken} />
    </div>
  );
}
