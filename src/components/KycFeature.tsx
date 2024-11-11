'use client';

import useKycVerification from "@/hooks/useKycVerification";
import { Button } from "./ui/button";

const IdentityVerification: React.FC<{ clientUserId?: string }> = () => {
  const { openKycLink, linkToken } = useKycVerification();

  return (
    <div>
      <Button disabled={!linkToken} onClick={openKycLink}>
        Verify KYC
      </Button>
    </div>
  );
};

export default IdentityVerification;
