import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

const YOOMONEY_WALLET = process.env.YOOMONEY_WALLET || '';
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const userId = payload.userId as string;
    const body = await req.json();
    const { amount, method } = body; // method: 'yoomoney', 'nowpayments', 'stars'

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create a pending payment record in our DB
    const payment = await db.payment.create({
      data: {
        amount: parseFloat(amount),
        method: method,
        status: 'PENDING',
        userId,
      }
    });

    // ─── YooMoney (Personal Wallet) ──────────────────────────────────────
    if (method === 'yoomoney') {
      if (!YOOMONEY_WALLET) {
        return NextResponse.json({ error: 'YooMoney не настроен в .env' }, { status: 500 });
      }

      // Формируем URL для оплаты (https://yoomoney.ru/docs/wallet/quickpay/button)
      const quickpayParams = new URLSearchParams({
        receiver: YOOMONEY_WALLET,
        'quickpay-form': 'shop',
        targets: `Оплата ProxyKey`,
        paymentType: 'AC', // 'AC' это банковская карта, можно оставить без выбора чтобы юзер сам выбрал
        sum: String(amount),
        formcomment: 'ProxyKey',
        'short-dest': 'Пополнение баланса',
        label: payment.id, // Уведомления об оплате придут с этим label = payment.id
        successURL: `${SITE_URL}/dashboard?payment=success`,
      });

      // Мы просто генерируем ссылку, транзакция ещё не проведена
      const paymentUrl = `https://yoomoney.ru/quickpay/confirm?${quickpayParams.toString()}`;

      return NextResponse.json({
        success: true,
        method: 'yoomoney',
        paymentUrl,
        paymentId: payment.id,
      });
    }

    // ─── NOWPayments (Crypto) ────────────────────────────────────────────
    if (method === 'nowpayments') {
      if (!NOWPAYMENTS_API_KEY) {
        return NextResponse.json({ error: 'NOWPayments not configured' }, { status: 500 });
      }

      // NOWPayments API: Create Invoice
      // Docs: https://documenter.getpostman.com/view/7907941/S1a32n38
      const res = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': NOWPAYMENTS_API_KEY,
        },
        body: JSON.stringify({
          price_amount: amount,
          price_currency: 'rub',
          order_id: payment.id,
          order_description: `ProxyKey balance top-up ${amount} RUB`,
          ipn_callback_url: `${SITE_URL}/api/webhooks/nowpayments`,
          success_url: `${SITE_URL}/dashboard?payment=success`,
          cancel_url: `${SITE_URL}/dashboard?payment=cancel`,
        })
      });

      const data = await res.json();

      if (!res.ok || !data.invoice_url) {
        console.error('[NOWPayments] Create invoice error:', data);
        return NextResponse.json({ error: 'NOWPayments invoice creation failed' }, { status: 502 });
      }

      await db.payment.update({
        where: { id: payment.id },
        data: { transactionId: String(data.id) }
      });

      return NextResponse.json({
        success: true,
        method: 'nowpayments',
        paymentUrl: data.invoice_url,
        paymentId: payment.id,
      });
    }

    // ─── Telegram Stars ─────────────────────────────────────────────────
    if (method === 'stars') {
      // For Telegram Stars, we don't redirect. Instead we return data
      // that the frontend uses to call the Telegram Bot API sendInvoice
      // via the Telegram WebApp SDK or deep link.
      // Stars are handled via the bot — the user opens the bot and pays there.
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return NextResponse.json({ error: 'Telegram bot not configured' }, { status: 500 });
      }

      // Get user's telegramId to send invoice
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user?.telegramId) {
        return NextResponse.json({ error: 'Telegram ID not found. Please login via Telegram first.' }, { status: 400 });
      }

      // 1 Star ≈ ~1.5 RUB (approximate, Telegram sets the rate)
      const starsAmount = Math.max(1, Math.ceil(amount / 1.5));

      // Send invoice via Bot API
      const invoiceRes = await fetch(`https://api.telegram.org/bot${botToken}/sendInvoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: parseInt(user.telegramId),
          title: 'Пополнение баланса ProxyKey',
          description: `Пополнение на ${amount}₽ (${starsAmount} ⭐)`,
          payload: JSON.stringify({ payment_id: payment.id, user_id: userId, amount }),
          provider_token: '', // Empty for Telegram Stars
          currency: 'XTR',
          prices: [{ label: `Баланс ${amount}₽`, amount: starsAmount }],
        })
      });

      const invoiceData = await invoiceRes.json();

      if (!invoiceData.ok) {
        console.error('[Telegram Stars] sendInvoice error:', invoiceData);
        return NextResponse.json({ error: 'Failed to send Telegram Stars invoice' }, { status: 502 });
      }

      await db.payment.update({
        where: { id: payment.id },
        data: { transactionId: `stars-${invoiceData.result?.message_id || Date.now()}` }
      });

      return NextResponse.json({
        success: true,
        method: 'stars',
        message: 'Счёт отправлен в Telegram. Откройте бота и оплатите.',
        paymentId: payment.id,
      });
    }

    return NextResponse.json({ error: 'Unknown payment method' }, { status: 400 });

  } catch (error: any) {
    console.error('[Payment Create Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
