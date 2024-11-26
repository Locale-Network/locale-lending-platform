import PlaidLink from './plaid-link';
import { createLinkTokenForTransactions } from './actions';
import { generateRandomString } from '@/utils/random';

type Props = {
  searchParams: {};
};

export default async function Page({ searchParams }: Props) {
  // const { isError, errorMessage, account } = await getLoanApplicationCreator(loan_id);

  // if (isError || !account) {
  //   return <div>{errorMessage}</div>;
  // }

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
