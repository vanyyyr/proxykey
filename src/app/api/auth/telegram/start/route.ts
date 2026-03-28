import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Generate a login token and return the Telegram bot URL
export async function POST() {
  try {
    // Generate unique token
    const token = crypto.randomBytes(16).toString('hex');

    // Store token as pending in DB
    await db.settings.create({
      data: { key: `login_${token}`, value: 'pending' },
    });

    // Return the Telegram bot deep link with the token
    const botUrl = `https://t.me/proxytgkeybot?start=login_${token}`;

    return NextResponse.json({ success: true, token, botUrl });
  } catch (error: unknown) {
    console.error('[Login Start Error]:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
