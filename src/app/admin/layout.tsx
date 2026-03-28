'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (pathname === '/admin') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin');
    router.refresh();
  };

  const navItems = [
    { name: 'Дашборд', path: '/admin/dashboard' },
    { name: 'Настройки', path: '/admin/settings' },
    { name: 'Платежи', path: '/admin/payments' },
    { name: 'Статистика', path: '/admin/statistics' },
    { name: 'Пользователи', path: '/admin/users' },
    { name: 'Партнеры', path: '/admin/partners' },
    { name: 'Рассылки', path: '/admin/mailings' },
  ];

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <span style={{ fontSize: '1.2rem', marginRight: 8 }}>{'\u2699\uFE0F'}</span>
            Admin Panel
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
            style={{ padding: '6px 16px', fontSize: '0.875rem' }}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Выход...' : 'Выйти'}
          </button>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`nav-item ${pathname.startsWith(item.path) ? 'active' : ''}`}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </header>

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
