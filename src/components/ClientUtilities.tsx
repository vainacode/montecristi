'use client';

import dynamic from 'next/dynamic';

// Lazy-load non-critical client utilities to reduce initial JS bundle
// These components render nothing visible — they only attach event listeners
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false });
const ExternalLinkManager = dynamic(() => import('@/components/ExternalLinkManager').then(m => ({ default: m.ExternalLinkManager })), { ssr: false });
const NavigationLoader = dynamic(() => import('@/components/NavigationLoader').then(m => ({ default: m.NavigationLoader })), { ssr: false });
const CopyProtection = dynamic(() => import('@/components/CopyProtection').then(m => ({ default: m.CopyProtection })), { ssr: false });

/**
 * Wrapper that lazy-loads invisible client-side utilities after initial paint.
 * Reduces the critical JS bundle by deferring event-listener-only components.
 */
export function ClientUtilities() {
  return (
    <>
      <ScrollToTop />
      <CopyProtection />
      <NavigationLoader />
      <ExternalLinkManager />
    </>
  );
}
