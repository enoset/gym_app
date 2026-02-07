'use client';

import { useEffect } from 'react';

export function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/gym_app/sw.js', { scope: '/gym_app/' })
        .catch(() => {
          // Registration failed — offline caching unavailable
        });
    }
  }, []);
  return null;
}
