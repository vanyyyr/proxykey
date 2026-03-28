'use client';

import { useState, useEffect } from 'react';

export default function PaymentsAdmin() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchPayments = () => {
    setLoading(true);
    fetch(`/api/admin/payments?status=${filter}`)
      .then(res => res.json())
      .then(data => {
        setPayments(data.payments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const statusColor = (s: string) => {
    if (s === 'COMPLETED') return { bg: 'rgba(52,199,89,0.12)', color: '#34c759', label: 'Выполнен' };
    if (s === 'PENDING') return { bg: 'rgba(255,204,0,0.12)', color: '#ffcc00', label: 'Ожидание' };
    if (s === 'FAILED') return { bg: 'rgba(255,59,48,0.12)', color: '#ff3b30', label: 'Ошибка' };
    return { bg: 'rgba(142,142,147,0.12)', color: '#8e8e93', label: s };
  };

  const totalCompleted = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="payments-page">
      <h1 className="section-title">💳 Транзакции</h1>

      {/* Summary cards */}
      <div className="flex-row" style={{ marginBottom: '32px' }}>
        <div className="admin-card glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Всего платежей</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{payments.length}</div>
        </div>
        <div className="admin-card glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Выполнено</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{totalCompleted} ₽</div>
        </div>
        <div className="admin-card glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Ожидание</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{payments.filter(p => p.status === 'PENDING').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { value: '', label: 'Все' },
            { value: 'COMPLETED', label: '✅ Выполненные' },
            { value: 'PENDING', label: '⏳ Ожидание' },
            { value: 'FAILED', label: '❌ Ошибки' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                background: filter === f.value ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                color: filter === f.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: filter === f.value ? 600 : 400, cursor: 'pointer', fontSize: '0.85rem',
              }}
            >{f.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Загрузка...</div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}>💸</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>Платежей пока нет</div>
            <div>Когда пользователи начнут оплачивать, транзакции появятся здесь.</div>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Пользователь</th>
                  <th>Метод</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>ID транзакции</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const st = statusColor(p.status);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(p.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>@{p.username}</span>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '3px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600,
                          background: 'rgba(10,132,255,0.1)', color: 'var(--accent)',
                        }}>
                          {p.method}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.amount} ₽</td>
                      <td>
                        <span style={{ 
                          padding: '3px 10px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600,
                          background: st.bg, color: st.color,
                        }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                        {p.transactionId ? p.transactionId.substring(0, 16) + (p.transactionId.length > 16 ? '...' : '') : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
