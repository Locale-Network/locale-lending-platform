import CalculateCreditScore from './calculate-credit-score';
import SaveAccessToken from './save-access-token';

type Props = {
  params: {
    id: string;
  };
  searchParams: { // TODO: remove this
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

  return (
    <div>
      <p>Credit Score for Loan {id}</p>
      <SaveAccessToken loanApplicationId={id} accessToken={access_token} itemId={item_id} />
      <CalculateCreditScore loanApplicationId={id} accessToken={access_token} itemId={item_id} />
    </div>
  );
}
