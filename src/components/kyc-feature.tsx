'use client';

import useKycVerification from '@/hooks/use-kyc-verification';
import { Button } from './ui/button';

const IdentityVerification: React.FC<{ clientUserId?: string }> = props => {
  const { startKYCFlow, linkToken } = useKycVerification(props.clientUserId);

  console.log('linkToken', linkToken);

  return (
    <div>
      <Button disabled={!linkToken} onClick={startKYCFlow}>
        Verify KYC
      </Button>
    </div>
  );
};

export default IdentityVerification;
