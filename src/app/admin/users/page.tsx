'use client';

import { useState, useEffect } from 'react';

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, positiveBalanceUsers: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Balance modal
  const [balanceModal, setBalanceModal] = useState<{ userId: string; username: string; currentBalance: number } | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch(`/api/admin/users?search=${search}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setStats(data.stats || { totalUsers: 0, positiveBalanceUsers: 0 });
        setLoading(false);
      });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleAddBalance = async () => {
    if (!balanceModal || !balanceAmount) return;
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount === 0) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: balanceModal.userId,
          action: 'ADD_BALANCE',
          data: { amount },
        }),
      });
      if (res.ok) {
        setBalanceModal(null);
        setBalanceAmount('');
        setBalanceReason('');
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
    setActionLoading(false);
  };

  const handleBan = async (userId: string, isBanned: boolean) => {
    if (!confirm(isBanned ? 'Разбанить пользователя?' : 'Забанить пользователя?')) return;
    try {
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          action: isBanned ? 'UNBAN' : 'BAN',
          data: {},
        }),
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="users-page">
      {/* Stats */}
      <div className="flex-row" style={{ marginBottom: '32px' }}>
        <div className="admin-card glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Пользователей в системе</div>
          <div style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.04em' }}>{stats.totalUsers}</div>
        </div>
        <div className="admin-card glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>С положительным балансом</div>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--success)', letterSpacing: '-0.04em' }}>{stats.positiveBalanceUsers}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Поиск (ID, Username, Имя)..." 
            style={{ width: '400px', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke-width=\'1.5\' stroke=\'%2386868b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '16px center', backgroundSize: '20px', paddingLeft: '48px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div>Загрузка...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Баланс ↕</th>
                  <th>Платежи</th>
                  <th>Роль</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', 
                          background: 'rgba(0, 0, 0, 0.02)', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 'bold', fontSize: '10px'
                        }}>
                          {user.username ? user.username.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{user.name || 'Без Имени'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            @{user.username || 'unknown'} | ID: {user.telegramId || user.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email || '-'}</td>
                    <td style={{ color: user.balance > 0 ? 'var(--accent)' : 'inherit', fontWeight: 600 }}>
                      {user.balance} ₽
                    </td>
                    <td>
                      <span style={{ color: user.paymentsSum > 0 ? 'var(--success)' : 'inherit' }}>
                        {user.paymentsSum} ₽
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginLeft: '4px' }}>
                        ({user.paymentsCount})
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '100px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: user.role === 'ADMIN' ? 'rgba(10,132,255,0.12)' : user.role === 'BANNED' ? 'rgba(255,59,48,0.12)' : 'rgba(52,199,89,0.12)',
                        color: user.role === 'ADMIN' ? 'var(--accent)' : user.role === 'BANNED' ? 'var(--error)' : 'var(--success)',
                      }}>
                        {user.role === 'ADMIN' ? 'Админ' : user.role === 'BANNED' ? 'Забанен' : 'Юзер'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setBalanceModal({ userId: user.id, username: user.username || user.name || 'user', currentBalance: user.balance })}
                          title="Изменить баланс"
                          style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(10,132,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(10,132,255,0.2)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          💰 Баланс
                        </button>
                        <button
                          onClick={() => handleBan(user.id, user.role === 'BANNED')}
                          title={user.role === 'BANNED' ? 'Разбанить' : 'Забанить'}
                          style={{ padding: '4px 10px', borderRadius: '6px', background: user.role === 'BANNED' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)', color: user.role === 'BANNED' ? 'var(--success)' : 'var(--error)', border: `1px solid ${user.role === 'BANNED' ? 'rgba(52,199,89,0.2)' : 'rgba(255,59,48,0.2)'}`, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          {user.role === 'BANNED' ? '✅ Разбан' : '🚫 Бан'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      Пользователи не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Balance Modal */}
      {balanceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setBalanceModal(null)}
        >
          <div className="glass-card" style={{ padding: '32px', maxWidth: '420px', width: '100%', borderRadius: '20px', background: 'var(--bg)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>💰 Изменить баланс</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Пользователь: <strong>@{balanceModal.username}</strong><br/>
              Текущий баланс: <strong style={{ color: 'var(--accent)' }}>{balanceModal.currentBalance} ₽</strong>
            </p>

            <label style={{ display: 'block', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Сумма (+ начислить, − списать)</span>
              <input 
                type="number" 
                value={balanceAmount}
                onChange={e => setBalanceAmount(e.target.value)}
                placeholder="Например: 100 или -50"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(0, 0, 0, 0.02)', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600 }}
              />
            </label>

            {/* Quick amount buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[50, 100, 500, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBalanceAmount(String(amt))}
                  style={{ 
                    padding: '6px 14px', borderRadius: '8px', 
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--success)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600
                  }}
                >
                  +{amt}₽
                </button>
              ))}
              {[-50, -100].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBalanceAmount(String(amt))}
                  style={{ 
                    padding: '6px 14px', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--error)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600
                  }}
                >
                  {amt}₽
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setBalanceModal(null)} 
                className="btn-secondary" 
                style={{ flex: 1, padding: '12px' }}
              >
                Отмена
              </button>
              <button 
                onClick={handleAddBalance}
                disabled={actionLoading || !balanceAmount}
                className="btn-primary" 
                style={{ flex: 1, padding: '12px', opacity: (actionLoading || !balanceAmount) ? 0.5 : 1 }}
              >
                {actionLoading ? 'Сохранение...' : balanceAmount && parseFloat(balanceAmount) < 0 ? 'Списать' : 'Начислить'}
              </button>
            </div>

            {balanceAmount && !isNaN(parseFloat(balanceAmount)) && (
              <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                Новый баланс: <strong style={{ color: 'var(--text-primary)' }}>{balanceModal.currentBalance + parseFloat(balanceAmount)} ₽</strong>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
