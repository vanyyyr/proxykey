import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalUsers, activeProxies, totalIncomeResult, availableProxies, recentPayments, recentUsers] =
      await Promise.all([
        db.user.count(),
        db.proxyKey.count({ where: { status: 'ACTIVE', userId: { not: null } } }),
        db.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'COMPLETED', amount: { gt: 0 } },
        }),
        db.proxyKey.count({ where: { status: 'AVAILABLE' } }),
        db.payment.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { status: 'COMPLETED' },
          include: { user: { select: { username: true, name: true } } },
        }),
        db.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, username: true, createdAt: true },
        }),
      ]);

    // Chart data - last 7 days
    const chartLabels: string[] = [];
    const chartData: number[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      chartLabels.push(d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayIncome = await db.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED', amount: { gt: 0 }, createdAt: { gte: startOfDay, lte: endOfDay } },
      });
      chartData.push(dayIncome._sum.amount || 0);
    }

    return NextResponse.json({
      totalUsers,
      activeProxies,
      totalIncome: totalIncomeResult._sum.amount || 0,
      availableProxies,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        username: p.user?.username || p.user?.name || 'unknown',
        createdAt: p.createdAt.toISOString(),
      })),
      recentUsers,
      chart: { labels: chartLabels, data: chartData },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
