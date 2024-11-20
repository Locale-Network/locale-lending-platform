import { saveAccessTokenOfLoanApplicationCreator } from './actions';

type Props = {
  params: {
    id: string;
  };
  searchParams: {
    access_token?: string;
    item_id?: string;
  };
};

export default async function Page({ params, searchParams }: Props) {
  const { id } = params;
  const { access_token, item_id } = searchParams;

  if (!access_token) {
    return <div>No access token</div>;
  }

  if (!item_id) {
    return <div>No item id</div>;
  }

  const { isError, errorMessage } = await saveAccessTokenOfLoanApplicationCreator({
    loanApplicationId: id,
    accessToken: access_token,
    itemId: item_id,
  });

  return (
    <div>
      Credit Score for Loan {id}
      {isError && <div>{errorMessage}</div>}
      {!isError && <div>Access token saved</div>}
    </div>
  );
}
