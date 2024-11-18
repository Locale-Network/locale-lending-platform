'use client';

import useKycVerification from '@/hooks/use-kyc-verification';
import { KYCVerificationStatus } from '@prisma/client';
import { Button } from './ui/button';

const KycFeature: React.FC<{ clientUserId?: string }> = props => {
  const { startKYCFlow, kycStatus , linkToken} = useKycVerification(props.clientUserId);

  return (
    <div>
      {kycStatus === KYCVerificationStatus.success ? (
        'Success'
      ) : (
        <Button disabled={!linkToken} onClick={() => startKYCFlow()}>
          {kycStatus === 'failed' ? 'Retry' : 'Verify KYC'}
        </Button>
      )}
    </div>
  );
};

export default KycFeature;
