import { NextRequest, NextResponse } from 'next/server';

/**
 * Custom pricing for proxies.
 * Periods match Proxy6 API: 3, 7, 14, 30, 60, 90 days
 * IPv4/Shared min 7 days, IPv6 min 3 days
 */

// ─── Our Retail Prices (RUB) ──────────────────────────────────────────────
const PRICES: Record<number, Record<number, number>> = {
  // IPv4 (min 7 days)
  4: {
    7:  50,
    14: 90,
    30: 180,
    60: 320,
    90: 430,
  },
  // IPv4 Shared (min 7 days)
  3: {
    7:  25,
    14: 45,
    30: 90,
    60: 160,
    90: 220,
  },
  // IPv6 (min 3 days)
  6: {
    3:  10,
    7:  15,
    14: 30,
    30: 50,
    60: 85,
    90: 120,
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const count = Math.max(1, Math.min(100, parseInt(searchParams.get('count') || '1', 10)));
    const period = parseInt(searchParams.get('period') || '30', 10);
    const version = parseInt(searchParams.get('version') || '4', 10);

    const versionPrices = PRICES[version] || PRICES[4];
    const pricePerProxy = versionPrices[period];

    if (!pricePerProxy) {
      return NextResponse.json({ error: 'Неподдерживаемый период' }, { status: 400 });
    }

    const totalPrice = pricePerProxy * count;

    return NextResponse.json({
      success: true,
      price: totalPrice,
      pricePerProxy,
      count,
      period,
      version,
    });

  } catch (error: any) {
    console.error('[Proxy Price Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
