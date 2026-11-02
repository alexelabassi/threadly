import { useState } from 'react';

export function useTheme() {
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('threadly-theme', next ? 'dark' : 'light');
    } catch {
      /* Theme still works without storage. */
    }
  }
  return { dark, toggle };
}
