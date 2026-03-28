import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = (searchParams.get('country') || '').toUpperCase();

    const where: Record<string, unknown> = { status: 'AVAILABLE' };
    if (country) {
      where.country = country;
    }

    const count = await db.proxyKey.count({ where });

    return NextResponse.json({
      success: true,
      count,
      country: country || 'ALL',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Proxy Count Error]:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
