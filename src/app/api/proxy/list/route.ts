import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = payload.userId as string;

    const proxies = await db.proxyKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      proxies: proxies.map(p => ({
        id: p.id,
        ip: p.ip,
        port: p.port,
        login: p.login,
        password: p.password,
        protocol: p.protocol,
        type: p.type,
        country: p.country,
        version: p.version,
        status: p.status,
        expiresAt: p.expiresAt,
        proxyExternalId: p.proxyExternalId,
        key: p.key,
        createdAt: p.createdAt
      }))
    });

  } catch (error: any) {
    console.error('[Proxy List Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
