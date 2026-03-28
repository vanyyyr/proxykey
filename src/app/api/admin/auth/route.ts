import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, getAdminSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Пароль обязателен' }, { status: 400 });
    }

    const adminPasswordSetting = await db.settings.findUnique({
      where: { key: 'admin_password' },
    });

    let isMatch = false;

    if (!adminPasswordSetting) {
      // First time setup — hash and save the password
      const hashed = await bcrypt.hash(password, 10);
      await db.settings.create({
        data: { key: 'admin_password', value: hashed },
      });
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, adminPasswordSetting.value);
    }

    if (!isMatch) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }

    const token = await signToken({ role: 'ADMIN' });

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}
