import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <header className="nav-bar">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            Proxy<span className="text-accent">Key</span>
          </Link>
          <nav className="nav-links">
            <a href="#pricing">Тарифы</a>
            <a href="#features">Преимущества</a>
            <a href="#faq">FAQ</a>
          </nav>
          <Link href="/dashboard" className="nav-cta">
            Личный кабинет
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner animate-fade-up">
          <div className="hero-badge">Мгновенная выдача за 3 секунды</div>
          <h1 className="hero-title">
            Быстрые прокси
            <br />
            <span className="text-accent">для любых задач</span>
          </h1>
          <p className="hero-desc">
            Приватные IPv4, IPv6 и Shared прокси в 50+ странах.
            <br />
            HTTPS и SOCKS5. Выдача мгновенно после оплаты.
          </p>
          <div className="hero-actions">
            <Link href="/dashboard" className="btn-primary hero-btn">
              Купить прокси
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a href="#pricing" className="btn-ghost hero-btn">
              Смотреть цены ↓
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row animate-fade-up delay-3">
          <div className="stat-item">
            <div className="stat-value">50+</div>
            <div className="stat-label">Стран</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-value">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-value">3 сек</div>
            <div className="stat-label">Выдача</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-value">24/7</div>
            <div className="stat-label">Поддержка</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section">
        <div className="section-inner">
          <div className="section-header animate-fade-up">
            <span className="section-label">Тарифы</span>
            <h2 className="section-title-text">Прозрачные цены</h2>
            <p className="section-subtitle">Цена за 1 прокси. Без скрытых платежей и комиссий.</p>
          </div>

          <div className="pricing-grid">
            {/* IPv4 */}
            <div className="pricing-card pricing-card-featured animate-fade-up delay-2">
              <div className="pricing-badge">Популярный</div>
              <div className="pricing-head">
                <h3>IPv4</h3>
                <p>Индивидуальный IPv4 адрес. Подходит для любых задач.</p>
              </div>
              <div className="pricing-rows">
                <div className="pricing-row"><span>7 дней</span><span className="pricing-price">50 ₽</span></div>
                <div className="pricing-row"><span>14 дней</span><span className="pricing-price">90 ₽</span></div>
                <div className="pricing-row pricing-row-highlight"><span>30 дней</span><span className="pricing-price">180 ₽</span></div>
                <div className="pricing-row"><span>60 дней</span><span className="pricing-price">320 ₽</span></div>
                <div className="pricing-row"><span>90 дней</span><span className="pricing-price">430 ₽</span></div>
              </div>
              <div className="pricing-footer">
                <span className="pricing-protocols">HTTPS · SOCKS5</span>
                <Link href="/dashboard" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Купить IPv4
                </Link>
              </div>
            </div>

            {/* IPv6 */}
            <div className="pricing-card animate-fade-up delay-3">
              <div className="pricing-head">
                <h3>IPv6</h3>
                <p>Дешёвые IPv6 адреса. Идеально для массового парсинга.</p>
              </div>
              <div className="pricing-rows">
                <div className="pricing-row"><span>3 дня</span><span className="pricing-price">10 ₽</span></div>
                <div className="pricing-row"><span>7 дней</span><span className="pricing-price">15 ₽</span></div>
                <div className="pricing-row"><span>14 дней</span><span className="pricing-price">30 ₽</span></div>
                <div className="pricing-row pricing-row-highlight"><span>30 дней</span><span className="pricing-price">50 ₽</span></div>
                <div className="pricing-row"><span>60 дней</span><span className="pricing-price">85 ₽</span></div>
                <div className="pricing-row"><span>90 дней</span><span className="pricing-price">120 ₽</span></div>
              </div>
              <div className="pricing-footer">
                <span className="pricing-protocols">HTTPS · SOCKS5</span>
                <Link href="/dashboard" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Купить IPv6
                </Link>
              </div>
            </div>

            {/* Shared */}
            <div className="pricing-card animate-fade-up delay-4">
              <div className="pricing-head">
                <h3>IPv4 Shared</h3>
                <p>Общий пул IPv4. Экономичное решение для простых задач.</p>
              </div>
              <div className="pricing-rows">
                <div className="pricing-row"><span>7 дней</span><span className="pricing-price">25 ₽</span></div>
                <div className="pricing-row"><span>14 дней</span><span className="pricing-price">45 ₽</span></div>
                <div className="pricing-row pricing-row-highlight"><span>30 дней</span><span className="pricing-price">90 ₽</span></div>
                <div className="pricing-row"><span>60 дней</span><span className="pricing-price">160 ₽</span></div>
                <div className="pricing-row"><span>90 дней</span><span className="pricing-price">220 ₽</span></div>
              </div>
              <div className="pricing-footer">
                <span className="pricing-protocols">HTTPS · SOCKS5</span>
                <Link href="/dashboard" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Купить Shared
                </Link>
              </div>
            </div>
          </div>

          <p className="pricing-note">
            Принимаем: банковские карты · ЮMoney · криптовалюта (BTC, USDT) · Telegram Stars
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section section-alt">
        <div className="section-inner">
          <div className="section-header animate-fade-up">
            <span className="section-label">Преимущества</span>
            <h2 className="section-title-text">Почему выбирают нас</h2>
          </div>

          <div className="features-grid">
            {[
              { icon: '⚡', title: 'Мгновенная выдача', desc: 'Прокси появляются в личном кабинете через секунды после оплаты' },
              { icon: '🌍', title: '50+ локаций', desc: 'Россия, США, Германия, Нидерланды и десятки других стран' },
              { icon: '🔒', title: 'Полная анонимность', desc: 'Прокси выдаются только в одни руки. Мы не логируем действия' },
              { icon: '🔄', title: 'HTTPS и SOCKS5', desc: 'Оба протокола на каждый прокси. Смена типа в один клик' },
              { icon: '💳', title: 'Удобная оплата', desc: 'Карты, ЮMoney, криптовалюта и Telegram Stars' },
              { icon: '🤝', title: 'Партнёрка', desc: 'Приглашайте друзей и зарабатывайте с каждой покупки' },
            ].map((f, i) => (
              <div key={i} className={`feature-card animate-fade-up delay-${i + 2}`}>
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="section-inner">
          <div className="section-header animate-fade-up">
            <span className="section-label">FAQ</span>
            <h2 className="section-title-text">Частые вопросы</h2>
          </div>

          <div className="faq-list animate-fade-up delay-2">
            {[
              { q: 'Как быстро я получу прокси после оплаты?', a: 'Мгновенно. Прокси автоматически появляются в личном кабинете в течение нескольких секунд после подтверждения платежа.' },
              { q: 'Какие способы оплаты вы принимаете?', a: 'Банковские карты и ЮMoney, криптовалюта (BTC, USDT, ETH через NOWPayments), а также Telegram Stars.' },
              { q: 'Прокси индивидуальные или общие?', a: 'IPv4 — полностью приватные, выдаются только вам. IPv4 Shared — общий пул. IPv6 — индивидуальные.' },
              { q: 'Можно ли сменить протокол на SOCKS5?', a: 'Да, оба протокола доступны для каждого прокси. Переключение прямо в личном кабинете.' },
              { q: 'Что если прокси перестанет работать?', a: 'Напишите в поддержку в Telegram — заменим прокси или вернём средства в течение 24 часов.' },
            ].map((item, i) => (
              <details key={i} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="section-inner">
          <div className="cta-block animate-fade-up">
            <h2>Готовы начать?</h2>
            <p>Регистрация за 10 секунд через Telegram. Первый прокси — уже через минуту.</p>
            <Link href="/dashboard" className="btn-primary cta-btn">
              Начать пользоваться
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              Proxy<span className="text-accent">Key</span>
            </div>
            <p>Быстрые и надёжные прокси для любых задач.</p>
            <p className="footer-copy">© 2026 ProxyKey. Все права защищены.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h5>Продукт</h5>
              <a href="#pricing">Тарифы</a>
              <a href="#features">Преимущества</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-col">
              <h5>Связь</h5>
              <a href="https://t.me/proxykeybot" target="_blank" rel="noopener noreferrer">
                Telegram бот
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .text-accent {
          color: var(--accent);
        }

        /* Nav */
        .nav-bar {
          position: sticky;
          top: 0;
          z-index: 200;
          background: rgba(251, 251, 253, 0.72);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid var(--separator);
        }
        @media (prefers-color-scheme: dark) {
          .nav-bar { background: rgba(0, 0, 0, 0.72); }
        }
        .nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 52px;
        }
        .nav-logo {
          font-size: 1.375rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          text-decoration: none;
          color: var(--text-primary);
        }
        .nav-links {
          display: flex;
          gap: 32px;
        }
        .nav-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.8125rem;
          font-weight: 500;
          transition: color var(--transition-fast);
        }
        .nav-links a:hover { color: var(--text-primary); opacity: 1; }
        .nav-cta {
          background: var(--accent);
          color: #fff;
          padding: 8px 18px;
          border-radius: var(--radius-pill);
          font-weight: 600;
          font-size: 0.8125rem;
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .nav-cta:hover {
          background: var(--accent-hover);
          transform: scale(1.02);
          opacity: 1;
          box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
        }

        /* Hero */
        .hero {
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 24px 60px;
          text-align: center;
        }
        .hero-badge {
          display: inline-block;
          padding: 6px 16px;
          background: var(--accent-subtle);
          color: var(--accent);
          border-radius: var(--radius-pill);
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 28px;
          animation: fadeDown 0.6s var(--ease-out) both;
        }
        .hero-title {
          font-size: clamp(2.75rem, 7vw, 4.5rem);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin-bottom: 20px;
          animation: fadeUp 0.7s var(--ease-out) 0.1s both;
        }
        .hero-desc {
          font-size: 1.125rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 36px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
          animation: fadeUp 0.7s var(--ease-out) 0.2s both;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeUp 0.7s var(--ease-out) 0.3s both;
        }
        .hero-btn {
          padding: 14px 28px;
          font-size: 1rem;
        }

        /* Stats */
        .stats-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          margin-top: 80px;
          padding: 32px 0;
          border-top: 1px solid var(--separator);
          border-bottom: 1px solid var(--separator);
        }
        .stat-item { text-align: center; }
        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }
        .stat-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 4px;
        }
        .stat-divider {
          width: 1px;
          height: 32px;
          background: var(--separator);
        }

        /* Section */
        .section {
          padding: 100px 24px;
        }
        .section-alt {
          background: var(--bg-subtle);
        }
        .section-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-header {
          text-align: center;
          margin-bottom: 56px;
        }
        .section-label {
          display: inline-block;
          padding: 5px 14px;
          background: var(--accent-subtle);
          color: var(--accent);
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .section-title-text {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          letter-spacing: -0.035em;
          margin-bottom: 12px;
        }
        .section-subtitle {
          color: var(--text-secondary);
          font-size: 1.0625rem;
          max-width: 400px;
          margin: 0 auto;
        }

        /* Pricing */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: start;
        }
        .pricing-card {
          background: var(--bg-elevated);
          border: 1px solid var(--separator);
          border-radius: var(--radius-lg);
          padding: 28px 24px 24px;
          position: relative;
          transition: all var(--transition-normal);
        }
        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--separator-strong);
        }
        .pricing-card-featured {
          border-color: var(--accent);
          box-shadow: 0 0 0 1px var(--accent), var(--shadow-md);
        }
        .pricing-card-featured:hover {
          box-shadow: 0 0 0 1px var(--accent), var(--shadow-lg);
        }
        .pricing-badge {
          position: absolute;
          top: -11px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent);
          color: #fff;
          padding: 4px 16px;
          border-radius: var(--radius-pill);
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .pricing-head {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--separator);
        }
        .pricing-head h3 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .pricing-head p {
          color: var(--text-secondary);
          font-size: 0.8125rem;
          line-height: 1.5;
        }
        .pricing-rows {
          margin-bottom: 20px;
        }
        .pricing-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.875rem;
          color: var(--text-secondary);
          transition: background var(--transition-fast);
        }
        .pricing-row:hover {
          background: var(--bg-subtle);
        }
        .pricing-row-highlight {
          background: var(--accent-subtle);
          color: var(--text-primary);
          font-weight: 500;
        }
        .pricing-row-highlight:hover {
          background: var(--accent-subtle);
        }
        .pricing-price {
          font-weight: 700;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }
        .pricing-footer {
          text-align: center;
        }
        .pricing-protocols {
          display: block;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-bottom: 12px;
          font-weight: 500;
        }
        .pricing-note {
          text-align: center;
          color: var(--text-tertiary);
          font-size: 0.8125rem;
          margin-top: 40px;
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .feature-card {
          background: var(--bg-elevated);
          border: 1px solid var(--separator);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          transition: all var(--transition-normal);
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--separator-strong);
        }
        .feature-icon {
          font-size: 2rem;
          margin-bottom: 16px;
          display: block;
        }
        .feature-card h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .feature-card p {
          color: var(--text-secondary);
          font-size: 0.8125rem;
          line-height: 1.6;
        }

        /* FAQ */
        .faq-list {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .faq-item {
          background: var(--bg-elevated);
          border: 1px solid var(--separator);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: all var(--transition-fast);
        }
        .faq-item:hover {
          border-color: var(--separator-strong);
        }
        .faq-item summary {
          padding: 18px 22px;
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-primary);
          transition: color var(--transition-fast);
        }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after {
          content: '+';
          font-size: 1.25rem;
          font-weight: 300;
          color: var(--text-tertiary);
          transition: transform 0.3s var(--ease-out);
        }
        .faq-item[open] summary::after {
          transform: rotate(45deg);
        }
        .faq-item[open] summary {
          border-bottom: 1px solid var(--separator);
        }
        .faq-item p {
          padding: 18px 22px;
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.7;
          animation: fadeIn 0.3s var(--ease-out);
        }

        /* CTA */
        .cta-block {
          text-align: center;
          padding: 80px 40px;
          border-radius: var(--radius-xl);
          background: var(--bg-elevated);
          border: 1px solid var(--separator);
          box-shadow: var(--shadow-card);
        }
        .cta-block h2 {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.035em;
          margin-bottom: 12px;
        }
        .cta-block p {
          color: var(--text-secondary);
          font-size: 1.0625rem;
          margin-bottom: 28px;
        }
        .cta-btn {
          padding: 16px 32px;
          font-size: 1rem;
        }

        /* Footer */
        .footer {
          border-top: 1px solid var(--separator);
          padding: 48px 24px 32px;
        }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 48px;
        }
        .footer-logo {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .footer-brand p {
          color: var(--text-tertiary);
          font-size: 0.8125rem;
          line-height: 1.6;
        }
        .footer-copy { margin-top: 12px; }
        .footer-links {
          display: flex;
          gap: 56px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .footer-col h5 {
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-tertiary);
          margin-bottom: 4px;
          font-weight: 600;
        }
        .footer-col a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.8125rem;
          transition: color var(--transition-fast);
        }
        .footer-col a:hover {
          color: var(--text-primary);
          opacity: 1;
        }

        /* Responsive */
        @media (max-width: 968px) {
          .nav-links { display: none; }
          .hero { padding: 72px 20px 48px; }
          .stats-row { gap: 24px; flex-wrap: wrap; }
          .stat-divider { display: none; }
          .pricing-grid, .features-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
          .cta-block { padding: 48px 24px; }
          .cta-block h2 { font-size: 1.75rem; }
          .footer-inner { flex-direction: column; }
          .footer-links { gap: 32px; }
        }
      `
      }} />
    </div>
  );
}
