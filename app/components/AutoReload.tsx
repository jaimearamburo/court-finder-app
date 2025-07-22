'use client';

import { useEffect } from 'react';

type AutoReloadProps = { minutes: number };

export function AutoReload({ minutes }: AutoReloadProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.reload();
    }, minutes * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [minutes]);

  return null; // invisible component
}