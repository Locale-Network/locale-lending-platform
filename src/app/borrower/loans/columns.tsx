'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export type LoanApplication = {
  id: string;
  loanType: string;
  amountRequested: number;
  applicationDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
  creditScore: number;
};

export const columns: ColumnDef<LoanApplication>[] = [
  {
    accessorKey: 'id',
    header: 'Application ID',
    cell: ({ row }) => (
      <Link
        href={`/borrower/loans/${row.getValue('id')}`}
        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100 hover:text-blue-800"
      >
        {row.getValue('id')}
      </Link>
    ),
  },
  {
    accessorKey: 'loanType',
    header: 'Loan Type',
    cell: ({ row }) => <div>{row.getValue('loanType')}</div>,
  },
  {
    accessorKey: 'amountRequested',
    header: 'Amount Requested',
    cell: ({ row }) => <div>${row.getValue('amountRequested')}</div>,
  },
  {
    accessorKey: 'applicationDate',
    header: 'Application Date',
    cell: ({ row }) => <div>{row.getValue('applicationDate')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      const statusStyles =
        {
          Approved: 'bg-green-100 text-green-800',
          Pending: 'bg-yellow-100 text-yellow-800',
          Rejected: 'bg-red-100 text-red-800',
          'Under Review': 'bg-blue-100 text-blue-800',
        }[status] || 'bg-gray-100 text-gray-800';

      return (
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles}`}
        >
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: 'creditScore',
    header: 'Credit Score',
    cell: ({ row }) => <div>{row.getValue('creditScore')}</div>,
  },
];

