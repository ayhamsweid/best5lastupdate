export const deferNonCritical = (task: () => void): (() => void) => {
  if (typeof window === 'undefined') {
    task();
    return () => undefined;
  }

  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(task, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }

  const timeoutId = window.setTimeout(task, 250);
  return () => window.clearTimeout(timeoutId);
};
