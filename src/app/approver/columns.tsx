'use client';

import { LoanApplicationStatus } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { getLoanStatusStyle } from '@/utils/colour';
import { formatDateToUS } from '@/utils/date';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { updateLoanApplicationStatus } from './actions';
import { useOptimistic } from 'react';

export type LoanApplicationsForTable = {
  id: string;
  creatorAddress: string;
  creditScore: number;
  status: LoanApplicationStatus;
  createdDate: Date;
  updatedDate: Date;
};

const ActionsCell: React.FC<{ loanApplication: LoanApplicationsForTable }> = ({
  loanApplication,
}) => {
  const [optimisticState, addOptimistic] = useOptimistic(
    { loanStatus: loanApplication.status },
    // updateFn
    (currentState, newLoanStatus: LoanApplicationStatus) => {
      return { loanStatus: newLoanStatus };
    }
  );

  const onApprove = async () => {
    addOptimistic(LoanApplicationStatus.APPROVED);
    await updateLoanApplicationStatus(loanApplication.id, LoanApplicationStatus.APPROVED);
  };

  const onReject = async () => {
    addOptimistic(LoanApplicationStatus.REJECTED);
    await updateLoanApplicationStatus(loanApplication.id, LoanApplicationStatus.REJECTED);
  };

  const onAddtionalInfoNeeded = async () => {
    addOptimistic(LoanApplicationStatus.ADDITIONAL_INFO_NEEDED);
    await updateLoanApplicationStatus(
      loanApplication.id,
      LoanApplicationStatus.ADDITIONAL_INFO_NEEDED
    );
  };

  loanApplication.status = optimisticState.loanStatus;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onApprove}>Approve</DropdownMenuItem>
          <DropdownMenuItem onClick={onReject}>Reject</DropdownMenuItem>
          <DropdownMenuItem onClick={onAddtionalInfoNeeded}>Request More Info</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<LoanApplicationsForTable>[] = [
  {
    accessorKey: 'id',
    header: 'Application ID',
    cell: ({ row }) => (
      <Link
        href={`/approver/loans/${row.getValue('id')}`}
        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100 hover:text-blue-800"
      >
        {row.getValue('id')}
      </Link>
    ),
  },
  {
    accessorKey: 'creatorAddress',
    header: 'Borrower Address',
    cell: ({ row }) => <div>{row.getValue('creatorAddress')}</div>,
  },

  {
    accessorKey: 'creditScore',
    header: 'Credit Score',
    cell: ({ row }) => <div>{row.getValue('creditScore')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as LoanApplicationStatus;

      const statusStyles = getLoanStatusStyle(status);

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
    accessorKey: 'createdDate',
    header: 'Application Date',
    cell: ({ row }) => <div>{formatDateToUS(row.getValue('createdDate'))}</div>,
  },
  {
    accessorKey: 'updatedDate',
    header: 'Updated Date',
    cell: ({ row }) => <div>{formatDateToUS(row.getValue('updatedDate'))}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell loanApplication={row.original} />,
  },
];
