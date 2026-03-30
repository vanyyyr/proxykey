import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navigation */}
      <nav className="glass-nav">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 52 }}>
          <Link href="/" style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.03em', textDecoration: 'none', color: 'var(--text-primary)' }}>
            Proxy<span style={{ color: 'var(--accent)' }}>Key</span>
          </Link>
          <div style={{ display: 'flex', gap: 32 }}>
            <a href="#pricing" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none' }}>Тарифы</a>
            <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none' }}>Преимущества</a>
            <a href="#faq" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none' }}>FAQ</a>
          </div>
          <Link href="/dashboard" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.8125rem' }}>
            Личный кабинет
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 60px', textAlign: 'center' }}>
        <div className="animate-fade-up" style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-pill)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 28, animation: 'fadeDown 0.6s var(--ease-out) both' }}>
          Мгновенная выдача за 3 секунды
        </div>
        <h1 style={{ fontSize: 'clamp(2.75rem, 7vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 20, animation: 'fadeUp 0.7s var(--ease-out) 0.1s both' }}>
          Быстрые прокси<br /><span style={{ color: 'var(--accent)' }}>для любых задач</span>
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px', animation: 'fadeUp 0.7s var(--ease-out) 0.2s both' }}>
          Приватные IPv4, IPv6 и Shared прокси в 50+ странах.<br />
          HTTPS и SOCKS5. Выдача мгновенно после оплаты.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.7s var(--ease-out) 0.3s both' }}>
          <Link href="/dashboard" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            Купить прокси
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <a href="#pricing" className="btn-ghost" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            Смотреть цены ↓
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, marginTop: 80, padding: '32px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', animation: 'fadeUp 0.7s var(--ease-out) 0.4s both' }}>
          {[
            { v: '50+', l: 'Стран' },
            { v: '99.9%', l: 'Uptime' },
            { v: '3 сек', l: 'Выдача' },
            { v: '24/7', l: 'Поддержка' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>{s.v}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }} className="animate-fade-up">
            <span style={{ display: 'inline-block', padding: '5px 14px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>Тарифы</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.035em', marginBottom: 12 }}>Прозрачные цены</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>Цена за 1 прокси. Без скрытых платежей.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
            {/* IPv4 */}
            <div className="glass-card" style={{ padding: '28px 24px 24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', padding: '4px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.6875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Популярный</div>
              <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>IPv4</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>Индивидуальный IPv4 адрес</p>
              </div>
              {[
                { d: '7 дней', p: '50 ₽' },
                { d: '14 дней', p: '90 ₽', h: true },
                { d: '30 дней', p: '180 ₽' },
                { d: '60 дней', p: '320 ₽' },
                { d: '90 дней', p: '430 ₽' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-secondary)', background: r.h ? 'var(--accent-light)' : 'transparent', fontWeight: r.h ? 500 : 400 }}>
                  <span>{r.d}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.p}</span>
                </div>
              ))}
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>HTTPS · SOCKS5</span>
                <Link href="/dashboard" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Купить IPv4</Link>
              </div>
            </div>

            {/* IPv6 */}
            <div className="glass-card animate-fade-up delay-3" style={{ padding: '28px 24px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>IPv6</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>Дешёвые IPv6 адреса</p>
              </div>
              {[
                { d: '3 дня', p: '10 ₽' },
                { d: '7 дней', p: '15 ₽' },
                { d: '14 дней', p: '30 ₽' },
                { d: '30 дней', p: '50 ₽', h: true },
                { d: '60 дней', p: '85 ₽' },
                { d: '90 дней', p: '120 ₽' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-secondary)', background: r.h ? 'var(--accent-light)' : 'transparent', fontWeight: r.h ? 500 : 400 }}>
                  <span>{r.d}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.p}</span>
                </div>
              ))}
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>HTTPS · SOCKS5</span>
                <Link href="/dashboard" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Купить IPv6</Link>
              </div>
            </div>

            {/* Shared */}
            <div className="glass-card animate-fade-up delay-4" style={{ padding: '28px 24px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>IPv4 Shared</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>Общий пул IPv4</p>
              </div>
              {[
                { d: '7 дней', p: '25 ₽' },
                { d: '14 дней', p: '45 ₽' },
                { d: '30 дней', p: '90 ₽', h: true },
                { d: '60 дней', p: '160 ₽' },
                { d: '90 дней', p: '220 ₽' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-secondary)', background: r.h ? 'var(--accent-light)' : 'transparent', fontWeight: r.h ? 500 : 400 }}>
                  <span>{r.d}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.p}</span>
                </div>
              ))}
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>HTTPS · SOCKS5</span>
                <Link href="/dashboard" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Купить Shared</Link>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: 40 }}>
            Принимаем: банковские карты · ЮMoney · криптовалюта (BTC, USDT) · Telegram Stars
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 24px', background: 'rgba(0, 0, 0, 0.015)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }} className="animate-fade-up">
            <span style={{ display: 'inline-block', padding: '5px 14px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>Преимущества</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.035em' }}>Почему выбирают нас</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: '⚡', title: 'Мгновенная выдача', desc: 'Прокси появляются в кабинете через секунды после оплаты' },
              { icon: '🌍', title: '50+ локаций', desc: 'Россия, США, Германия, Нидерланды и десятки других стран' },
              { icon: '🔒', title: 'Полная анонимность', desc: 'Прокси выдаются только в одни руки. Мы не логируем действия' },
              { icon: '🔄', title: 'HTTPS и SOCKS5', desc: 'Оба протокола на каждый прокси. Смена типа в один клик' },
              { icon: '💳', title: 'Удобная оплата', desc: 'Карты, ЮMoney, криптовалюта и Telegram Stars' },
              { icon: '🤝', title: 'Партнёрка', desc: 'Приглашайте друзей и зарабатывайте с каждой покупки' },
            ].map((f, i) => (
              <div key={i} className={`glass-card animate-fade-up delay-${i + 2}`} style={{ padding: '28px 24px' }}>
                <div style={{ fontSize: '2rem', marginBottom: 16, display: 'block' }}>{f.icon}</div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6, letterSpacing: '-0.01em' }}>{f.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }} className="animate-fade-up">
            <span style={{ display: 'inline-block', padding: '5px 14px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>FAQ</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.035em' }}>Частые вопросы</h2>
          </div>

          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }} className="animate-fade-up delay-2">
            {[
              { q: 'Как быстро я получу прокси после оплаты?', a: 'Мгновенно. Прокси автоматически появляются в личном кабинете в течение нескольких секунд после подтверждения платежа.' },
              { q: 'Какие способы оплаты вы принимаете?', a: 'Банковские карты и ЮMoney, криптовалюта (BTC, USDT, ETH через NOWPayments), а также Telegram Stars.' },
              { q: 'Прокси индивидуальные или общие?', a: 'IPv4 — полностью приватные, выдаются только вам. IPv4 Shared — общий пул. IPv6 — индивидуальные.' },
              { q: 'Можно ли сменить протокол на SOCKS5?', a: 'Да, оба протокола доступны для каждого прокси. Переключение прямо в личном кабинете.' },
              { q: 'Что если прокси перестанет работать?', a: 'Напишите в поддержку в Telegram — заменим прокси или вернём средства в течение 24 часов.' },
            ].map((item, i) => (
              <details key={i} style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'all var(--transition-fast)' }}>
                <summary style={{ padding: '18px 22px', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
                  {item.q}
                  <span style={{ fontSize: '1.25rem', fontWeight: 300, color: 'var(--text-tertiary)', transition: 'transform 0.3s var(--ease-out)' }}>+</span>
                </summary>
                <p style={{ padding: '18px 22px', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, borderTop: '1px solid var(--border)' }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="glass-card animate-fade-up" style={{ textAlign: 'center', padding: '80px 40px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.035em', marginBottom: 12 }}>Готовы начать?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', marginBottom: 28 }}>Регистрация за 10 секунд. Первый прокси — уже через минуту.</p>
            <Link href="/dashboard" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1rem' }}>
              Начать пользоваться
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 48 }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>Proxy<span style={{ color: 'var(--accent)' }}>Key</span></div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', lineHeight: 1.6 }}>Быстрые и надёжные прокси для любых задач.</p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: 12 }}>© 2026 ProxyKey. Все права защищены.</p>
          </div>
          <div style={{ display: 'flex', gap: 56 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h5 style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600 }}>Продукт</h5>
              <a href="#pricing" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', textDecoration: 'none' }}>Тарифы</a>
              <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', textDecoration: 'none' }}>Преимущества</a>
              <a href="#faq" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', textDecoration: 'none' }}>FAQ</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h5 style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600 }}>Связь</h5>
              <a href="https://t.me/proxytgkeybot" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', textDecoration: 'none' }}>Telegram бот</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 968px) {
          .glass-nav > div > div:nth-child(2) { display: none !important; }
          .glass-nav > div { flex-wrap: wrap; }
        }
        @media (max-width: 768px) {
          section > div > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; max-width: 400px; margin: 0 auto; }
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
          div[style*="gap: 48px"][style*="flex"] { flex-direction: column; gap: 24px; }
        }
      `}</style>
    </div>
  );
}
