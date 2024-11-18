'use client';

import { Button } from '@/components/ui/button';
import useKycVerification from '@/hooks/use-kyc-verification';
import { KYCVerificationStatus } from '@prisma/client';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function ApplyLoanButton() {
  const { address: chainAccountAddress } = useAccount();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const { startKYCFlow, kycStatus, retryKycVerification } = useKycVerification(chainAccountAddress);
  const router = useRouter();

  const handleClick = async () => {
    if (kycStatus === KYCVerificationStatus.success) {
      router.push('/borrower/loans/apply');
    } else if (kycStatus === KYCVerificationStatus.failed) {
      const data = await retryKycVerification();
      if (data?.shareable_url) {
        setRedirectUrl(data.shareable_url);
      }
    } else {
      await startKYCFlow();
    }
  };

  return (
    <Button
      disabled={!kycStatus}
      className="bg-blue-600 text-white hover:bg-blue-700"
      onClick={handleClick}
    >
      <Plus className="mr-2 h-4 w-4" />
      New
    </Button>
  );
}
