'use client';

import { useEffect } from 'react';
import { siteConfig } from '@/config/site';

// Set a nivel de módulo: persiste entre el desmontaje/remontaje de Strict Mode
const firedPosts = new Set<number>();

export function ViewTracker({ postId }: { postId: number }) {
  useEffect(() => {
    if (firedPosts.has(postId)) return;
    firedPosts.add(postId);

    fetch(`${siteConfig.api.wordpressUrl}/view/${postId}`, {
      method: 'POST',
      keepalive: true,
    }).catch(() => {});
  }, [postId]);

  return null;
}
