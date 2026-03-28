'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

function countryFlag(iso2: string | null | undefined): string {
  if (!iso2) return '\u{1F310}';
  const code = iso2.toUpperCase();
  const offset = 127397;
  try {
    return String.fromCodePoint(...[...code].map(c => c.charCodeAt(0) + offset));
  } catch {
    return '\u{1F310}';
  }
}

/* ─── Telegram Login Widget ─── */
function TelegramWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    // Remove any existing children
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'proxytgkeybot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-auth-url', `${window.location.origin}/api/auth/telegram/callback`);
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    (window as any).onTelegramAuth = async (user: any) => {
      try {
        const res = await fetch('/api/auth/telegram/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.redirect) {
            window.location.href = data.redirect;
          } else {
            window.location.reload();
          }
        }
      } catch (e) {
        console.error('Auth error:', e);
      }
    };

    script.onerror = () => setError(true);
    containerRef.current.appendChild(script);

    // Timeout fallback
    const timer = setTimeout(() => {
      if (containerRef.current && containerRef.current.children.length > 0) {
        const iframe = containerRef.current.querySelector('iframe');
        if (!iframe) setError(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div style={{
        padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
          Виджет не загрузился
        </p>
        <a href="https://t.me/proxytgkeybot" target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: '#0088cc', color: '#fff',
            borderRadius: 'var(--radius-pill)', textDecoration: 'none',
            fontWeight: 600, fontSize: '0.8125rem'
          }}>
          Открыть @proxytgkeybot
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{
      minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        color: 'var(--text-tertiary)', fontSize: '0.8125rem'
      }}>
        <div style={{
          width: 16, height: 16, border: '2px solid var(--separator)',
          borderTopColor: 'var(--accent)', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
        Загрузка...
      </div>
    </div>
  );
}

/* ─── Buy Modal ─── */
function BuyProxyModal({ onClose, onBuy }: { onClose: () => void; onBuy: (params: any) => void }) {
  const [country, setCountry] = useState('');
  const [period, setPeriod] = useState(30);
  const [count, setCount] = useState(1);
  const [version, setVersion] = useState(4);
  const [countries, setCountries] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [availableCount, setAvailableCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/proxy/countries')
      .then(r => r.json())
      .then(d => {
        if (d.countries) {
          setCountries(d.countries);
          const firstCountry = Object.keys(d.countries)[0];
          if (firstCountry) setCountry(firstCountry);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!country) return;
    fetch(`/api/proxy/count?country=${country}`)
      .then(r => r.json())
      .then(d => { if (d.success) setAvailableCount(d.count); })
      .catch(() => setAvailableCount(null));
  }, [country]);

  const PRICES: Record<number, Record<number, number>> = {
    4: { 7: 50, 14: 90, 30: 180, 60: 320, 90: 430 },
    3: { 7: 25, 14: 45, 30: 90, 60: 160, 90: 220 },
    6: { 3: 10, 7: 15, 14: 30, 30: 50, 60: 85, 90: 120 },
  };
  const prices = PRICES[version] || PRICES[4];
  const perProxy = prices[period] || prices[30];
  const total = perProxy * count;

  const VERSION_LABELS: Record<number, string> = { 4: 'IPv4', 3: 'IPv4 Shared', 6: 'IPv6' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Купить прокси</h2>

        <label className="modal-field">
          <span className="modal-label">Страна</span>
          <select value={country} onChange={e => setCountry(e.target.value)} className="form-input">
            {Object.entries(countries).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </label>

        <label className="modal-field">
          <span className="modal-label">Тип</span>
          <div className="period-pills">
            {[{ v: 4, l: 'IPv4' }, { v: 3, l: 'Shared' }, { v: 6, l: 'IPv6' }].map(t => (
              <button key={t.v} onClick={() => setVersion(t.v)} className={`pill ${version === t.v ? 'pill-active' : ''}`}>
                {t.l}
              </button>
            ))}
          </div>
        </label>

        <label className="modal-field">
          <span className="modal-label">Период</span>
          <div className="period-pills">
            {(version === 6 ? [3, 7, 14, 30, 60, 90] : [7, 14, 30, 60, 90]).map(d => (
              <button key={d} onClick={() => setPeriod(d)} className={`pill ${period === d ? 'pill-active' : ''}`}>
                {d}д
              </button>
            ))}
          </div>
        </label>

        <label className="modal-field">
          <div className="modal-label-row">
            <span className="modal-label">Количество</span>
            {availableCount !== null && (
              <span className={`modal-count ${availableCount === 0 ? 'modal-count-empty' : ''}`}>
                {availableCount === 0 ? 'Нет в наличии' : `Доступно: ${availableCount}`}
              </span>
            )}
          </div>
          <input type="number" min={1} max={100} value={count}
            onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="form-input" />
        </label>

        <div className="modal-price">
          <span className="modal-price-label">Стоимость</span>
          <span className="modal-price-value">{total} \u20BD</span>
          {count > 1 && <span className="modal-price-detail">{perProxy} \u20BD \u00D7 {count}</span>}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Отмена</button>
          <button
            disabled={loading || (availableCount !== null && count > availableCount && availableCount > 0)}
            onClick={async () => {
              setLoading(true);
              await onBuy({ count, period, country, version, type: 'http' });
              setLoading(false);
            }}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            {loading ? 'Покупка...' : `Купить за ${total} \u20BD`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── TopUp Modal ─── */
function TopUpModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [amount, setAmount] = useState(100);
  const [payMethod, setPayMethod] = useState<'yoomoney' | 'nowpayments' | 'stars'>('yoomoney');
  const [loading, setLoading] = useState(false);

  const methods = [
    { id: 'yoomoney' as const, label: 'Банковская карта', desc: 'ЮMoney', icon: '\u{1F4B3}' },
    { id: 'nowpayments' as const, label: 'Криптовалюта', desc: 'BTC, USDT', icon: '\u{20BF}' },
    { id: 'stars' as const, label: 'Telegram Stars', desc: 'Через бота', icon: '\u{2B50}' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Пополнить баланс</h2>

        <div className="modal-amount-input">
          <input type="number" min={10} value={amount}
            onChange={e => setAmount(Math.max(10, parseInt(e.target.value) || 10))}
            className="amount-input" />
          <span className="amount-currency">\u20BD</span>
        </div>

        <div className="amount-presets">
          {[100, 300, 500, 1000].map(a => (
            <button key={a} onClick={() => setAmount(a)} className={`pill ${amount === a ? 'pill-active' : ''}`}>
              {a}\u20BD
            </button>
          ))}
        </div>

        <div className="pay-methods">
          {methods.map(m => (
            <button key={m.id} onClick={() => setPayMethod(m.id)}
              className={`pay-method ${payMethod === m.id ? 'pay-method-active' : ''}`}>
              <span className="pay-icon">{m.icon}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Отмена</button>
          <button onClick={async () => {
            setLoading(true);
            try {
              const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, method: payMethod })
              });
              const data = await res.json();
              if (!res.ok) { onSuccess(`Ошибка: ${data.error}`); setLoading(false); return; }
              if (data.paymentUrl) { window.location.href = data.paymentUrl; return; }
              onSuccess('Счёт создан. Проверьте Telegram.');
              onClose();
            } catch (err: any) { onSuccess(`Ошибка: ${err.message}`); }
            setLoading(false);
          }} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
            {loading ? 'Оформление...' : `Оплатить ${amount} \u20BD`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ MAIN ══════════════════ */
export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedProxy, setCopiedProxy] = useState<string | null>(null);

  const fetchUserData = useCallback(() => {
    fetch('/api/user/me')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setUser(data.user); setKeys(data.keys || []); })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    fetch('/api/user/partner')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setPartnerData)
      .catch(() => setPartnerData(null));
  }, []);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuy = async (params: any) => {
    try {
      const res = await fetch('/api/proxy/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok) { showNotif(`Ошибка: ${data.error}`); return; }
      showNotif(`Куплено ${data.proxies?.length || 0} прокси`);
      setShowBuyModal(false);
      fetchUserData();
    } catch (err: any) { showNotif(`Ошибка: ${err.message}`); }
  };

  const copyProxy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedProxy(id);
    setTimeout(() => setCopiedProxy(null), 2000);
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32,
          border: '2.5px solid var(--separator)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ─── LOGIN SCREEN ─── */
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em',
          textDecoration: 'none', color: 'var(--text-primary)', marginBottom: 40
        }}>
          Proxy<span style={{ color: 'var(--accent)' }}>Key</span>
        </Link>

        {/* Card */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--separator)',
          borderRadius: 'var(--radius-xl)', padding: '48px 40px',
          maxWidth: 420, width: '100%', textAlign: 'center',
          boxShadow: 'var(--shadow-lg)', animation: 'scaleIn 0.5s var(--ease-out) both'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{'\u{1F512}'}</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Вход в кабинет
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 28 }}>
            Авторизуйтесь через Telegram
          </p>

          <TelegramWidget />

          <p style={{ marginTop: 28, fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            Нажимая кнопку входа, вы соглашаетесь
            <br />с правилами использования сервиса
          </p>
        </div>

        <style>{`
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  /* ─── DASHBOARD ─── */
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: 68, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', background: 'var(--text-primary)', color: 'var(--bg)',
          borderRadius: 'var(--radius-pill)', zIndex: 1000, fontWeight: 500,
          fontSize: '0.8125rem', boxShadow: 'var(--shadow-lg)',
          animation: 'toastIn 0.3s var(--ease-out)'
        }}>{notification}</div>
      )}

      {showBuyModal && <BuyProxyModal onClose={() => setShowBuyModal(false)} onBuy={handleBuy} />}
      {showTopUpModal && <TopUpModal onClose={() => setShowTopUpModal(false)}
        onSuccess={msg => { showNotif(msg); fetchUserData(); }} />}

      {/* ─── Header ─── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(251, 251, 253, 0.72)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid var(--separator)'
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', height: 52
        }}>
          <Link href="/" style={{
            fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.03em',
            textDecoration: 'none', color: 'var(--text-primary)'
          }}>
            Proxy<span style={{ color: 'var(--accent)' }}>Key</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 4 }}>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
                Баланс
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em' }}>
                {user.balance} \u20BD
              </span>
            </div>
            <button onClick={() => setShowTopUpModal(true)} className="btn-ghost" style={{ padding: '7px 16px', fontSize: '0.8125rem' }}>
              Пополнить
            </button>
            <button onClick={() => setShowBuyModal(true)} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.8125rem' }}>
              Купить прокси
            </button>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px',
        display: 'flex', gap: 24, alignItems: 'flex-start'
      }}>

        {/* ─── Main ─── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 24
          }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              Мои прокси
            </h1>
            <button onClick={() => setShowBuyModal(true)} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.8125rem' }}>
              + Купить
            </button>
          </div>

          {keys.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '64px 32px',
              background: 'var(--bg-elevated)', border: '1px solid var(--separator)',
              borderRadius: 'var(--radius-xl)',
              animation: 'fadeUp 0.6s var(--ease-out) both'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.5 }}>{'\u{1F310}'}</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8, letterSpacing: '-0.02em' }}>
                Нет активных прокси
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                Приобретите прокси для безопасного доступа к сети
              </p>
              <button onClick={() => setShowBuyModal(true)} className="btn-primary" style={{ padding: '12px 28px' }}>
                Купить первый прокси
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {keys.map((key, i) => (
                <div key={key.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--separator)', borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s var(--ease-out)',
                  animation: `fadeUp 0.5s var(--ease-out) ${i * 0.05}s both`
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--separator-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--separator)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: '1.25rem' }}>{countryFlag(key.country)}</span>
                      <span style={{
                        padding: '2px 8px', background: 'var(--accent-subtle)', color: 'var(--accent)',
                        borderRadius: 'var(--radius-pill)', fontSize: '0.6875rem', fontWeight: 600
                      }}>{key.protocol || 'HTTP'}</span>
                      <span style={{ fontFamily: 'SF Mono, Menlo, monospace', fontSize: '0.875rem', fontWeight: 500 }}>
                        {key.ip}:{key.port}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>Логин: <code style={{
                        fontFamily: 'SF Mono, Menlo, monospace', fontSize: '0.75rem',
                        background: 'var(--bg-subtle)', padding: '1px 5px', borderRadius: 4
                      }}>{key.login}</code></span>
                      <span>Пароль: <code style={{
                        fontFamily: 'SF Mono, Menlo, monospace', fontSize: '0.75rem',
                        background: 'var(--bg-subtle)', padding: '1px 5px', borderRadius: 4
                      }}>{key.password}</code></span>
                      {key.expiresAt && <span>До: {new Date(key.expiresAt).toLocaleDateString('ru-RU')}</span>}
                    </div>
                  </div>
                  <button onClick={() => copyProxy(`${key.ip}:${key.port}:${key.login}:${key.password}`, key.id)}
                    className="btn-ghost" style={{ padding: '7px 16px', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {copiedProxy === key.id ? '\u2713 Скопировано' : 'Копировать'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Sidebar ─── */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Profile */}
          <div style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--separator)',
            borderRadius: 'var(--radius-lg)', padding: 20,
            animation: 'fadeUp 0.6s var(--ease-out) 0.1s both'
          }}>
            <h3 style={{
              fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16
            }}>Профиль</h3>

            {[
              { label: 'Имя', value: user.name || '\u2014' },
              { label: 'Telegram', value: `@${user.username || '\u2014'}` },
              { label: 'Баланс', value: `${user.balance} \u20BD`, color: 'var(--accent)', bold: true },
              { label: 'Прокси', value: String(keys.length), bold: true },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{row.label}</span>
                <span style={{
                  fontSize: '0.8125rem', color: row.color || 'inherit',
                  fontWeight: row.bold ? 700 : 400
                }}>{row.value}</span>
              </div>
            ))}

            <button onClick={() => setShowTopUpModal(true)} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: '10px' }}>
              Пополнить баланс
            </button>
          </div>

          {/* Partner */}
          {partnerData && (
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--separator)',
              borderRadius: 'var(--radius-lg)', padding: 20,
              animation: 'fadeUp 0.6s var(--ease-out) 0.2s both'
            }}>
              <h3 style={{
                fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16
              }}>Партнёрская программа</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Рефералов</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{partnerData.referralsCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Заработано</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--success)' }}>
                  {partnerData.partner.earnedBalance} \u20BD
                </span>
              </div>

              <div style={{ marginTop: 12 }}>
                <span style={{
                  display: 'block', fontSize: '0.6875rem', fontWeight: 600,
                  color: 'var(--text-tertiary)', textTransform: 'uppercase',
                  letterSpacing: '0.04em', marginBottom: 6
                }}>Реферальная ссылка</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="text" value={partnerData.referralLink} readOnly
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 8,
                      border: '1px solid var(--separator)', background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)', fontSize: '0.75rem',
                      fontFamily: 'SF Mono, Menlo, monospace', outline: 'none', minWidth: 0
                    }} />
                  <button onClick={() => {
                    navigator.clipboard.writeText(partnerData.referralLink).catch(() => {});
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2000);
                  }} className="btn-ghost" style={{ padding: '8px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {copiedRef ? '\u2713' : 'Копировать'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button onClick={async () => {
            await fetch('/api/user/logout', { method: 'POST' }).catch(() => {});
            document.cookie = 'user_session=; Max-Age=0; path=/;';
            window.location.reload();
          }} className="btn-ghost" style={{
            width: '100%', justifyContent: 'center',
            color: 'var(--error)', marginTop: 8, padding: '10px'
          }}>
            Выйти
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (prefers-color-scheme: dark) {
          header { background: rgba(0, 0, 0, 0.72) !important; }
        }
        @media (max-width: 768px) {
          .dash-content { flex-direction: column-reverse !important; }
        }
      `}</style>
    </div>
  );
}
