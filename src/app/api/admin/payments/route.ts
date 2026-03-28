import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const status = searchParams.get('status') || '';
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { username: true, name: true, telegramId: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.payment.count({ where }),
    ]);

    const formatted = payments.map(p => ({
      id: p.id,
      amount: p.amount,
      method: p.method,
      status: p.status,
      transactionId: p.transactionId,
      createdAt: p.createdAt.toISOString(),
      userId: p.userId,
      username: p.user?.username || p.user?.name || 'unknown',
    }));

    return NextResponse.json({
      payments: formatted,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
