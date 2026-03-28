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

export default function StatisticsAdmin() {
  const [data, setData] = useState<{
    summary: { totalIncome: number; totalUsers: number; activeProxies: number };
    chart: { labels: string[]; data: number[] };
  } | null>(null);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    fetch(`/api/admin/statistics?days=${period}`)
      .then((res) => res.json())
      .then(setData);
  }, [period]);

  if (!data) return <div>Загрузка статистики...</div>;

  const chartData = {
    labels: data.chart?.labels || [],
    datasets: [
      {
        fill: true,
        label: 'Доход (₽)',
        data: data.chart?.data || [],
        borderColor: '#0066cc', // Apple Blue
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0066cc',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1d1d1f',
        bodyColor: '#1d1d1f',
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { family: 'Inter', size: 13, weight: 600 },
        bodyFont: { family: 'Inter', size: 14 }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: { color: '#86868b', font: { family: 'Inter' }, padding: 10 }
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#86868b', font: { family: 'Inter' }, padding: 10 }
      }
    }
  };

  return (
    <div className="statistics-page">
      <h1 className="section-title">📊 Статистика проекта</h1>
      
      <div className="flex-row" style={{ marginBottom: '32px' }}>
        <div className="admin-card glass-panel" style={{ padding: '32px', flex: 1, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Общий доход</div>
          <div style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            {data.summary.totalIncome.toLocaleString('ru-RU')} ₽
          </div>
        </div>
        <div className="admin-card glass-panel" style={{ padding: '32px', flex: 1, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Всего пользователей</div>
          <div style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            {data.summary.totalUsers}
          </div>
        </div>
        <div className="admin-card glass-panel" style={{ padding: '32px', flex: 1, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Активные прокси</div>
          <div style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            {data.summary.activeProxies}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setPeriod(d)}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border:
                period === d
                  ? '2px solid var(--accent)'
                  : '1px solid var(--separator)',
              background: period === d ? 'var(--bg-subtle)' : 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: period === d ? 600 : 400,
            }}
          >
            {d} дней
          </button>
        ))}
      </div>

      <div className="admin-card glass-panel" style={{ padding: '40px' }}>
        <h3 style={{ marginBottom: '32px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Доход за последние {period} дней (₽)</h3>
        <div style={{ height: '400px' }}>
          <Line options={options} data={chartData} />
        </div>
      </div>
    </div>
  );
}
