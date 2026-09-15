import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange) {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
}

function getSnapshot() {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

// True when the user asked the system to reduce motion, updating if the setting changes
export function usePrefersReducedMotion() {
    return useSyncExternalStore(subscribe, getSnapshot);
}
