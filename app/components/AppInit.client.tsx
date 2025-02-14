import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { themeStore } from '~/lib/stores/theme';
import { logStore } from '~/lib/stores/logs';

export function AppInit() {
  const theme = useStore(themeStore);

  useEffect(() => {
    logStore.logSystem('Application initialized', {
      theme,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, [theme]);

  return null;
}
