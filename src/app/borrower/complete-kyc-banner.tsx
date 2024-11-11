'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function CompleteKycBanner() {
  const router = useRouter();

  const handleClick = () => {
    alert('Complete KYC');
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-blue-100 p-4">
      Complete KYC Banner
      <Button variant="outline" size="icon" onClick={handleClick}>
        <ArrowRight/>
      </Button>
    </div>
  );
}
