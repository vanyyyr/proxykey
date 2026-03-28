const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = "cmmtrvib90000uotd9x9094io"; // the test user we know exists
  try {
    const paymentAmount = 500.00;
    const operation_id = "test-db-" + Date.now();

    // Isolated test of the transaction code that the webhook runs
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          amount: paymentAmount,
          method: 'YooMoney',
          status: 'COMPLETED',
          transactionId: operation_id,
          userId: userId
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: paymentAmount } }
      })
    ]);
    console.log("Транзакция Prisma успешна!");
  } catch (error) {
    console.error("Ошибка Prisma:", error);
  }
}

main().finally(() => prisma.$disconnect());
