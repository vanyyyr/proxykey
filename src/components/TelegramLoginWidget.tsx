'use client';

import { useEffect, useRef } from 'react';

export default function TelegramLoginWidget({
  botName = 'proxytgkeybot',
  authUrl = '/api/auth/telegram/callback',
  buttonSize = 'large'
}: {
  botName?: string;
  authUrl?: string;
  buttonSize?: 'large' | 'medium' | 'small';
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing scripts/widgets to prevent duplicates during re-renders
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-auth-url', authUrl);
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    containerRef.current.appendChild(script);
  }, [botName, authUrl, buttonSize]);

  return <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center' }} />;
}
