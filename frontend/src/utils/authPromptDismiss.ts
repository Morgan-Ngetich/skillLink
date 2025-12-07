// The "key" is the page's location pathname
const STORAGE_PREFIX = "authPromptDismissed:";
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes expiry

export function isPromptDismissed(key: string): boolean {
  const item = sessionStorage.getItem(STORAGE_PREFIX + key);
  if (!item) return false;

  try {
    const { dismissedAt } = JSON.parse(item);
    if (Date.now() - dismissedAt > EXPIRY_MS) {
      sessionStorage.removeItem(STORAGE_PREFIX + key);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function setPromptDismissed(key: string): void {
  sessionStorage.setItem(
    STORAGE_PREFIX + key,
    JSON.stringify({ dismissedAt: Date.now() })
  );
}

export function clearPromptDismissed(key: string): void {
  sessionStorage.removeItem(STORAGE_PREFIX + key);
}
