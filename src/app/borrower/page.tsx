'use client';

import { useAuthRedirect } from '@/hooks/use-auth-redirect';

export default function Page() {
  const { isLoading, isAuthenticated, session } = useAuthRedirect();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <>
      <div>BorrowerPage</div>
    </>
  );
}
