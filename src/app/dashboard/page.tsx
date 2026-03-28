'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

function countryFlag(iso2: string | null | undefined): string {
  if (!iso2) return '\u{1F310}';
  const code = iso2.toUpperCase();
  const offset = 127397;
  try { return String.fromCodePoint(...[...code].map(c => c.charCodeAt(0) + offset)); }
  catch { return '\u{1F310}'; }
}

function TelegramWidget() {
  const [loading, setLoading] = useState(false);
  const [botUrl, setBotUrl] = useState('');

  const handleLogin = async () => {
    if (botUrl) {
      window.open(botUrl, '_blank');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/telegram/start', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setLoading(false); return; }
      setBotUrl(data.botUrl);
      window.open(data.botUrl, '_blank');
    } catch (e) {
      console.error('Login error:', e);
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '14px 32px', background: '#0088cc', color: '#fff',
          borderRadius: 'var(--radius-pill)', border: 'none',
          fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,136,204,0.25)',
          transition: 'all 0.2s var(--ease-out)',
          width: '100%', justifyContent: 'center',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.776 8.368c-.133.595-.488.74-.992.46l-2.74-2.018-1.324 1.276c-.147.147-.27.27-.554.27l.198-2.816 5.126-4.632c.223-.198-.049-.306-.345-.109l-6.34 3.988-2.728-.85c-.594-.186-.606-.594.124-.878l10.656-4.11c.493-.178.926.12.76.87z"/>
        </svg>
        {loading ? 'Загрузка...' : 'Войти через Telegram'}
      </button>

      {botUrl && (
        <div style={{ marginTop: 16, padding: 16, background: 'rgba(0,136,204,0.06)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            Откройте бота и нажмите <strong>«Начать»</strong>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            После авторизации бот пришлёт ссылку для входа
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Buy Modal ─── */
function BuyProxyModal({ onClose, onBuy }: { onClose: () => void; onBuy: (p: any) => void }) {
  const [country, setCountry] = useState('');
  const [period, setPeriod] = useState(30);
  const [count, setCount] = useState(1);
  const [version, setVersion] = useState(4);
  const [countries, setCountries] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [availableCount, setAvailableCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/proxy/countries').then(r => r.json()).then(d => {
      if (d.countries) { setCountries(d.countries); const f = Object.keys(d.countries)[0]; if (f) setCountry(f); }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!country) return;
    fetch(`/api/proxy/count?country=${country}`).then(r => r.json()).then(d => { if (d.success) setAvailableCount(d.count); }).catch(() => setAvailableCount(null));
  }, [country]);

  const PRICES: Record<number, Record<number, number>> = { 4: { 7: 50, 14: 90, 30: 180, 60: 320, 90: 430 }, 3: { 7: 25, 14: 45, 30: 90, 60: 160, 90: 220 }, 6: { 3: 10, 7: 15, 14: 30, 30: 50, 60: 85, 90: 120 } };
  const prices = PRICES[version] || PRICES[4];
  const perProxy = prices[period] || prices[30];
  const total = perProxy * count;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, animation: 'fadeIn 0.2s var(--ease-out)' }} onClick={onClose}>
      <div className="glass-modal" onClick={e => e.stopPropagation()} style={{ padding: 32, maxWidth: 440, width: '100%', animation: 'scaleIn 0.3s var(--ease-out)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Купить прокси</h2>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Страна</span>
          <select value={country} onChange={e => setCountry(e.target.value)} className="form-input">
            {Object.entries(countries).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Тип</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ v: 4, l: 'IPv4' }, { v: 3, l: 'Shared' }, { v: 6, l: 'IPv6' }].map(t => (
              <button key={t.v} onClick={() => setVersion(t.v)} style={{ flex: 1, padding: 8, borderRadius: 8, border: version === t.v ? '1px solid var(--accent)' : '1px solid var(--border)', background: version === t.v ? 'var(--accent-light)' : 'transparent', color: version === t.v ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: version === t.v ? 600 : 500, cursor: 'pointer', transition: 'all var(--transition-fast)', textAlign: 'center' }}>
                {t.l}
              </button>
            ))}
          </div>
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Период</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {(version === 6 ? [3, 7, 14, 30, 60, 90] : [7, 14, 30, 60, 90]).map(d => (
              <button key={d} onClick={() => setPeriod(d)} style={{ flex: 1, padding: 8, borderRadius: 8, border: period === d ? '1px solid var(--accent)' : '1px solid var(--border)', background: period === d ? 'var(--accent-light)' : 'transparent', color: period === d ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: period === d ? 600 : 500, cursor: 'pointer', transition: 'all var(--transition-fast)', textAlign: 'center' }}>
                {d}д
              </button>
            ))}
          </div>
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Количество</span>
            {availableCount !== null && (
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: availableCount === 0 ? 'var(--error)' : 'var(--success)' }}>
                {availableCount === 0 ? 'Нет в наличии' : `Доступно: ${availableCount}`}
              </span>
            )}
          </div>
          <input type="number" min={1} max={100} value={count} onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))} className="form-input" />
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Стоимость</span>
          <span style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', marginTop: 4 }}>{total} \u20BD</span>
          {count > 1 && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{perProxy} \u20BD \u00D7 {count}</span>}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Отмена</button>
          <button disabled={loading || (availableCount !== null && count > availableCount && availableCount > 0)} onClick={async () => { setLoading(true); await onBuy({ count, period, country, version, type: 'http' }); setLoading(false); }} className="btn-primary" style={{ flex: 1 }}>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, animation: 'fadeIn 0.2s var(--ease-out)' }} onClick={onClose}>
      <div className="glass-modal" onClick={e => e.stopPropagation()} style={{ padding: 32, maxWidth: 440, width: '100%', animation: 'scaleIn 0.3s var(--ease-out)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Пополнить баланс</h2>

        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input type="number" min={10} value={amount} onChange={e => setAmount(Math.max(10, parseInt(e.target.value) || 10))} style={{ width: '100%', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '16px 48px 16px 16px', borderRadius: 'var(--radius-md)', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', outline: 'none' }} />
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '1.25rem', color: 'var(--text-tertiary)' }}>\u20BD</span>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[100, 300, 500, 1000].map(a => (
            <button key={a} onClick={() => setAmount(a)} style={{ flex: 1, padding: 8, borderRadius: 8, border: amount === a ? '1px solid var(--accent)' : '1px solid var(--border)', background: amount === a ? 'var(--accent-light)' : 'transparent', color: amount === a ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: amount === a ? 600 : 500, cursor: 'pointer', textAlign: 'center' }}>
              {a}\u20BD
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {methods.map(m => (
            <button key={m.id} onClick={() => setPayMethod(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-md)', border: payMethod === m.id ? '1px solid var(--accent)' : '1px solid var(--border)', background: payMethod === m.id ? 'var(--accent-light)' : 'transparent', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: '1.125rem' }}>{m.icon}</span>
              <div><div>{m.label}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{m.desc}</div></div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Отмена</button>
          <button onClick={async () => {
            setLoading(true);
            try {
              const res = await fetch('/api/payment/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, method: payMethod }) });
              const data = await res.json();
              if (!res.ok) { onSuccess(`Ошибка: ${data.error}`); setLoading(false); return; }
              if (data.paymentUrl) { window.location.href = data.paymentUrl; return; }
              onSuccess('Счёт создан. Проверьте Telegram.'); onClose();
            } catch (err: any) { onSuccess(`Ошибка: ${err.message}`); }
            setLoading(false);
          }} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
            {loading ? '...' : `Оплатить ${amount} \u20BD`}
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
    fetch('/api/user/me').then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setUser(data.user); setKeys(data.keys || []); })
      .catch(() => setUser(null)).finally(() => setLoading(false));
    fetch('/api/user/partner').then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setPartnerData).catch(() => setPartnerData(null));
  }, []);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  const showNotif = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const handleBuy = async (params: any) => {
    try {
      const res = await fetch('/api/proxy/buy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
      const data = await res.json();
      if (!res.ok) { showNotif(`Ошибка: ${data.error}`); return; }
      showNotif(`Куплено ${data.proxies?.length || 0} прокси`);
      setShowBuyModal(false);
      fetchUserData();
    } catch (err: any) { showNotif(`Ошибка: ${err.message}`); }
  };

  const copyProxy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedProxy(id); setTimeout(() => setCopiedProxy(null), 2000);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  /* ─── LOGIN ─── */
  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--bg)' }}>
      <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', textDecoration: 'none', color: 'var(--text-primary)', marginBottom: 40 }}>
        Proxy<span style={{ color: 'var(--accent)' }}>Key</span>
      </Link>
      <div className="glass-card animate-scale-in" style={{ padding: '48px 40px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{'\u{1F512}'}</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>Вход в кабинет</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 28 }}>Авторизуйтесь через Telegram</p>
        <TelegramWidget />
        <p style={{ marginTop: 28, fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          Нажимая кнопку входа, вы соглашаетесь<br />с правилами использования сервиса
        </p>
      </div>
    </div>
  );

  /* ─── DASHBOARD ─── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {notification && (
        <div style={{ position: 'fixed', top: 68, left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', background: 'var(--text-primary)', color: '#fff', borderRadius: 'var(--radius-pill)', zIndex: 1000, fontWeight: 500, fontSize: '0.8125rem', boxShadow: 'var(--shadow-lg)', animation: 'fadeDown 0.3s var(--ease-out)' }}>
          {notification}
        </div>
      )}

      {showBuyModal && <BuyProxyModal onClose={() => setShowBuyModal(false)} onBuy={handleBuy} />}
      {showTopUpModal && <TopUpModal onClose={() => setShowTopUpModal(false)} onSuccess={msg => { showNotif(msg); fetchUserData(); }} />}

      {/* Header */}
      <nav className="glass-nav">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 52 }}>
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.03em', textDecoration: 'none', color: 'var(--text-primary)' }}>
            Proxy<span style={{ color: 'var(--accent)' }}>Key</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 4 }}>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Баланс</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em' }}>{user.balance} \u20BD</span>
            </div>
            <button onClick={() => setShowTopUpModal(true)} className="btn-ghost btn-sm">Пополнить</button>
            <button onClick={() => setShowBuyModal(true)} className="btn-primary btn-sm">Купить прокси</button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Мои прокси</h1>
            <button onClick={() => setShowBuyModal(true)} className="btn-primary btn-sm">+ Купить</button>
          </div>

          {keys.length === 0 ? (
            <div className="glass-card animate-fade-up" style={{ textAlign: 'center', padding: '64px 32px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.5 }}>{'\u{1F310}'}</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8, letterSpacing: '-0.02em' }}>Нет активных прокси</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>Приобретите прокси для безопасного доступа к сети</p>
              <button onClick={() => setShowBuyModal(true)} className="btn-primary">Купить первый прокси</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {keys.map((key, i) => (
                <div key={key.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: 'var(--radius-lg)', animation: `fadeUp 0.5s var(--ease-out) ${i * 0.05}s both` }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: '1.25rem' }}>{countryFlag(key.country)}</span>
                      <span style={{ padding: '2px 8px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-pill)', fontSize: '0.6875rem', fontWeight: 600 }}>{key.protocol || 'HTTP'}</span>
                      <span style={{ fontFamily: 'SF Mono, Menlo, monospace', fontSize: '0.875rem', fontWeight: 500 }}>{key.ip}:{key.port}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>Логин: <code style={{ fontFamily: 'SF Mono, Menlo, monospace', fontSize: '0.75rem', background: 'rgba(0,0,0,0.03)', padding: '1px 5px', borderRadius: 4 }}>{key.login}</code></span>
                      <span>Пароль: <code style={{ fontFamily: 'SF Mono, Menlo, monospace', fontSize: '0.75rem', background: 'rgba(0,0,0,0.03)', padding: '1px 5px', borderRadius: 4 }}>{key.password}</code></span>
                      {key.expiresAt && <span>До: {new Date(key.expiresAt).toLocaleDateString('ru-RU')}</span>}
                    </div>
                  </div>
                  <button onClick={() => copyProxy(`${key.ip}:${key.port}:${key.login}:${key.password}`, key.id)} className="btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    {copiedProxy === key.id ? '\u2713 Скопировано' : 'Копировать'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card animate-fade-up delay-2" style={{ padding: 20, borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Профиль</h3>
            {[
              { l: 'Имя', v: user.name || '\u2014' },
              { l: 'Telegram', v: `@${user.username || '\u2014'}` },
              { l: 'Баланс', v: `${user.balance} \u20BD`, c: 'var(--accent)', b: true },
              { l: 'Прокси', v: String(keys.length), b: true },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{r.l}</span>
                <span style={{ fontSize: '0.8125rem', color: r.c || 'inherit', fontWeight: r.b ? 700 : 400 }}>{r.v}</span>
              </div>
            ))}
            <button onClick={() => setShowTopUpModal(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: 10 }}>Пополнить баланс</button>
          </div>

          {partnerData && (
            <div className="glass-card animate-fade-up delay-3" style={{ padding: 20, borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Партнёрская программа</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Рефералов</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{partnerData.referralsCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Заработано</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--success)' }}>{partnerData.partner.earnedBalance} \u20BD</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Реферальная ссылка</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="text" value={partnerData.referralLink} readOnly className="form-input" style={{ fontSize: '0.75rem', fontFamily: 'SF Mono, Menlo, monospace', padding: '8px 12px' }} />
                  <button onClick={() => { navigator.clipboard.writeText(partnerData.referralLink).catch(() => {}); setCopiedRef(true); setTimeout(() => setCopiedRef(false), 2000); }} className="btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    {copiedRef ? '\u2713' : 'Копировать'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button onClick={async () => { await fetch('/api/user/logout', { method: 'POST' }).catch(() => {}); document.cookie = 'user_session=; Max-Age=0; path=/;'; window.location.reload(); }} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--error)', marginTop: 8, padding: 10 }}>
            Выйти
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @media (max-width: 768px) {
          div[style*="display: flex"][style*="gap: 24px"][style*="align-items: flex-start"] { flex-direction: column-reverse; }
          div[style*="width: 280px"] { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
