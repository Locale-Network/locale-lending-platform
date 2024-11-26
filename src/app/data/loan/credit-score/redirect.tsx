'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
  accountAddress?: string;
}

export default function Redirect({ accountAddress }: Props) {
  const router = useRouter();

  console.log('redirecting...');

  useEffect(() => {
    console.log('redirecting... /', accountAddress);
    if (accountAddress) {
      return;
    }

    router.replace(`/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
  }, [router, accountAddress]);

  return null;
}
