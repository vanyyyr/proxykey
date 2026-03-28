import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await db.settings.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      // Never return the admin password hash
      if (curr.key !== 'admin_password') {
        acc[curr.key] = curr.value;
      }
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    // Process settings update
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'string') continue;

      if (key === 'admin_password') {
        if (value.trim() === '') continue; // Don't update if empty
        const hashedPsw = await bcrypt.hash(value, 10);
        await db.settings.upsert({
          where: { key: 'admin_password' },
          update: { value: hashedPsw },
          create: { key: 'admin_password', value: hashedPsw },
        });
        continue;
      }

      await db.settings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
