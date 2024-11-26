import PlaidLink from './plaid-link';
import { createLinkTokenForTransactions } from './actions';
import { generateRandomString } from '@/utils/random';
import { debug } from '@/app/actions/debug';
import { headers } from 'next/headers';
export default async function Page(props: unknown) {
  // const { isError, errorMessage, account } = await getLoanApplicationCreator(loan_id);

  // if (isError || !account) {
  //   return <div>{errorMessage}</div>;
  // }

  const headersList = headers();

  console.log(props);

  headersList.forEach((value: unknown, key: string) => {
    console.log(key, value);
  });

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
