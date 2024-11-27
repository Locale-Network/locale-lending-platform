'use client';

import { createKycVerificationRecord } from '@/app/actions/kyc/createKycRecord';
import { createKycLinkToken, getKycStatus, retryKyc } from '@/app/borrower/actions';
import { KYCVerificationStatus } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

const useKycVerification = (accountAddress?: string) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCVerificationStatus | 'initial' | ''>('');

  const generateToken = useCallback(async () => {
    if (accountAddress) {
      const data = await createKycLinkToken(accountAddress);
      if (data) {
        setLinkToken(data.link_token);
      }
    }
  }, [accountAddress]);

  /**
   * returns a shareable url, which can use to navigate user to a separate
   * kyc flow. After succeeded, they will need to navigate back.
   * status will be updated by the webhook
   */
  const retryKycVerification = async () => {
    if (accountAddress) {
      const data = await retryKyc(accountAddress);
      return data;
    }
    return null;
  };

  const config = {
    token: linkToken || '',
    onSuccess: async (_data: any, metadata: any) => {
      await createKycVerificationRecord(accountAddress || '', metadata.link_session_id);
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
      if (!accountAddress) return;

      const { identityVerificationData, hasAttemptedKyc } = await getKycStatus(accountAddress);

      setKycStatus(identityVerificationData?.status || '');

      // Generate token if user hasn't attempted KYC or if previous attempt wasn't successful
      if (!hasAttemptedKyc || identityVerificationData?.status !== KYCVerificationStatus.success) {
        generateToken();
      }
    };

    fetchKycStatus();
  }, [accountAddress, generateToken]);

  return { linkToken, retryKycVerification, kycStatus, startKYCFlow };
};

export default useKycVerification;
