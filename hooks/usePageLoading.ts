'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Set loading saat route berubah
    setIsLoading(true);

    // Hapus loading setelah render selesai
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Delay minimal untuk smooth UX

    return () => clearTimeout(timeout);
  }, [pathname]);

  return isLoading;
}
