import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// GET — callback from Telegram Login Widget (data-auth-url)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const hash = searchParams.get('hash');
    console.log('[TG Callback] Hash:', hash ? 'present' : 'missing');

    if (!hash) {
      return NextResponse.redirect(new URL('/dashboard?error=no_hash', req.url));
    }

    // Build data object from query params
    const userData: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'hash') userData[key] = value;
    });
    console.log('[TG Callback] UserData:', JSON.stringify(userData));

    // Validate hash
    const dataCheckArr = Object.keys(userData)
      .sort()
      .map(key => `${key}=${userData[key]}`);
    const dataCheckString = dataCheckArr.join('\n');
    console.log('[TG Callback] DataCheckString:', dataCheckString);

    const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    console.log('[TG Callback] Expected:', hmac, 'Got:', hash);

    if (hmac !== hash) {
      console.error('[TG Callback] Invalid hash');
      return NextResponse.redirect(new URL('/dashboard?error=invalid_hash', req.url));
    }

    // Check expiration (24 hours)
    const authDate = parseInt(userData.auth_date, 10);
    if (Date.now() / 1000 - authDate > 86400) {
      return NextResponse.redirect(new URL('/dashboard?error=auth_expired', req.url));
    }

    // Find or create user
    const telegramId = userData.id;
    const username = userData.username || null;
    const name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Без имени';
    console.log('[TG Callback] User:', telegramId, username, name);

    let user = await db.user.findUnique({ where: { telegramId } });

    if (!user) {
      user = await db.user.create({
        data: { telegramId, username, name, balance: 0, verificationsCount: 0 },
      });
      console.log('[TG Callback] Created user:', user.id);
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: { username, name },
      });
      console.log('[TG Callback] Updated user:', user.id);
    }

    // Create session
    const token = await signToken({ userId: user.id, role: user.role });
    console.log('[TG Callback] Token created, redirecting to dashboard');

    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.cookies.set('user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('[TG Callback] Error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=server', req.url));
  }
}

// POST — direct auth from script widget (data-onauth)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { hash, ...userData } = data;

    if (!hash) {
      return NextResponse.json({ error: 'Missing hash' }, { status: 400 });
    }

    // Validate hash
    const dataCheckArr = Object.keys(userData)
      .sort()
      .map(key => `${key}=${userData[key]}`);
    const dataCheckString = dataCheckArr.join('\n');

    const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (hmac !== hash) {
      return NextResponse.json({ error: 'Invalid hash' }, { status: 403 });
    }

    const authDate = parseInt(String(userData.auth_date), 10);
    if (Date.now() / 1000 - authDate > 86400) {
      return NextResponse.json({ error: 'Auth expired' }, { status: 403 });
    }

    const telegramId = String(userData.id);
    let user = await db.user.findUnique({ where: { telegramId } });

    if (!user) {
      user = await db.user.create({
        data: {
          telegramId,
          username: (userData.username as string) || null,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Без имени',
        },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          username: (userData.username as string) || user.username,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || user.name,
        },
      });
    }

    const token = await signToken({ userId: user.id, role: user.role });

    const response = NextResponse.json({ success: true, redirect: '/dashboard' });
    response.cookies.set('user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('Telegram auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
