import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const days = Math.min(parseInt(searchParams.get('days') || '7', 10), 365);

    const [totalIncomeResult, totalUsersCount, activeProxiesCount] = await Promise.all([
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED', amount: { gt: 0 } },
      }),
      db.user.count(),
      db.proxyKey.count({ where: { status: 'ACTIVE', userId: { not: null } } }),
    ]);

    const currentDate = new Date();
    const chartLabels: string[] = [];
    const chartData: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - i);
      chartLabels.push(d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));

      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayIncome = await db.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          amount: { gt: 0 },
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      });

      chartData.push(dayIncome._sum.amount || 0);
    }

    return NextResponse.json({
      summary: {
        totalIncome: totalIncomeResult._sum.amount || 0,
        totalUsers: totalUsersCount,
        activeProxies: activeProxiesCount,
      },
      chart: {
        labels: chartLabels,
        data: chartData,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
