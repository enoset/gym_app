'use client';

import { useEffect } from 'react';

export function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/gym_app/sw.js', { scope: '/gym_app/' });
    }
  }, []);
  return null;
}
