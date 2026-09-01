'use client';

import { useEffect } from 'react';
import { ApiFallbackScreen } from '@/components/ApiFallbackScreen';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error Boundary]:', error);
  }, [error]);

  return (
    <ApiFallbackScreen 
      onRetry={() => reset()} 
      message="Ocurrió una interrupción temporal al sincronizar los artículos con la fuente oficial. Pulsa reintentar para restablecer la conexión."
    />
  );
}
