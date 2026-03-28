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
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = payload.userId as string;
    const body = await req.json();
    const { count = 1, period = 30, country = '', version = 4, type = 'http' } = body;

    const versionPrices = PRICES[version] || PRICES[4];
    const pricePerProxy = versionPrices[period];
    if (!pricePerProxy) {
      return NextResponse.json({ error: 'Неподдерживаемый период' }, { status: 400 });
    }
    const totalPrice = pricePerProxy * count;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }
    if (user.balance < totalPrice) {
      return NextResponse.json({
        error: 'Недостаточно средств',
        required: totalPrice,
        current: user.balance,
      }, { status: 402 });
    }

    const countryUpper = country ? country.toUpperCase() : undefined;
    const where: Record<string, unknown> = { status: 'AVAILABLE' };
    if (countryUpper) {
      where.country = countryUpper;
    }

    const availableProxies = await db.proxyKey.findMany({
      where,
      take: count,
      orderBy: { createdAt: 'asc' },
    });

    if (availableProxies.length < count) {
      return NextResponse.json({
        error: `Недостаточно прокси в наличии. Доступно: ${availableProxies.length}`,
      }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + period);

    const assignedProxies = await db.$transaction([
      ...availableProxies.map((proxy) =>
        db.proxyKey.update({
          where: { id: proxy.id },
          data: {
            userId,
            status: 'ACTIVE',
            assignedAt: new Date(),
            expiresAt,
            type: type || proxy.type,
          },
        })
      ),
      db.user.update({
        where: { id: userId },
        data: { balance: { decrement: totalPrice } },
      }),
      db.payment.create({
        data: {
          amount: -totalPrice,
          method: 'Proxy Purchase',
          status: 'COMPLETED',
          transactionId: `proxy-${Date.now()}`,
          userId,
        },
      }),
    ]);

    const proxies = assignedProxies.slice(0, count).map((p) => ({
      ip: p.ip,
      port: p.port,
      login: p.login,
      password: p.password,
      type: p.type,
      country: p.country,
      expiresAt: p.expiresAt,
      version: p.version,
      protocol: p.protocol,
      key: p.key,
    }));

    return NextResponse.json({
      success: true,
      proxies,
      charged: totalPrice,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Proxy Buy Error]:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
