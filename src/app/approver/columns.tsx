'use client';

import { LoanApplicationStatus } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { getLoanStatusStyle } from '@/utils/colour';
import { formatDateToUS } from '@/utils/date';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { updateLoanApplicationStatus } from './actions';

export type LoanApplicationsForTable = {
  id: string;
  creatorAddress: string;
  creditScore: number;
  status: LoanApplicationStatus;
  createdDate: Date;
  updatedDate: Date;
};

const Spinner = () => <Loader2 className="mr-2 h-4 w-4 animate-spin" />;

const ActionsCell: React.FC<{ loanApplication: LoanApplicationsForTable }> = ({
  loanApplication,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRequestingMoreInfo, setIsRequestingMoreInfo] = useState(false);

  const onApprove = async () => {
    setIsApproving(true);
    await updateLoanApplicationStatus(loanApplication.id, LoanApplicationStatus.APPROVED);
    setIsApproving(false);
  };

  const onReject = async () => {
    setIsRejecting(true);
    await updateLoanApplicationStatus(loanApplication.id, LoanApplicationStatus.REJECTED);
    setIsRejecting(false);
  };

  const onAddtionalInfoNeeded = async () => {
    setIsRequestingMoreInfo(true);
    await updateLoanApplicationStatus(
      loanApplication.id,
      LoanApplicationStatus.ADDITIONAL_INFO_NEEDED
    );
    setIsRequestingMoreInfo(false);
  };

  const disabled = isApproving || isRejecting || isRequestingMoreInfo;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={disabled} onClick={onApprove}>
          Approve
          {isApproving && <Spinner />}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={onReject}>
          Reject
          {isRejecting && <Spinner />}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={onAddtionalInfoNeeded}>
          Request More Info
          {isRequestingMoreInfo && <Spinner />}
        </DropdownMenuItem>
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
        href={`/borrower/loans/${row.getValue('id')}`}
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
