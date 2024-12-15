import PlaidLink from './plaid-link';
import { createLinkTokenForTransactions, getLatestLoanApplicationOfBorrower } from './actions';
import AddressInput from './input-address';
import { formatAddress } from '@/utils/string';
import { Address } from 'viem';

/**
 * This page offers a Plaid Link session for users to connect to their bank account.
 * This page is wrapped inside the Reclaim flow.
 * After bank account is successfully connected, an access token is generated for the user's transaction history.
 * The transaction history to used to calculated debt-service/ interest rate
 */


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
      <p>Loan creator: {formatAddress(accountAddress as Address)}</p>
      <PlaidLink linkToken={linkToken} loanApplicationId={loanApplicationId} />
    </div>
  );
}
