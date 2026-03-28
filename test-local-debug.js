const fetch = require('node-fetch');

async function main() {
  const LOCAL_URL = 'http://localhost:3000';
  
  // Try sending without label (should return 'ignored' instead of 500)
  console.log(`Отправляем пустой вебхук (ожидаем ignored)`);
  try {
    const res1 = await fetch(`${LOCAL_URL}/api/webhooks/yoomoney`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ notification_type: "p2p" })
    });
    console.log("Ответ вебхука 1:", res1.status, await res1.text());
  } catch (e) {
    console.error("Ошибка сети:", e.message);
  }
}

main();
