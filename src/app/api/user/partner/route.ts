import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const userId = payload.userId as string;

    let partner = await db.partner.findUnique({ where: { userId } });
    if (!partner) {
      partner = await db.partner.create({ data: { userId } });
    }

    const referralsCount = await db.user.count({ where: { referrerId: userId } });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proxykey.vercel.app';
    const referralLink = `${siteUrl}/dashboard?ref=${userId}`;

    return NextResponse.json({
      partner: {
        earnedBalance: partner.earnedBalance,
        pendingBalance: partner.pendingBalance,
      },
      referralsCount,
      referralLink,
    });
  } catch (error) {
    console.error('[Partner GET Error]:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const userId = payload.userId as string;
    const body = await req.json();
    const { action, amount, wallet } = body;

    if (action === 'WITHDRAW') {
      if (!amount || amount <= 0 || !wallet) {
        return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
      }

      const partner = await db.partner.findUnique({ where: { userId } });
      if (!partner || partner.earnedBalance < amount) {
        return NextResponse.json({ error: 'Недостаточно средств для вывода' }, { status: 400 });
      }

      await db.$transaction([
        db.withdrawalRequest.create({
          data: {
            amount,
            wallet,
            status: 'PENDING',
            partnerId: partner.id,
          },
        }),
        db.partner.update({
          where: { id: partner.id },
          data: {
            earnedBalance: { decrement: amount },
            pendingBalance: { increment: amount },
          },
        }),
      ]);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[Partner POST Error]:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
