import PlaidLink from './plaid-link';
import { getLoanApplicationCreator, createLinkTokenForTransactions } from './actions';

type Props = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: Props) {
  const { id } = params;

  const { isError, errorMessage, account } = await getLoanApplicationCreator(id);

  if (isError || !account) {
    return <div>{errorMessage}</div>;
  }

  const { isError: isErrorLinkToken, errorMessage: errorMessageLinkToken, linkToken } =
    await createLinkTokenForTransactions(account);

  if (isErrorLinkToken || !linkToken) {
    return <div>{errorMessageLinkToken}</div>;
  }


  return (
    <div>
      <p>Credit Score for loan: {id}</p>
      <p>Loan creator: {account}</p>
      <p>Link Token: {linkToken}</p>
      <PlaidLink linkToken={linkToken} loanApplicationId={id} />
    </div>
  );
}
