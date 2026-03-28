'use client';

import { useState, useEffect } from 'react';

export default function PartnersAdmin() {
  const [partners, setPartners] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPartners: 0, totalToPay: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/partners?type=list').then(res => res.json()),
      fetch('/api/admin/partners?type=requests').then(res => res.json())
    ]).then(([partnersData, requestsData]) => {
      setPartners(partnersData.partners || []);
      setStats(partnersData.stats || { totalPartners: 0, totalToPay: 0, totalEarned: 0 });
      setRequests(requestsData.requests || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequest = async (id: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Вы уверены, что хотите \${action === 'APPROVE' ? 'одобрить' : 'отклонить'} этот запрос?`)) return;
    
    await fetch('/api/admin/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action })
    });
    fetchData();
  };

  return (
    <div className="partners-page">
      <div className="flex-row" style={{ marginBottom: '24px' }}>
        <div className="admin-card glass-card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Партнёров</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalPartners}</div>
        </div>
        <div className="admin-card glass-card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>К выплате</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalToPay} ₽</div>
        </div>
        <div className="admin-card glass-card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--success)', fontSize: '0.875rem' }}>Выплачено</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.totalEarned - stats.totalToPay} ₽</div>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="admin-card glass-card" style={{ padding: '24px' }}>
          <h2 className="section-title">💸 Запросы на вывод</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Партнёр</th>
                  <th>Сумма</th>
                  <th>Реквизиты</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>{req.partner.user.name || req.partner.user.username}</td>
                    <td style={{ fontWeight: 'bold' }}>{req.amount} ₽</td>
                    <td>{req.details || 'Не указаны'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRequest(req.id, 'APPROVE')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Одобрить</button>
                        <button onClick={() => handleRequest(req.id, 'REJECT')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Отклонить</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-card glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Список партнёров</h2>
          <input type="text" className="form-input" placeholder="🔍 Поиск" style={{ width: '300px' }} />
        </div>

        {loading ? <div>Загрузка...</div> : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Партнёр</th>
                  <th>Рефералов</th>
                  <th>Заработано</th>
                  <th>К выплате</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.name || 'Без Имени'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>@{p.username} | ID: {p.userId.substring(0, 8)}</div>
                    </td>
                    <td>{p.referralsCount}</td>
                    <td>{p.earnedBalance} ₽</td>
                    <td style={{ color: p.pendingBalance > 0 ? 'var(--accent)' : 'inherit', fontWeight: p.pendingBalance > 0 ? 'bold' : 'normal' }}>
                      {p.pendingBalance} ₽
                    </td>
                  </tr>
                ))}
                {partners.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      Партнёры не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
