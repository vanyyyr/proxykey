'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface DashboardData {
  totalUsers: number;
  activeProxies: number;
  totalIncome: number;
  availableProxies: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    method: string;
    username: string;
    createdAt: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    username: string;
    createdAt: string;
  }>;
  chart: { labels: string[]; data: number[] };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await fetch('/api/admin/proxy-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_WEBSHARE' }),
      });
      const result = await res.json();
      if (res.ok) {
        setSyncMsg(`Синхронизировано: создано ${result.created}, пропущено ${result.skipped}`);
        fetchData();
      } else {
        setSyncMsg(`Ошибка: ${result.error}`);
      }
    } catch (e) {
      setSyncMsg('Ошибка синхронизации');
    }
    setSyncing(false);
  };

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
        Загрузка дашборда...
      </div>
    );
  }

  const chartData = {
    labels: data.chart.labels,
    datasets: [
      {
        fill: true,
        label: 'Доход (₽)',
        data: data.chart.data,
        borderColor: '#0066cc',
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#0066cc',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: '#1d1d1f',
        bodyColor: '#1d1d1f',
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#86868b' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#86868b' },
      },
    },
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <h1 className="section-title" style={{ marginBottom: 0 }}>
          Дашборд
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {syncMsg && (
            <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
              {syncMsg}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            {syncing ? 'Синхронизация...' : 'Синхронизировать Webshare'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex-row" style={{ marginBottom: '32px' }}>
        <div
          className="admin-card glass-panel"
          style={{ padding: '24px', textAlign: 'center' }}
        >
          <div
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            Пользователи
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{data.totalUsers}</div>
        </div>
        <div
          className="admin-card glass-panel"
          style={{ padding: '24px', textAlign: 'center' }}
        >
          <div
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            Активных прокси
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{data.activeProxies}</div>
        </div>
        <div
          className="admin-card glass-panel"
          style={{ padding: '24px', textAlign: 'center' }}
        >
          <div
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            Доход
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--success)',
            }}
          >
            {data.totalIncome.toLocaleString('ru-RU')} ₽
          </div>
        </div>
        <div
          className="admin-card glass-panel"
          style={{ padding: '24px', textAlign: 'center' }}
        >
          <div
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            В пуле (Webshare)
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--accent)',
            }}
          >
            {data.availableProxies}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="admin-card glass-panel"
        style={{ padding: '32px', marginBottom: '32px' }}
      >
        <h3 style={{ marginBottom: '24px', fontSize: '1.1rem', fontWeight: 600 }}>
          Доход за 7 дней (₽)
        </h3>
        <div style={{ height: '300px' }}>
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex-row">
        <div className="admin-card glass-panel" style={{ padding: '24px', flex: 1 }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>
            Последние платежи
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recentPayments.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--bg-subtle)',
                  borderRadius: '10px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{p.username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {p.method} · {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    color: p.amount > 0 ? 'var(--success)' : 'var(--text-primary)',
                  }}
                >
                  {p.amount > 0 ? '+' : ''}
                  {p.amount} ₽
                </div>
              </div>
            ))}
            {data.recentPayments.length === 0 && (
              <div style={{ color: 'var(--text-tertiary)', padding: '20px', textAlign: 'center' }}>
                Нет платежей
              </div>
            )}
          </div>
        </div>

        <div className="admin-card glass-panel" style={{ padding: '24px', flex: 1 }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>
            Последние регистрации
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recentUsers.map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--bg-subtle)',
                  borderRadius: '10px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                    {u.name || u.username || 'Без имени'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    @{u.username || '—'} ·{' '}
                    {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>
            ))}
            {data.recentUsers.length === 0 && (
              <div style={{ color: 'var(--text-tertiary)', padding: '20px', textAlign: 'center' }}>
                Нет пользователей
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
