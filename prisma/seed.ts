import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create default settings map
  const defaultSettings = [
    { key: 'admin_password', value: await bcrypt.hash('admin123', 10) },
    { key: 'telegram_channel_id', value: '-1002011947245' },
    { key: 'telegram_subscription_url', value: 'https://t.me/+iJy4PBWIPuA4ZGNi' },
    { key: 'telegram_admin_id', value: '5094009390' },
    { key: 'payment_yoomoney_enabled', value: 'true' },
    { key: 'payment_nowpayments_enabled', value: 'true' },
    { key: 'payment_robokassa_enabled', value: 'false' },
    { key: 'payment_registration_bonus', value: '0' },
    { key: 'payment_verification_price', value: '99' },
    { key: 'payment_min_amount', value: '300' },
    { key: 'payment_min_crypto_amount', value: '500' },
    { key: 'partner_percentage', value: '15' },
    { key: 'limits_unlimited_balance', value: '1000' },
    { key: 'limits_unlimited_topup_today', value: '1000' },
    { key: 'site_base_url', value: 'http://localhost:3000' },
    { key: 'site_show_footer', value: 'false' },
    { key: 'maintenance_manual', value: 'false' },
    { key: 'maintenance_auto', value: 'true' },
    { key: 'maintenance_end_date', value: new Date(Date.now() + 86400000).toISOString() },
    { key: 'maintenance_message', value: 'Приносим извинения за неудобство...' },
    { key: 'tech_debug_key', value: 'debug123' },
    { key: 'tech_proxy_pool', value: '' },
    { key: 'tech_ip_rotation', value: 'false' },
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
