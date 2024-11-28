import { LoanApplicationStatus } from '@prisma/client';
import { normalizeCreditScore } from './number';

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

export const creditScoreProgressColor = (rangeMin: number, rangeMax: number, score: number) => {
  const normalizedScore = normalizeCreditScore(rangeMin, rangeMax, score);

  if (normalizedScore < 30) return 'bg-red-500'; // 0-30%
  if (normalizedScore < 50) return 'bg-orange-500'; // 30-50%
  if (normalizedScore < 70) return 'bg-yellow-500'; // 50-70%
  if (normalizedScore < 90) return 'bg-green-500'; // 70-90%
  return 'bg-blue-500'; // 90-100%
};
