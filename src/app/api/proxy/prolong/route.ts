import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

const PRICES: Record<number, Record<number, number>> = {
  4: { 7: 50, 14: 90, 30: 180, 60: 320, 90: 430 },
  3: { 7: 25, 14: 45, 30: 90, 60: 160, 90: 220 },
  6: { 3: 10, 7: 15, 14: 30, 30: 50, 60: 85, 90: 120 },
};

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const userId = payload.userId as string;
    const body = await req.json();
    const { proxyId, period = 30 } = body;

    if (!proxyId) {
      return NextResponse.json({ error: 'proxyId required' }, { status: 400 });
    }

    const proxyKey = await db.proxyKey.findFirst({ where: { id: proxyId, userId } });
    if (!proxyKey) {
      return NextResponse.json({ error: 'Proxy not found' }, { status: 404 });
    }

    const versionPrices = PRICES[proxyKey.version] || PRICES[4];
    const price = versionPrices[period];
    if (!price) {
      return NextResponse.json({ error: 'Unsupported period' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.balance < price) {
      return NextResponse.json({ error: 'Недостаточно средств', required: price, current: user?.balance || 0 }, { status: 402 });
    }

    const newExpiry = new Date(proxyKey.expiresAt || Date.now());
    newExpiry.setDate(newExpiry.getDate() + period);

    await db.$transaction([
      db.proxyKey.update({
        where: { id: proxyId },
        data: { expiresAt: newExpiry, status: 'ACTIVE' },
      }),
      db.user.update({
        where: { id: userId },
        data: { balance: { decrement: price } },
      }),
      db.payment.create({
        data: {
          amount: -price,
          method: 'Proxy Prolong',
          status: 'COMPLETED',
          transactionId: `prolong-${proxyId}-${Date.now()}`,
          userId,
        },
      }),
    ]);

    return NextResponse.json({ success: true, newExpiresAt: newExpiry, charged: price });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Proxy Prolong Error]:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
