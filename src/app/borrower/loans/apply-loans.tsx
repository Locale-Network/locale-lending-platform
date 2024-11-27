'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ApplyLoanButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/borrower/loans/apply');
  };

  return (
    <div>
      <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleClick}>
        <Plus className="mr-2 h-4 w-4" />
        New
      </Button>
    </div>
  );
}
