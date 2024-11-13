"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

const useKycVerification = (userId?: string) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const generateToken = useCallback(async () => {
    try {
      const response = await fetch("/api/plaid/kyc/link-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({account: "wallet 1221"}), // TODO: replace with chain account address
      });

      if (!response.ok) {
        throw new Error("Failed to generate link token");
      }

      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error) {
      console.error("Error generating token:", error);
    }
  }, []);

  const requestUserData = useCallback(
    async (identity_verification_id: string) => {
      const response = await fetch(
        `/api/plaid/kyc/verified?verificationId=${identity_verification_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    },
    []
  );

  const config = {
    token: linkToken || "",
    onSuccess: async (_data: any, metadata: any) => {
      await requestUserData(metadata.link_session_id);
    },
    onExit: (err: any, metadata: any) => {
      console.log(
        `Exited early. Error: ${JSON.stringify(err)} Metadata: ${JSON.stringify(
          metadata
        )}`
      );
    },
  };

  const {open} = usePlaidLink(config);

  // Opens the KYC flow
  const startKYCFlow = async () => {
    if (linkToken) {
      await open();
    }
  };

  /**
   * returns a shareable url, which can use to navigate user to a separate
   * kyc flow. After succeeded, they will need to navigate back.
   * status will be updated by the webhook
   */
  const retryKycVerification = async () => {
    if (userId) {
      const response = await fetch("/api/plaid/kyc/retry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({account: userId}),
      });

      const data = await response.json();
      return data;
    }
    return "No User Id";
  };

  useEffect(() => {
    if (userId) {
      generateToken();
    }
  }, [generateToken, userId]);

  return {generateToken, startKYCFlow, linkToken, retryKycVerification};
};

export default useKycVerification;
