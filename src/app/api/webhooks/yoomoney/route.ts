import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * YooMoney Personal Wallet Webhook Handler
 * Docs: https://yoomoney.ru/docs/wallet/using-api/notification/p2p-incoming
 */

const YOOMONEY_SECRET = process.env.YOOMONEY_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extract fields
    const notification_type = formData.get('notification_type') as string || '';
    const operation_id = formData.get('operation_id') as string || '';
    const amount = formData.get('amount') as string || '';
    const currency = formData.get('currency') as string || '';
    const datetime = formData.get('datetime') as string || '';
    const sender = formData.get('sender') as string || '';
    const codepro = formData.get('codepro') as string || '';
    const label = formData.get('label') as string || '';
    const sha1_hash = formData.get('sha1_hash') as string || '';
    
    // Calculate SHA1 Hash for verification
    const hashStr = `${notification_type}&${operation_id}&${amount}&${currency}&${datetime}&${sender}&${codepro}&${YOOMONEY_SECRET}&${label}`;
    const calculatedHash = crypto.createHash('sha1').update(hashStr).digest('hex');
    
    if (calculatedHash !== sha1_hash) {
      console.error('[YooMoney] Hash mismatch');
      return NextResponse.json({ error: 'Hash mismatch' }, { status: 400 });
    }
    
    // Ignore protected transfers (we can't automatically process them without a code)
    if (codepro === 'true') {
      return new NextResponse('OK', { status: 200 });
    }
    
    if (!label) {
      return new NextResponse('OK', { status: 200 });
    }
    
    // `withdraw_amount` is the actual amount credited to the wallet (minus commision)
    // `amount` is how much the user sent. We credit the user what we actually received.
    let withdrawAmount = parseFloat(formData.get('withdraw_amount') as string || amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return new NextResponse('OK', { status: 200 });
    }
    
    // Check if payment already processed
    const existingPayment = await db.payment.findUnique({
      where: { id: label }
    });

    if (!existingPayment) {
      return new NextResponse('OK', { status: 200 });
    }

    if (existingPayment.status === 'COMPLETED') {
      return new NextResponse('OK', { status: 200 });
    }

    // Update payment status and add balance
    await db.$transaction([
      db.payment.update({
        where: { id: label },
        data: { 
          status: 'COMPLETED',
          transactionId: operation_id,
        }
      }),
      db.user.update({
        where: { id: existingPayment.userId },
        data: { balance: { increment: withdrawAmount } }
      })
    ]);

    console.log(`[YooMoney] Payment ${label} succeeded: +${withdrawAmount}₽`);
    
    // YooMoney requires 200 OK response, without specific JSON structure
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('[YooMoney Webhook Error]:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
