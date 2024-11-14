import Search from '@/components/custom/url-search';
import { Suspense } from 'react';
import Table from '@/components/custom/data-table';
import { columns, LoanApplication } from './columns';
import ApplyLoanButton from './apply-loans';

const data: LoanApplication[] = [
  {
    id: 'LA001',
    loanType: 'Personal',
    amountRequested: 10000,
    applicationDate: '2024-11-01',
    status: 'Pending',
    creditScore: 720,
  },
  {
    id: 'LA002',
    loanType: 'Mortgage',
    amountRequested: 250000,
    applicationDate: '2024-11-02',
    status: 'Approved',
    creditScore: 780,
  },
  {
    id: 'LA003',
    loanType: 'Auto',
    amountRequested: 25000,
    applicationDate: '2024-11-03',
    status: 'Rejected',
    creditScore: 650,
  },
  {
    id: 'LA004',
    loanType: 'Business',
    amountRequested: 100000,
    applicationDate: '2024-11-04',
    status: 'Under Review',
    creditScore: 700,
  },
  {
    id: 'LA005',
    loanType: 'Personal',
    amountRequested: 15000,
    applicationDate: '2024-11-05',
    status: 'Pending',
    creditScore: 690,
  },
];

// TODO: db querying

export default function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <>
      <div className="mb-4 flex w-full flex-col items-start justify-center space-y-4">
        <div className="flex w-full items-center justify-between gap-2">
          <Search />
          <ApplyLoanButton />
        </div>
      </div>
      <Suspense key={query + currentPage}>
        <Table
          rows={data}
          columns={columns}
          total={data.length}
          totalPages={Math.ceil(data.length / 10)}
        />
      </Suspense>
    </>
  );
}
