import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authCookie = req.cookies.get('user_session')?.value;
  
  if (!authCookie) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    // Verify JWT token
    const payload = await verifyToken(authCookie);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId as string }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const keys = await db.proxyKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ user, keys });
  } catch (error) {
    console.error('[API user/me] auth error:', error);
    return NextResponse.json({ error: 'Internal error: ' + String(error) }, { status: 500 });
  }
}
