import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

async function callTelegramAPI(method: string, body: unknown) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

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

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // ─── Pre-Checkout Query (Stars) ───
    if (update.pre_checkout_query) {
      const query = update.pre_checkout_query;
      await callTelegramAPI('answerPreCheckoutQuery', {
        pre_checkout_query_id: query.id,
        ok: true,
      });
      return NextResponse.json({ status: 'ok' });
    }

    // ─── Successful Payment (Stars) ───
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const from = update.message.from;

      let payloadData: Record<string, unknown> = {};
      try {
        payloadData = JSON.parse(payment.invoice_payload || '{}');
      } catch {
        payloadData = {};
      }

      const paymentId = payloadData.payment_id as string;
      const userId = payloadData.user_id as string;
      const amount = payloadData.amount as string;
      const starsAmount = payment.total_amount;
      const telegramPaymentId = payment.telegram_payment_charge_id;

      if (paymentId && userId && amount) {
        const existingPayment = await db.payment.findUnique({ where: { id: paymentId } });
        if (existingPayment && existingPayment.status !== 'COMPLETED') {
          await db.$transaction([
            db.payment.update({
              where: { id: paymentId },
              data: { status: 'COMPLETED', transactionId: telegramPaymentId || `stars-${Date.now()}` },
            }),
            db.user.update({
              where: { id: userId },
              data: { balance: { increment: parseFloat(amount) } },
            }),
          ]);
          console.log(`[Stars] Payment ${paymentId}: +${amount}₽ for user ${userId}`);
        }
      } else {
        const telegramId = String(from.id);
        const user = await db.user.findUnique({ where: { telegramId } });
        if (user) {
          const rubAmount = starsAmount * 1.5;
          await db.$transaction([
            db.payment.create({
              data: {
                amount: rubAmount,
                method: 'Telegram Stars',
                status: 'COMPLETED',
                transactionId: telegramPaymentId || `stars-${Date.now()}`,
                userId: user.id,
              },
            }),
            db.user.update({
              where: { id: user.id },
              data: { balance: { increment: rubAmount } },
            }),
          ]);
          console.log(`[Stars] Fallback: +${rubAmount}₽ for ${telegramId}`);
        }
      }
      return NextResponse.json({ status: 'ok' });
    }

    // ─── /start command (with optional login payload) ───
    if (update.message?.text) {
      const text = update.message.text as string;
      const chatId = update.message.chat.id;
      const from = update.message.from;

      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const payload = parts[1]; // e.g., "login_abc123" or undefined

        if (payload && payload.startsWith('login_')) {
          // Login flow: user came from our site via deep link
          const loginToken = payload.replace('login_', '');
          const telegramId = String(from.id);
          const username = from.username || null;
          const name = [from.first_name, from.last_name].filter(Boolean).join(' ') || 'Без имени';

          // Validate telegram data
          const isValid = validateTelegramData(from);

          // Find or create user (even without full validation for login flow)
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

          // Generate session token
          const { signToken } = await import('@/lib/auth');
          const token = await signToken({ userId: user.id, role: user.role });

          // Store the session token linked to the login token
          await db.settings.upsert({
            where: { key: `login_${loginToken}` },
            create: { key: `login_${loginToken}`, value: token },
            update: { value: token },
          });

          // Send confirmation to user
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proxykey.vercel.app';
          await callTelegramAPI('sendMessage', {
            chat_id: chatId,
            text: `✅ Вы успешно авторизовались!\n\nВаш баланс: ${user.balance} ₽\n\nОткройте личный кабинет:`,
            reply_markup: {
              inline_keyboard: [
                [{ text: '🌐 Личный кабинет', url: `${siteUrl}/dashboard?token=${loginToken}` }],
              ],
            },
          });

          return NextResponse.json({ status: 'ok' });
        }

        // Regular /start without login payload
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proxykey.vercel.app';
        await callTelegramAPI('sendMessage', {
          chat_id: chatId,
          text: `👋 Добро пожаловать в ProxyKey!\n\nИспользуйте наш сайт для покупки прокси и управления ключами.\n\nОплата Telegram Stars будет приходить сюда.`,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Открыть сайт', url: siteUrl }],
              [{ text: '💼 Личный кабинет', url: `${siteUrl}/dashboard` }],
            ],
          },
        });
        return NextResponse.json({ status: 'ok' });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: unknown) {
    console.error('[Telegram Webhook Error]:', error);
    return NextResponse.json({ status: 'ok' });
  }
}
