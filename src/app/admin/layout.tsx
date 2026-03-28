'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Don't show navigation on the login page itself
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
      <header className="admin-header glass-panel">
        <div className="admin-header-content">
          <div className="admin-title">
            <span style={{fontSize: '1.2rem', marginRight: '8px'}}>⚙️</span> 
            Admin Panel
          </div>
          <button 
            onClick={handleLogout} 
            className="btn-secondary" 
            style={{padding: '6px 16px', fontSize: '0.875rem'}}
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

      <style dangerouslySetInnerHTML={{__html: `
        body {
          background-color: var(--bg);
        }
        
        .admin-layout {
          min-height: 100vh;
        }

        .admin-header {
          position: sticky;
          top: 0;
          z-index: 100;
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          border-top: none;
          border-left: none;
          border-right: none;
        }

        .admin-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 40px;
          border-bottom: 1px solid var(--separator);
        }

        .admin-title {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
        }

        .admin-nav {
          display: flex;
          gap: 32px;
          padding: 0 40px;
          overflow-x: auto;
        }

        .nav-item {
          padding: 18px 0;
          color: var(--text-secondary);
          font-weight: 500;
          position: relative;
          white-space: nowrap;
          transition: color var(--transition-fast);
        }

        .nav-item:hover {
          color: var(--text-primary);
        }

        .nav-item.active {
          color: var(--text-primary);
          font-weight: 600;
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--text-primary);
          border-radius: 3px 3px 0 0;
        }

        .admin-content {
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .admin-card {
          margin-bottom: 32px;
        }

        /* Form Controls used across admin */
        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .form-description {
          display: block;
          margin-top: 6px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .form-input {
          width: 100%;
          background: var(--bg-subtle);
          border: 1px solid var(--separator);
          color: var(--text-primary);
          padding: 14px 16px;
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 1rem;
          transition: all var(--transition-fast);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent);
          background: var(--bg);
          box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.15);
        }

        .form-textarea {
          width: 100%;
          background: var(--bg-subtle);
          border: 1px solid var(--separator);
          color: var(--text-primary);
          padding: 14px 16px;
          border-radius: var(--radius-md);
          font-family: monospace;
          min-height: 120px;
          resize: vertical;
          font-size: 0.95rem;
          transition: all var(--transition-fast);
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--accent);
          background: var(--bg);
          box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.15);
        }

        .section-title {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: -0.02em;
        }
        
        .flex-row {
          display: flex;
          gap: 24px;
        }
        
        .flex-row > * {
          flex: 1;
        }

        /* Toggle Switch - Apple Style */
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 30px;
        }

        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--text-tertiary);
          transition: .3s cubic-bezier(0.25, 1, 0.5, 1);
          border-radius: 30px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .3s cubic-bezier(0.25, 1, 0.5, 1);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input:checked + .slider {
          background-color: var(--success);
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }
        
        input:disabled + .slider {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Tables */
        .admin-table-container {
          overflow-x: auto;
          border-radius: var(--radius-md);
          border: 1px solid var(--separator);
        }
        
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        
        .admin-table th {
          padding: 16px 20px;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid var(--separator);
          background: var(--bg-subtle);
        }
        
        .admin-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--separator);
          vertical-align: middle;
          font-size: 0.95rem;
        }
        
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        
        .admin-table tr:hover td {
          background-color: var(--bg-subtle);
        }
      `}} />
    </div>
  );
}
