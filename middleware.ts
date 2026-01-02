import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const adminPaths = ['/admin'];

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const isAdminRoute = adminPaths.some((path) => url.pathname.startsWith(path));

  if (!isAdminRoute) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.email) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
