import { LoanApplicationStatus } from '@prisma/client';

export const getLoanStatusStyle = (status: LoanApplicationStatus) => {
  const statusStyles: Record<LoanApplicationStatus, string> = {
    APPROVED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    ADDITIONAL_INFO_NEEDED: 'bg-blue-100 text-blue-800',
    DRAFT: 'bg-gray-100 text-gray-800',
  };

  return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';
};
