import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import {
  getIdentityVerificationStatus,
  createLinkTokenForIdentityVerification,
  retryIdentityVerification,
} from './actions';
import CompleteIdentityVerification from './complete-identity-verification';
import RetryIdentityVerification from './retry-identity-verification';
import SuccessIdentityVerification from './success-identity-verification';
import PendingIdentityVerification from './pending-identity-verification';
import { KYCVerificationStatus } from '@prisma/client';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const accountAddress = session?.address;

  if (!accountAddress) {
    return null;
  }

  const {
    isError: isIdentityVerificationError,
    errorMessage: identityVerificationErrorMessage,
    hasAttemptedKyc,
    identityVerificationData,
  } = await getIdentityVerificationStatus(accountAddress);

  if (isIdentityVerificationError) {
    return <div>{identityVerificationErrorMessage}</div>;
  }

  if (
    !hasAttemptedKyc ||
    !identityVerificationData ||
    identityVerificationData.status === KYCVerificationStatus.canceled ||
    identityVerificationData.status === KYCVerificationStatus.expired ||
    identityVerificationData.status === KYCVerificationStatus.active
  ) {
    const { isError, errorMessage, linkToken } =
      await createLinkTokenForIdentityVerification(accountAddress);

    if (isError || !linkToken) {
      return <div>{errorMessage}</div>;
    }

    return <CompleteIdentityVerification linkToken={linkToken} accountAddress={accountAddress} />;
  }

  if (hasAttemptedKyc && identityVerificationData.status === KYCVerificationStatus.failed) {
    const { isError, errorMessage, retryIdentityVerificationData } =
      await retryIdentityVerification(accountAddress);

    if (isError || !retryIdentityVerificationData) {
      return <div>{errorMessage}</div>;
    }

    return (
      <RetryIdentityVerification
        accountAddress={accountAddress}
        identityVerificationData={identityVerificationData}
        retryIdentityVerificationData={retryIdentityVerificationData}
      />
    );
  }

  if (hasAttemptedKyc && identityVerificationData.status === KYCVerificationStatus.success) {
    return (
      <SuccessIdentityVerification
        accountAddress={accountAddress}
        identityVerificationData={identityVerificationData}
      />
    );
  }

  if (hasAttemptedKyc && identityVerificationData.status === KYCVerificationStatus.pending_review) {
    return (
      <PendingIdentityVerification
        accountAddress={accountAddress}
        identityVerificationData={identityVerificationData}
      />
    );
  }
}
