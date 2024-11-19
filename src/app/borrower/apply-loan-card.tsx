'use client';

import { KycRedirectDialog } from '@/components/kyc-redirect-dialog';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useKycVerification from '@/hooks/use-kyc-verification';
import { KYCVerificationStatus } from '@prisma/client';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export default function ApplyLoanCard() {
  const router = useRouter();

  const { address: chainAccountAddress } = useAccount();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const { startKYCFlow, kycStatus, retryKycVerification } = useKycVerification(chainAccountAddress);

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

  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        window.open(redirectUrl, '_blank');
        setRedirectUrl(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [redirectUrl]);

  return (
    <div>
      <Card
        className="cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg"
        onClick={handleClick}
      >
        <CardHeader className="space-y-4">
          <div className="h-14 w-14 rounded-xl bg-blue-100 p-4">
            <Pencil className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold">Apply for loan</CardTitle>
            <CardDescription className="text-base leading-relaxed text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {redirectUrl && <KycRedirectDialog isOpen={!!redirectUrl} />}
    </div>
  );
}
