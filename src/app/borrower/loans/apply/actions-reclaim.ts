'use server';

import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { validateRequest as validateBorrowerRequest } from '@/app/borrower/actions';

interface ReclaimProofResponse {
  requestUrl: string;
  statusUrl: string;
}

export async function initialiseReclaimPlaidProof({
  accountAddress,
  loanApplicationId,
}: {
  accountAddress: string;
  loanApplicationId: string;
}): Promise<ReclaimProofResponse> {
  await validateBorrowerRequest(accountAddress);

  const reclaimSuccessUrl = process.env.RECLAIM_SUCCESS_URL ?? '';

  const reclaimPlaidAppId = process.env.RECLAIM_PLAID_APP_ID;
  const reclaimPlaidSecretId = process.env.RECLAIM_PLAID_SECRET_ID;
  const reclaimPlaidProviderId = process.env.RECLAIM_PLAID_PROVIDER_ID;
  const reclaimPlaidCallbackUrl = process.env.RECLAIM_PLAID_CALLBACK_URL;

  if (
    !reclaimPlaidAppId ||
    !reclaimPlaidSecretId ||
    !reclaimPlaidProviderId ||
    !reclaimPlaidCallbackUrl
  ) {
    throw new Error('Missing plaid reclaim configuration');
  }

  const reclaimPlaidProofRequest = await ReclaimProofRequest.init(
    reclaimPlaidAppId,
    reclaimPlaidSecretId,
    reclaimPlaidProviderId,
    {
      log: false,
    }
  );

  reclaimPlaidProofRequest.setRedirectUrl(reclaimSuccessUrl);
  reclaimPlaidProofRequest.setAppCallbackUrl(reclaimPlaidCallbackUrl);

  const reclaimPlaidMessage = `debt service calculation for ${accountAddress} at ${new Date().toISOString()} for loan application ${loanApplicationId}`;
  reclaimPlaidProofRequest.addContext(accountAddress, reclaimPlaidMessage);

  const reclaimPlaidRequestUrl = await reclaimPlaidProofRequest.getRequestUrl();
  const reclaimPlaidStatusUrl = reclaimPlaidProofRequest.getStatusUrl();

  return {
    requestUrl: reclaimPlaidRequestUrl,
    statusUrl: reclaimPlaidStatusUrl,
  };
}

export async function initialiseReclaimCreditKarmaProof({
  accountAddress,
  loanApplicationId,
}: {
  accountAddress: string;
  loanApplicationId: string;
}): Promise<ReclaimProofResponse> {
  await validateBorrowerRequest(accountAddress);

  const reclaimSuccessUrl = process.env.RECLAIM_SUCCESS_URL ?? '';

  const reclaimCreditKarmaAppId = process.env.RECLAIM_CREDIT_KARMA_APP_ID;
  const reclaimCreditKarmaSecretId = process.env.RECLAIM_CREDIT_KARMA_SECRET_ID;
  const reclaimCreditKarmaProviderId = process.env.RECLAIM_CREDIT_KARMA_PROVIDER_ID;
  const reclaimCreditKarmaCallbackUrl = process.env.RECLAIM_CREDIT_KARMA_CALLBACK_URL;

  if (
    !reclaimCreditKarmaAppId ||
    !reclaimCreditKarmaSecretId ||
    !reclaimCreditKarmaProviderId ||
    !reclaimCreditKarmaCallbackUrl
  ) {
    throw new Error('Missing credit karma reclaim configuration');
  }

  const reclaimCreditKarmaProofRequest = await ReclaimProofRequest.init(
    reclaimCreditKarmaAppId,
    reclaimCreditKarmaSecretId,
    reclaimCreditKarmaProviderId,
    {
      log: false,
    }
  );

  reclaimCreditKarmaProofRequest.setRedirectUrl(reclaimSuccessUrl);
  reclaimCreditKarmaProofRequest.setAppCallbackUrl(reclaimCreditKarmaCallbackUrl);

  const reclaimCreditKarmaMessage = `credit score calculation for ${accountAddress} at ${new Date().toISOString()} for loan application ${loanApplicationId}`;
  reclaimCreditKarmaProofRequest.addContext(accountAddress, reclaimCreditKarmaMessage);

  const reclaimCreditKarmaRequestUrl = await reclaimCreditKarmaProofRequest.getRequestUrl();
  const reclaimCreditKarmaStatusUrl = reclaimCreditKarmaProofRequest.getStatusUrl();

  return {
    requestUrl: reclaimCreditKarmaRequestUrl,
    statusUrl: reclaimCreditKarmaStatusUrl,
  };
}
