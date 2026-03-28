import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  try {
    const where = search ? {
      OR: [
        { id: { contains: search } },
        { username: { contains: search } },
        { name: { contains: search } },
      ],
    } : {};

    const [users, total, totalUsers, positiveBalanceUsers] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          payments: { select: { amount: true } },
          _count: { select: { payments: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where }),
      db.user.count(),
      db.user.count({ where: { balance: { gt: 0 } } })
    ]);

    const formattedUsers = users.map(user => {
      const paymentsSum = user.payments.reduce((sum, p) => sum + p.amount, 0);
      return {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        name: user.name,
        email: user.email,
        verificationsCount: user.verificationsCount,
        balance: user.balance,
        paymentsCount: user._count.payments,
        paymentsSum,
        role: user.role
      };
    });

    return NextResponse.json({
      users: formattedUsers,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      stats: { totalUsers, positiveBalanceUsers }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, action, data } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (action === 'UPDATE_BALANCE') {
      const user = await db.user.update({
        where: { id },
        data: { balance: data.balance },
      });
      return NextResponse.json({ success: true, user });
    }

    if (action === 'ADD_BALANCE') {
      // Increment (positive) or decrement (negative) balance
      const amount = parseFloat(data.amount);
      if (isNaN(amount)) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }
      const [user] = await db.$transaction([
        db.user.update({
          where: { id },
          data: { balance: { increment: amount } },
        }),
        db.payment.create({
          data: {
            amount,
            method: amount > 0 ? 'Admin (начисление)' : 'Admin (списание)',
            status: 'COMPLETED',
            transactionId: `admin-${Date.now()}`,
            userId: id,
          },
        }),
      ]);
      return NextResponse.json({ success: true, user });
    }

    if (action === 'BAN') {
      const user = await db.user.update({
        where: { id },
        data: { role: 'BANNED' },
      });
      return NextResponse.json({ success: true, user });
    }

    if (action === 'UNBAN') {
      const user = await db.user.update({
        where: { id },
        data: { role: 'USER' },
      });
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
