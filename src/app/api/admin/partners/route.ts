import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'list'; // list or requests

  try {
    if (type === 'requests') {
      const requests = await db.withdrawalRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          partner: {
            include: { user: { select: { username: true, name: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ requests });
    }

    // Default to 'list'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where = search ? {
      user: {
        OR: [
          { username: { contains: search } },
          { name: { contains: search } }
        ]
      }
    } : {};

    const [partners, total, totalStats] = await Promise.all([
      db.partner.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            include: {
              _count: { select: { referrals: true } }
            }
          }
        },
        orderBy: { earnedBalance: 'desc' }
      }),
      db.partner.count({ where }),
      db.partner.aggregate({
        _sum: {
          earnedBalance: true,
          pendingBalance: true
        },
        _count: { id: true }
      })
    ]);

    const formattedPartners = partners.map(p => ({
      id: p.id,
      userId: p.userId,
      username: p.user.username,
      name: p.user.name,
      referralsCount: p.user._count.referrals,
      earnedBalance: p.earnedBalance,
      pendingBalance: p.pendingBalance
    }));

    return NextResponse.json({
      partners: formattedPartners,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      stats: {
        totalPartners: totalStats._count.id,
        totalToPay: totalStats._sum.pendingBalance || 0,
        totalEarned: totalStats._sum.earnedBalance || 0
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const request = await db.withdrawalRequest.findUnique({ where: { id } });
    if (!request || request.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      // In a real app, integrate with payment gateway here
      await db.$transaction([
        db.withdrawalRequest.update({
          where: { id },
          data: { status: 'APPROVED' }
        }),
        db.partner.update({
          where: { id: request.partnerId },
          data: { pendingBalance: { decrement: request.amount } }
        })
      ]);
      return NextResponse.json({ success: true, status: 'APPROVED' });
    }

    if (action === 'REJECT') {
      await db.$transaction([
        db.withdrawalRequest.update({
          where: { id },
          data: { status: 'REJECTED' }
        }),
        db.partner.update({
          where: { id: request.partnerId },
          data: { pendingBalance: { decrement: request.amount }, earnedBalance: { decrement: request.amount } } // Need to revert earned balance if rejected? Usually yes or return to user balance
        })
      ]);
      return NextResponse.json({ success: true, status: 'REJECTED' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
