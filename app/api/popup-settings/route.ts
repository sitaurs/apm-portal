/**
 * API Route: Public Popup Settings
 * GET /api/popup-settings - Get popup enabled status
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get site settings
    const settings = await prisma.siteSettings.findFirst({
      where: { id: 1 },
    });

    return NextResponse.json({
      enabled: settings?.popup_enabled ?? true,
      title: settings?.popup_title ?? 'Open Recruitment 2026',
      message: settings?.popup_message ?? 'Bergabung dengan Tim APM Polinema!',
    });
  } catch (error) {
    console.error('Error fetching popup settings:', error);
    // Default to enabled if error
    return NextResponse.json({
      enabled: true,
      title: 'Open Recruitment 2026',
      message: 'Bergabung dengan Tim APM Polinema!',
    });
  }
}
