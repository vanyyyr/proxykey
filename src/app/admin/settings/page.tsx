'use client';

import { useState, useEffect } from 'react';

export default function DashboardSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ text: 'Настройки успешно сохранены', type: 'success' });
      } else {
        setMessage({ text: 'Ошибка при сохранении', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Ошибка сети', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  if (loading) return <div>Загрузка настроек...</div>;

  return (
    <div className="settings-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Настройки системы</h1>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '32px',
          background: message.type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 51, 102, 0.1)',
          color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
        }}>
          {message.text}
        </div>
      )}

      <div className="admin-card glass-card" style={{ padding: '32px' }}>
        <h2 className="section-title">🔐 Авторизация</h2>
        <div className="form-group">
          <label className="form-label">Пароль администратора</label>
          <input
            type="password"
            className="form-input"
            value={settings.admin_password || ''}
            onChange={(e) => handleChange('admin_password', e.target.value)}
            placeholder="Оставьте пустым, чтобы не менять"
          />
        </div>
      </div>

      <div className="admin-card glass-card" style={{ padding: '32px' }}>
        <h2 className="section-title">📱 Telegram</h2>
        <div className="form-group">
          <label className="form-label">Channel ID</label>
          <input type="text" className="form-input" value={settings.telegram_channel_id || ''} onChange={(e) => handleChange('telegram_channel_id', e.target.value)} />
          <span className="form-description">ID канала для подписки</span>
        </div>
        <div className="form-group">
          <label className="form-label">Ссылка на подписку</label>
          <input type="text" className="form-input" value={settings.telegram_subscription_url || ''} onChange={(e) => handleChange('telegram_subscription_url', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">ID админа для уведомлений</label>
          <input type="text" className="form-input" value={settings.telegram_admin_id || ''} onChange={(e) => handleChange('telegram_admin_id', e.target.value)} />
        </div>
      </div>

      <div className="admin-card glass-card" style={{ padding: '32px' }}>
        <h2 className="section-title">💰 Финансы & Платёжные системы</h2>
        
        <div className="flex-row" style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="switch">
              <input type="checkbox" checked={settings.payment_yoomoney_enabled === 'true'} onChange={(e) => handleChange('payment_yoomoney_enabled', e.target.checked.toString())} />
              <span className="slider"></span>
            </div>
            <span>YooMoney (Карты РФ)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="switch">
              <input type="checkbox" checked={settings.payment_nowpayments_enabled === 'true'} onChange={(e) => handleChange('payment_nowpayments_enabled', e.target.checked.toString())} />
              <span className="slider"></span>
            </div>
            <span>NOWPayments (Крипто)</span>
          </label>
        </div>

        <div className="flex-row">
          <div className="form-group">
            <label className="form-label">Бонус за регистрацию (₽)</label>
            <input type="number" className="form-input" value={settings.payment_registration_bonus || '0'} onChange={(e) => handleChange('payment_registration_bonus', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Цена верификации (₽)</label>
            <input type="number" className="form-input" value={settings.payment_verification_price || '0'} onChange={(e) => handleChange('payment_verification_price', e.target.value)} />
          </div>
        </div>
        
        <div className="flex-row">
          <div className="form-group">
            <label className="form-label">Мин. платёж (₽)</label>
            <input type="number" className="form-input" value={settings.payment_min_amount || '0'} onChange={(e) => handleChange('payment_min_amount', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">% партнёрам</label>
            <input type="number" className="form-input" value={settings.partner_percentage || '0'} onChange={(e) => handleChange('partner_percentage', e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ marginBottom: '8px', fontWeight: 600 }}>YooMoney Webhook</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Укажите этот URL в настройках YooMoney: <br/>
            <code style={{ display: 'inline-block', marginTop: '8px', padding: '6px 12px', background: 'var(--bg-elevated)', borderRadius: '4px', color: 'var(--accent)' }}>
              {settings.site_base_url}/api/webhooks/yoomoney
            </code>
          </p>
        </div>
      </div>

      <div className="admin-card glass-card" style={{ padding: '32px' }}>
        <h2 className="section-title">🌐 Сайт</h2>
        <div className="form-group">
          <label className="form-label">Base URL (Домен)</label>
          <input type="text" className="form-input" value={settings.site_base_url || ''} onChange={(e) => handleChange('site_base_url', e.target.value)} />
        </div>
        
        <div style={{ border: '1px solid var(--border)', background: 'rgba(0, 0, 0, 0.02)', padding: '24px', borderRadius: 'var(--radius-md)', marginTop: '32px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 600 }}>🔧 Режим технического обслуживания</h3>
          <div className="form-group">
            <label className="form-label">Текст сообщения на странице ТО:</label>
            <textarea className="form-textarea" value={settings.maintenance_message || ''} onChange={(e) => handleChange('maintenance_message', e.target.value)}></textarea>
          </div>
        </div>
      </div>

      <div className="admin-card glass-card" style={{ padding: '32px', marginBottom: '80px' }}>
        <h2 className="section-title">🔧 Техническое</h2>
        <div className="form-group">
          <label className="form-label">Ключ журнала отладки</label>
          <input type="password" className="form-input" value={settings.tech_debug_key || ''} onChange={(e) => handleChange('tech_debug_key', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Пул прокси (ip:port:login:password)</label>
          <textarea className="form-textarea" value={settings.tech_proxy_pool || ''} onChange={(e) => handleChange('tech_proxy_pool', e.target.value)} placeholder="Каждая прокси с новой строки"></textarea>
        </div>
      </div>

    </div>
  );
}
