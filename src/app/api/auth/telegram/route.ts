import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

function validateTelegramData(data: Record<string, unknown>): boolean {
  const { hash, ...userData } = data;
  if (!hash || typeof hash !== 'string') return false;

  const dataCheckArr = Object.keys(userData)
    .sort()
    .map(key => `${key}=${userData[key]}`);
  const dataCheckString = dataCheckArr.join('\n');

  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return hmac === hash;
}

// Check login token status (polled by frontend)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const setting = await db.settings.findUnique({
    where: { key: `login_${token}` },
  });

  if (!setting) {
    return NextResponse.json({ authenticated: false });
  }

  // Token was authenticated by the bot — return session token
  const sessionToken = setting.value;

  // Clean up the login token
  await db.settings.delete({ where: { key: `login_${token}` } }).catch(() => {});

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set('user_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return response;
}

// Direct Telegram widget callback (fallback)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { hash, ...userData } = data;

    if (!hash) {
      return NextResponse.json({ error: 'Missing hash' }, { status: 400 });
    }

    if (!validateTelegramData(data)) {
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
