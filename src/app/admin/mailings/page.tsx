'use client';

import { useState } from 'react';

type Filter = { enabled: boolean; operator: string; value: string };

export default function MailingsAdmin() {
  const [filters, setFilters] = useState<Record<string, Filter>>({
    balance: { enabled: false, operator: '>', value: '0' },
    verificationsCount: { enabled: false, operator: '>', value: '0' },
    paymentsCount: { enabled: false, operator: '>', value: '0' },
  });
  const [message, setMessage] = useState('');
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleFilterToggle = (key: string) => {
    setFilters(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  };

  const handleFilterChange = (key: string, field: 'operator' | 'value', val: string) => {
    setFilters(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  };

  const checkAudience = async () => {
    const res = await fetch('/api/admin/mailings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CHECK_LIST', filters })
    });
    const data = await res.json();
    setAudienceCount(data.count || 0);
  };

  const sendMailing = async () => {
    if (!message) {
      setStatusMsg('Введите сообщение!');
      return;
    }
    if (!confirm('Вы уверены, что хотите начать рассылку?')) return;
    
    setSending(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/admin/mailings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND', filters, message })
      });

      if (res.ok) {
        setStatusMsg('Рассылка успешно запущена!');
        setMessage('');
      } else {
        setStatusMsg('Ошибка запуска рассылки');
      }
    } catch (err) {
      setStatusMsg('Ошибка сети');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mailings-page">
      <h1 className="section-title">✉️ Массовые рассылки</h1>
      
      <div className="flex-row">
        <div className="admin-card glass-panel" style={{ padding: '24px', flex: 1 }}>
          <h2 className="section-title" style={{ fontSize: '1.1rem' }}>Фильтры аудитории</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['balance', 'verificationsCount', 'paymentsCount'].map(key => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={filters[key].enabled}
                  onChange={() => handleFilterToggle(key)}
                  style={{ width: '18px', height: '18px' }}
                />
                <div style={{ width: '150px' }}>
                  {key === 'balance' ? 'Баланс (₽)' : key === 'verificationsCount' ? 'Верификации' : 'Платежи (кол-во)'}
                </div>
                <select 
                  className="form-input" 
                  style={{ width: 'auto', padding: '8px' }}
                  value={filters[key].operator}
                  onChange={(e) => handleFilterChange(key, 'operator', e.target.value)}
                  disabled={!filters[key].enabled}
                >
                  <option value=">">Больше (&gt;)</option>
                  <option value="<">Меньше (&lt;)</option>
                  <option value="=">Равно (=)</option>
                </select>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ width: '100px', padding: '8px' }}
                  value={filters[key].value}
                  onChange={(e) => handleFilterChange(key, 'value', e.target.value)}
                  disabled={!filters[key].enabled}
                />
              </div>
            ))}
          </div>

          <button className="btn-secondary" style={{ marginTop: '24px', width: '100%' }} onClick={checkAudience}>
            🔍 Проверить размер аудитории
          </button>
          
          {audienceCount !== null && (
            <div style={{ marginTop: '16px', textAlign: 'center', padding: '12px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent)', borderRadius: '8px' }}>
              Под фильтры попадает пользователей: <strong style={{ fontSize: '1.2rem' }}>{audienceCount}</strong>
            </div>
          )}
        </div>

        <div className="admin-card glass-panel" style={{ padding: '24px', flex: 1 }}>
          <h2 className="section-title" style={{ fontSize: '1.1rem' }}>Текст рассылки</h2>
          <textarea 
            className="form-textarea" 
            style={{ height: '300px' }}
            placeholder="Введите текст сообщения... Поддерживается HTML разметка Telegram (<b>, <i>, <a>, <code>)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {statusMsg && (
            <div style={{ padding: '12px', marginTop: '16px', borderRadius: '8px', background: 'var(--bg-subtle)' }}>
              {statusMsg}
            </div>
          )}

          <button 
            className="btn-primary" 
            style={{ marginTop: '24px', width: '100%', background: 'linear-gradient(135deg, #00ff88, #00cc6a)', color: '#000' }}
            onClick={sendMailing}
            disabled={sending || (audienceCount === 0)}
          >
            {sending ? 'Отправка...' : '🚀 Начать рассылку'}
          </button>
        </div>
      </div>
    </div>
  );
}
