import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || ''; // 'AVAILABLE', 'ASSIGNED', 'EXPIRED'
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  try {
    const where = status ? { status } : {};

    const [keys, total] = await Promise.all([
      db.proxyKey.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { username: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.proxyKey.count({ where })
    ]);

    return NextResponse.json({
      keys,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch proxy keys' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Sync proxies from Webshare API
    if (data.action === 'SYNC_WEBSHARE') {
      const { getAllProxies } = await import('@/lib/webshare');
      const webshareProxies = await getAllProxies('direct');

      let created = 0;
      let skipped = 0;

      for (const wp of webshareProxies) {
        const existing = await db.proxyKey.findFirst({
          where: { proxyExternalId: wp.id },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await db.proxyKey.create({
          data: {
            key: `${wp.proxy_address}:${wp.port}:${wp.username}:${wp.password}`,
            proxyExternalId: wp.id,
            protocol: 'HTTPS',
            ip: wp.proxy_address,
            port: wp.port,
            login: wp.username,
            password: wp.password,
            type: 'http',
            country: wp.country_code,
            version: 4,
            status: 'AVAILABLE',
          },
        });
        created++;
      }

      return NextResponse.json({ success: true, created, skipped, total: webshareProxies.length });
    }

    // Mass import from pool textarea
    if (data.action === 'IMPORT_POOL') {
      const pool: string = data.pool; // Format: ip:port:login:password per line
      if (!pool) return NextResponse.json({ error: 'Empty pool' }, { status: 400 });

      const lines = pool.split('\n').filter(l => l.trim() !== '');
      let created = 0;

      for (const line of lines) {
        const [ip, portStr, login, password] = line.split(':');
        if (ip && portStr && login && password) {
          const port = parseInt(portStr);
          // Generate unique key
          const key = `pk_${Math.random().toString(36).substr(2, 9)}`;
          
          await db.proxyKey.create({
            data: {
              key,
              protocol: 'HTTP', // Default
              ip,
              port,
              login,
              password,
              status: 'AVAILABLE'
            }
          });
          created++;
        }
      }

      return NextResponse.json({ success: true, created });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Proxy keys error:', error);
    return NextResponse.json({ error: 'Failed to process proxy keys' }, { status: 500 });
  }
}
