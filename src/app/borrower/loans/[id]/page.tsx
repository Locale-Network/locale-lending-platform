export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  return <div>Loan application details {id}</div>;
}
