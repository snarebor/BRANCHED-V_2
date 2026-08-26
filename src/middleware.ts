export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/listings/new',
    '/listings/:path*/edit',
    '/messages/:path*',
    '/favorites/:path*',
    '/profile/edit',
  ],
};
