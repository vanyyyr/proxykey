import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// GET — handles both:
// 1. Telegram Login Widget callback (with hash param)
// 2. Bot deep link callback (with token param)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // ─── Bot deep link flow: ?token=xxx ───
    const token = searchParams.get('token');
    if (token) {
      // Check if the bot has authenticated this token
      const setting = await db.settings.findUnique({
        where: { key: `login_${token}` },
      });

      if (!setting || setting.value === 'pending') {
        // Token not yet authenticated — redirect to dashboard with waiting status
        return NextResponse.redirect(new URL('/dashboard?waiting=1', req.url));
      }

      // Token is authenticated — value is the session JWT
      const sessionToken = setting.value;

      // Clean up the login token
      await db.settings.delete({ where: { key: `login_${token}` } }).catch(() => {});

      // Set session cookie and redirect
      const response = NextResponse.redirect(new URL('/dashboard', req.url));
      response.cookies.set('user_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      return response;
    }

    // ─── Telegram Login Widget callback: ?hash=xxx ───
    const hash = searchParams.get('hash');
    if (!hash) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Build data object from query params
    const userData: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'hash') userData[key] = value;
    });

    // Validate hash
    const dataCheckArr = Object.keys(userData)
      .sort()
      .map(key => `${key}=${userData[key]}`);
    const dataCheckString = dataCheckArr.join('\n');

    const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (hmac !== hash) {
      return NextResponse.redirect(new URL('/dashboard?error=invalid_hash', req.url));
    }

    // Check expiration
    const authDate = parseInt(userData.auth_date, 10);
    if (Date.now() / 1000 - authDate > 86400) {
      return NextResponse.redirect(new URL('/dashboard?error=auth_expired', req.url));
    }

    // Find or create user
    const telegramId = userData.id;
    const username = userData.username || null;
    const name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Без имени';

    let user = await db.user.findUnique({ where: { telegramId } });

    if (!user) {
      user = await db.user.create({
        data: { telegramId, username, name, balance: 0, verificationsCount: 0 },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: { username, name },
      });
    }

    const sessionToken = await signToken({ userId: user.id, role: user.role });

    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.cookies.set('user_session', sessionToken, {
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
