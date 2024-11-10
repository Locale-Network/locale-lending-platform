'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ApplyLoanButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/borrower/loans/apply');
  };

  return (
    <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleClick}>
      <PlusCircle className="mr-2 h-4 w-4" />
      New
    </Button>
  );
}
