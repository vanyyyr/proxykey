import { Telegraf } from 'telegraf';
import { db } from '@/lib/db';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

// Initialize bot if token exists, otherwise mock for development
export const bot = botToken
  ? new Telegraf(botToken)
  : ({
      telegram: {
        sendMessage: async (chatId: string | number, text: string) => {
          console.log(`[MOCK TG BOT] Message to ${chatId}:`, text);
          return { message_id: Math.floor(Math.random() * 100000) };
        },
      },
      on: () => {},
      command: () => {},
      launch: () => console.log('[MOCK TG BOT] Launched in mock mode'),
    } as unknown as Telegraf);

// Set webhook URL for Telegram
export async function setWebhook(siteUrl: string): Promise<boolean> {
  if (!botToken) {
    console.log('[TG BOT] No token, skipping webhook setup');
    return false;
  }

  const webhookUrl = `${siteUrl}/api/webhooks/telegram`;

  try {
    const checkRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const checkData = await checkRes.json();

    if (checkData.ok && checkData.result.url === webhookUrl) {
      console.log('[TG BOT] Webhook already set:', webhookUrl);
      return true;
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'pre_checkout_query'],
      }),
    });

    const data = await res.json();

    if (data.ok) {
      console.log('[TG BOT] Webhook set:', webhookUrl);
      return true;
    } else {
      console.error('[TG BOT] Failed to set webhook:', data);
      return false;
    }
  } catch (error) {
    console.error('[TG BOT] Webhook setup error:', error);
    return false;
  }
}

// Only setup actual handlers if we have a real Telegraf instance
if (botToken && 'command' in bot) {
  const realBot = bot as Telegraf;

  realBot.command('start', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const username = ctx.from.username;
    const name = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ');

    try {
      let user = await db.user.findUnique({ where: { telegramId } });

      if (!user) {
        user = await db.user.create({
          data: {
            telegramId,
            username,
            name,
            balance: 0,
            verificationsCount: 0,
          },
        });
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      ctx.reply(
        `Добро пожаловать в ProxyKey, ${name}!\n\nВаш баланс: ${user.balance} ₽\nДля покупки прокси перейдите на наш сайт.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Открыть сайт', url: siteUrl }],
              [{ text: '💼 Личный кабинет', url: `${siteUrl}/dashboard` }],
            ],
          },
        }
      );
    } catch (error) {
      console.error('Bot start error:', error);
      ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
  });
}
