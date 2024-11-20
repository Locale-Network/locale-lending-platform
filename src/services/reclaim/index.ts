export enum Reason {
  AccountVerification = 'accountVerification',
  // add other reasons here
}

export interface SignInBody {
  providerId: string;
  account: string;
  deeplink_url: string;
  reason: Reason;
}

export class ReclaimService {
  baseUrl: string;
  providerId: string;
  constructor(baseUrl: string, providerId: string) {
    this.baseUrl = baseUrl;
    this.providerId = providerId;
  }

  async signIn(account: string): Promise<string> {
    const body: SignInBody = {
      providerId: this.providerId,
      account,
      deeplink_url: window.location.href.split('#')[0],
      reason: Reason.AccountVerification,
    };

    const response = await fetch(`${this.baseUrl}/api/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      throw new Error('Invalid response');
    }

    const {
      data: { signedUrl },
    } = await response.json();

    return signedUrl;
  }
}
