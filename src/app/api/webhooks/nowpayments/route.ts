import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * NOWPayments IPN (Instant Payment Notification) Webhook Handler
 * 
 * Docs: https://documenter.getpostman.com/view/7907941/S1a32n38
 * 
 * NOWPayments sends a POST with JSON body when payment status changes.
 * We verify the HMAC signature using IPN_SECRET_KEY.
 * 
 * Statuses: waiting, confirming, confirmed, sending, partially_paid, finished, failed, refunded, expired
 * We credit balance only on "finished" status.
 */

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';

function verifySignature(body: any, receivedSig: string): boolean {
  if (!IPN_SECRET) return true; // Skip verification if not configured (dev mode)
  
  // Sort keys and create HMAC
  const sorted = Object.keys(body).sort().reduce((acc: any, key) => {
    acc[key] = body[key];
    return acc;
  }, {});
  
  const hmac = crypto
    .createHmac('sha512', IPN_SECRET)
    .update(JSON.stringify(sorted))
    .digest('hex');
  
  return hmac === receivedSig;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-nowpayments-sig') || '';

    // Verify HMAC signature
    if (IPN_SECRET && !verifySignature(body, signature)) {
      console.error('[NOWPayments] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const {
      payment_status,
      order_id,         // Our payment.id
      price_amount,     // Amount in original currency (RUB)
      actually_paid,
      pay_currency,
    } = body;

    if (!order_id) {
      return NextResponse.json({ status: 'ignored - no order_id' });
    }

    // Only process "finished" payments (fully confirmed on blockchain)
    if (payment_status === 'finished') {
      const payment = await db.payment.findUnique({
        where: { id: order_id }
      });

      if (!payment) {
        return NextResponse.json({ status: 'ignored - payment not found' });
      }

      if (payment.status === 'COMPLETED') {
        return NextResponse.json({ status: 'already processed' });
      }

      // Credit balance
      await db.$transaction([
        db.payment.update({
          where: { id: order_id },
          data: {
            status: 'COMPLETED',
            transactionId: `nowpay-${body.payment_id || Date.now()}`,
          }
        }),
        db.user.update({
          where: { id: payment.userId },
          data: { balance: { increment: payment.amount } }
        })
      ]);

      console.log(`[NOWPayments] Payment ${order_id} finished: +${payment.amount}₽ (paid ${actually_paid} ${pay_currency})`);
      return NextResponse.json({ status: 'ok' });
    }

    if (payment_status === 'failed' || payment_status === 'expired') {
      await db.payment.update({
        where: { id: order_id },
        data: { status: 'FAILED' }
      }).catch(() => {});
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('[NOWPayments Webhook Error]:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
