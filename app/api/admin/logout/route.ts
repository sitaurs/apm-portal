import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  console.log('[Logout] Clearing cookies...');
  
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Clear the main auth cookie (apm_auth_token)
  res.cookies.delete(AUTH_COOKIE_NAME);
  
  // Clear legacy cookie (admin_token)
  res.cookies.delete(LEGACY_COOKIE_NAME);

  // Clear any other auth-related cookies
  res.cookies.delete('admin_refresh_token');
  res.cookies.delete('admin_auth');

  console.log('[Logout] All auth cookies cleared');
  return res;
}

// Also support GET for simple logout links
export async function GET(request: NextRequest) {
  console.log('[Logout GET] Clearing cookies and redirecting...');
  
  const res = NextResponse.redirect(new URL('/admin/login', request.url));
  
  // Clear all cookies
  res.cookies.delete(AUTH_COOKIE_NAME);
  res.cookies.delete(LEGACY_COOKIE_NAME);
  res.cookies.delete('admin_refresh_token');
  res.cookies.delete('admin_auth');

  console.log('[Logout GET] Cookies cleared, redirecting to login');
  return res;
}

