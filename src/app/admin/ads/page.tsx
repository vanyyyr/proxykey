'use client';

export default function AdsAdmin() {
  return (
    <div className="ads-page">
      <h1 className="section-title">📢 Реклама</h1>
      <div className="admin-card glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>🚧</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '8px' }}>Раздел в разработке</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Здесь будет управление рекламными баннерами и партнёрскими интеграциями.
        </p>
      </div>
    </div>
  );
}
