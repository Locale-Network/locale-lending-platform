import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/signin',
  },
});

// Protect all routes under /borrower
export const config = {
  matcher: [
    '/borrower/:path*',
    // Add other protected routes here
  ],
};
