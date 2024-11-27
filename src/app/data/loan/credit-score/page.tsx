import PlaidLink from './plaid-link';
import { createLinkTokenForTransactions, getLatestLoanApplicationOfBorrower } from './actions';
import AddressInput from './input-address';

interface Props {
  searchParams: {
    accountAddress: string;
  };
}

export default async function Page({ searchParams: { accountAddress } }: Props) {
  if (!accountAddress) {
    return <AddressInput />;
  }

  const {
    isError: isErrorLinkToken,
    errorMessage: errorMessageLinkToken,
    linkToken,
  } = await createLinkTokenForTransactions(accountAddress);

  if (isErrorLinkToken || !linkToken) {
    return <div>err: {errorMessageLinkToken}</div>;
  }

  const {
    isError: isErrorLoanApplication,
    errorMessage: errorMessageLoanApplication,
    loanApplicationId,
  } = await getLatestLoanApplicationOfBorrower(accountAddress); // DRAFT application

  if (isErrorLoanApplication || !loanApplicationId) {
    return <div>{errorMessageLoanApplication}</div>;
  }

  return (
    <div>
      <p>Loan ID: {loanApplicationId}</p>
      <p>Loan creator: {accountAddress}</p>
      <p>Link Token: {linkToken}</p>
      <PlaidLink linkToken={linkToken} loanApplicationId={loanApplicationId} />
    </div>
  );
}
