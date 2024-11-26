import PlaidLink from './plaid-link';
import { getLoanApplicationCreator, createLinkTokenForTransactions } from './actions';

type Props = {
  searchParams: {
    loan_id: string;
  };
};

export default async function Page({ searchParams }: Props) {
  const { loan_id = 'cm3y51oy00001i0vas8yxoo89' } = searchParams;

  if (!loan_id) {
    return <div>No loan id provided</div>;
  }

  const { isError, errorMessage, account } = await getLoanApplicationCreator(loan_id);

  if (isError || !account) {
    return <div>{errorMessage}</div>;
  }

  const {
    isError: isErrorLinkToken,
    errorMessage: errorMessageLinkToken,
    linkToken,
  } = await createLinkTokenForTransactions(account);

  if (isErrorLinkToken || !linkToken) {
    return <div>{errorMessageLinkToken}</div>;
  }

  return (
    <div>
      <p>Credit Score for loan: {loan_id}</p>
      <p>Loan creator: {account}</p>
      <p>Link Token: {linkToken}</p>
      <PlaidLink linkToken={linkToken} loanApplicationId={loan_id} />
    </div>
  );
}
