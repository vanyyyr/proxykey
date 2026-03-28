const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Сначала найдем или создадим тестового юзера
  let user = await prisma.user.findFirst({
    where: { telegramId: "test_user_123" }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: "test_user_123",
        username: "test_tester",
        name: "Иван Тестов",
        balance: 0,
        verificationsCount: 0
      }
    });
    console.log("Создан тестовый пользователь:", user.id);
  } else {
    console.log("Найден тестовый пользователь:", user.id);
    console.log("Баланс до пополнения:", user.balance);
  }

  // 2. Имитируем входящий вебхук от YooMoney
  const testPayload = {
    notification_type: "p2p-incoming",
    operation_id: "test-op-" + Date.now(),
    amount: "150.50",
    currency: "643",
    datetime: new Date().toISOString(),
    sender: "41001000000",
    codepro: "false",
    label: user.id, // В label YooMoney мы обычно передаем ID пользователя
    unaccepted: "false"
  };

  // 3. Отправляем POST запрос на наш хостинг Vercel
  const fetch = (await import('node-fetch')).default;
  const VERCEL_URL = 'https://proxykey-6us1ltvwc-vanyas-projects-7d0ce27e.vercel.app';
  console.log(`Отправляем тестовый вебхук YooMoney на ${VERCEL_URL} для юзера:`, user.id);
  
  try {
    const res = await fetch(`${VERCEL_URL}/api/webhooks/yoomoney`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(testPayload)
    });
    
    console.log("Ответ вебхука:", res.status, await res.text());

    // Ждем секунду для надежности (БД обновляется на Vercel)
    await new Promise(r => setTimeout(r, 1500));

    // 4. Проверяем обновился ли баланс в нашей БД
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    console.log("Новый баланс пользователя в БД:", updatedUser.balance);

    // 5. Проверяем добавился ли платеж в историю
    const payments = await prisma.payment.findMany({ 
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    console.log("Последний платеж:", payments);

  } catch (e) {
    console.error("Ошибка сети при отправке вебхука:", e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
