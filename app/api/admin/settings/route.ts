/**
 * API Route: Admin Site Settings
 * GET /api/admin/settings - Get popup settings
 * PUT /api/admin/settings - Update popup settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Verify admin authentication
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function GET() {
  try {
    // Get or create site settings
    let settings = await prisma.siteSettings.findFirst({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 1,
          popup_enabled: true,
          popup_title: 'Open Recruitment 2026',
          popup_message: 'Bergabung dengan Tim APM Polinema!',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        popup_enabled: settings.popup_enabled,
        popup_title: settings.popup_title,
        popup_message: settings.popup_message,
      },
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { popup_enabled, popup_title, popup_message } = body;

    // Update or create settings
    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        popup_enabled: popup_enabled ?? true,
        popup_title: popup_title ?? 'Open Recruitment 2026',
        popup_message: popup_message ?? 'Bergabung dengan Tim APM Polinema!',
      },
      create: {
        id: 1,
        popup_enabled: popup_enabled ?? true,
        popup_title: popup_title ?? 'Open Recruitment 2026',
        popup_message: popup_message ?? 'Bergabung dengan Tim APM Polinema!',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        popup_enabled: settings.popup_enabled,
        popup_title: settings.popup_title,
        popup_message: settings.popup_message,
      },
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
