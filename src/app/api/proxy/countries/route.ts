import { NextRequest, NextResponse } from 'next/server';
import { getAvailableAssets } from '@/lib/webshare';

const COUNTRY_NAMES: Record<string, string> = {
  US: 'США', GB: 'Великобритания', DE: 'Германия', FR: 'Франция', NL: 'Нидерланды',
  CA: 'Канада', IT: 'Италия', ES: 'Испания', PL: 'Польша', TR: 'Турция',
  JP: 'Япония', AU: 'Австралия', BR: 'Бразилия', SE: 'Швеция', CH: 'Швейцария',
  SG: 'Сингапур', KR: 'Южная Корея', IN: 'Индия', RU: 'Россия', UA: 'Украина',
  CZ: 'Чехия', FI: 'Финляндия', NO: 'Норвегия', DK: 'Дания', IE: 'Ирландия',
  AT: 'Австрия', BE: 'Бельгия', PT: 'Португалия', GR: 'Греция', RO: 'Румыния',
  HU: 'Венгрия', HR: 'Хорватия', BG: 'Болгария', LT: 'Литва', LV: 'Латвия',
  EE: 'Эстония', ZA: 'ЮАР', MX: 'Мексика', AR: 'Аргентина', CL: 'Чили',
  CO: 'Колумбия', PE: 'Перу', NZ: 'Новая Зеландия', IL: 'Израиль', AE: 'ОАЭ',
};

export async function GET(req: NextRequest) {
  try {
    const assets = await getAvailableAssets() as Record<string, Record<string, Record<string, Record<string, number>>>>;

    const shared = assets['shared'] || {};
    const defaultSubtype = shared['default'] || shared[Object.keys(shared)[0]] || {};
    const availableCountries: Record<string, number> = defaultSubtype.available_countries || {};

    const countries: Record<string, string> = {};
    for (const [code, count] of Object.entries(availableCountries)) {
      if (count > 0) {
        countries[code.toLowerCase()] = COUNTRY_NAMES[code] || code;
      }
    }

    return NextResponse.json({ success: true, countries });
  } catch (error: unknown) {
    console.error('[Proxy Countries Error]:', error);
    return NextResponse.json({
      success: true,
      countries: {
        us: 'США', gb: 'Великобритания', de: 'Германия', fr: 'Франция',
        nl: 'Нидерланды', ca: 'Канада', it: 'Италия', jp: 'Япония',
        au: 'Австралия', pl: 'Польша', se: 'Швеция', ch: 'Швейцария',
      },
    });
  }
}
