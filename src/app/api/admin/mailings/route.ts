import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { bot } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, filters, message } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const where: Record<string, unknown> = {};

    if (filters) {
      if (filters.balance?.enabled) {
        const op =
          filters.balance.operator === '=' ? 'equals' : filters.balance.operator === '>' ? 'gt' : 'lt';
        where.balance = { [op]: parseFloat(filters.balance.value) };
      }
      if (filters.verificationsCount?.enabled) {
        const op =
          filters.verificationsCount.operator === '='
            ? 'equals'
            : filters.verificationsCount.operator === '>'
              ? 'gt'
              : 'lt';
        where.verificationsCount = { [op]: parseInt(filters.verificationsCount.value) };
      }
      if (filters.paymentsCount?.enabled) {
        where.payments = { some: {} };
      }
    }

    if (action === 'CHECK_LIST') {
      const count = await db.user.count({ where });
      return NextResponse.json({ count });
    }

    if (action === 'SEND') {
      if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }

      const users = await db.user.findMany({
        where: { ...where, telegramId: { not: null } },
        select: { telegramId: true },
      });

      const audienceCount = users.length;
      let sentCount = 0;

      for (const user of users) {
        if (!user.telegramId) continue;
        try {
          await bot.telegram.sendMessage(user.telegramId, message, { parse_mode: 'HTML' });
          sentCount++;
        } catch (err) {
          console.error(`Failed to send to ${user.telegramId}:`, err);
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const mailing = await db.mailing.create({
        data: {
          message,
          filters: JSON.stringify(filters || {}),
          audienceCount,
          status: 'COMPLETED',
        },
      });

      return NextResponse.json({ success: true, mailing, audienceCount, sentCount });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Mailing error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
