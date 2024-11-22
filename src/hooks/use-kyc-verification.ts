'use client';

import { createKycVerificationRecord } from '@/app/actions/kyc/createKycRecord';
import { createKycLinkToken, getKycStatus, retryKyc } from '@/app/borrower/actions';
import { KYCVerificationStatus } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

const useKycVerification = (chainAccountAddress?: string) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCVerificationStatus | 'initial' | ''>('');

  const generateToken = useCallback(async () => {
    if (chainAccountAddress) {
      const data = await createKycLinkToken(chainAccountAddress);
      if (data) {
        setLinkToken(data.link_token);
      }
    }
  }, [chainAccountAddress]);

  /**
   * returns a shareable url, which can use to navigate user to a separate
   * kyc flow. After succeeded, they will need to navigate back.
   * status will be updated by the webhook
   */
  const retryKycVerification = async () => {
    if (chainAccountAddress) {
      const data = await retryKyc(chainAccountAddress);
      return data;
    }
    return null;
  };

  const config = {
    token: linkToken || '',
    onSuccess: async (_data: any, metadata: any) => {
      await createKycVerificationRecord(chainAccountAddress || '', metadata.link_session_id);
    },
    onExit: (err: any, metadata: any) => {
      console.log(
        `Exited early. Error: ${JSON.stringify(err)} Metadata: ${JSON.stringify(metadata)}`
      );
    },
  };

  const { open } = usePlaidLink(config);

  // Opens the KYC flow
  const startKYCFlow = async () => {
    if (linkToken) {
      open();
    }
  };

  useEffect(() => {
    const fetchKycStatus = async () => {
      if (!chainAccountAddress) return;

      const { identityVerificationData, hasAttemptedKyc } = await getKycStatus(chainAccountAddress);

      setKycStatus(identityVerificationData?.status || '');

      // Generate token if user hasn't attempted KYC or if previous attempt wasn't successful
      if (!hasAttemptedKyc || identityVerificationData?.status !== KYCVerificationStatus.success) {
        generateToken();
      }
    };

    fetchKycStatus();
  }, [chainAccountAddress, generateToken]);

  return { linkToken, retryKycVerification, kycStatus, startKYCFlow };
};

export default useKycVerification;
