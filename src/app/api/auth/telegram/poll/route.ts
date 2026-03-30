import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Check if login token has been authenticated by the bot
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const setting = await db.settings.findUnique({
      where: { key: `login_${token}` },
    });

    if (!setting) {
      return NextResponse.json({ authenticated: false, status: 'not_found' });
    }

    if (setting.value === 'pending') {
      return NextResponse.json({ authenticated: false, status: 'pending' });
    }

    // Token is authenticated — value is the session JWT
    const sessionToken = setting.value;

    // Clean up the login token
    await db.settings.delete({ where: { key: `login_${token}` } }).catch(() => {});

    // Set session cookie directly and return success
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set('user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('[Login Poll Error]:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
