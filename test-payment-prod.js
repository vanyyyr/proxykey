const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fetch = require('node-fetch');

async function main() {
  const user = await prisma.user.findFirst({
    where: { telegramId: "test_user_123" }
  });

  const testPayload = {
    notification_type: "p2p-incoming",
    operation_id: "test-prod-" + Date.now(),
    amount: "777.00",
    currency: "643",
    label: user.id
  };

  const VERCEL_URL = 'https://proxykey-6us1ltvwc-vanyas-projects-7d0ce27e.vercel.app';
  console.log(`Отправляем тестовый вебхук на ПРОД URL ${VERCEL_URL} для юзера:`, user.id);
  
  try {
    const res = await fetch(`${VERCEL_URL}/api/webhooks/yoomoney`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-vercel-protection-bypass': 'bypass-token-here'
      },
      body: new URLSearchParams(testPayload)
    });
    
    console.log("Ответ вебхука:", res.status, await res.text());

    await new Promise(r => setTimeout(r, 2000));

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    console.log("Новый баланс (ожидаем +777):", updatedUser.balance);

    const payments = await prisma.payment.findMany({ 
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    console.log("Последний платеж:", payments);

  } catch (e) {
    console.error("Ошибка сети:", e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
