const fetch = require('node-fetch');

async function main() {
  const LOCAL_URL = 'http://localhost:3000';
  
  // We don't even need the db here, just ping the API directly to see the error output on the server side
  const testPayload = {
    notification_type: "p2p-incoming",
    operation_id: "test-local-" + Date.now(),
    amount: "500.00",
    currency: "643",
    label: "cmmtrvib90000uotd9x9094io" // user id
  };

  console.log(`Отправляем тестовый вебхук на ${LOCAL_URL}`);
  
  try {
    const res = await fetch(`${LOCAL_URL}/api/webhooks/yoomoney`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(testPayload)
    });
    
    console.log("Ответ вебхука:", res.status, await res.text());
  } catch (e) {
    console.error("Ошибка сети:", e.message);
  }
}

main();
