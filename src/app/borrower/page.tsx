import ApplyLoanCard from './apply-loan-card';
import ViewLoansCard from './view-loans-card';
import CompleteKycBanner from './complete-kyc-banner';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="col-span-2">
          <CompleteKycBanner />
        </div>
        <ApplyLoanCard />
        <ViewLoansCard />
      </div>
    </div>
  );
}
