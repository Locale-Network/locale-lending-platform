"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

const useKycVerification = () => {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const generateToken = useCallback(async () => {
    try {
      const response = await fetch("/api/plaid/kyc/link-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account: "wallet 1" }),
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

  const requestUserData = useCallback(async (identity_verification_id: string) => {
    const response = await fetch("/api/plaid/kyc/verified", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identity_verification_id }),
    });
    return response;
  }, []);

  const config = {
    token: linkToken || "",
    onSuccess: async (_data: any, metadata: any) => {
      await requestUserData(metadata.link_session_id);
    },
    onExit: (err: any, metadata: any) => {
      console.log(`Exited early. Error: ${JSON.stringify(err)} Metadata: ${JSON.stringify(metadata)}`);
    },
  };

  const { open } = usePlaidLink(config);

  const openKycLink = async () => {
    if (linkToken) {
      await open();
    }
  };

  useEffect(() => {
    generateToken();
  }, [generateToken]);

  return { generateToken, openKycLink, linkToken };
};

export default useKycVerification;
