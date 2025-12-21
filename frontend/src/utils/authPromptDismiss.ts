const STORAGE_KEY = 'auth_prompt_dismissed';
const DISMISSAL_DURATION = 30 * 60 * 1000; // 30min in milliseconds

interface DismissalRecord {
  pathname: string;
  timestamp: number;
}

/**
 * Check if the auth prompt has been dismissed for a specific path
 * Dismissals expire after 24 hours
 */
export function isPromptDismissed(pathname: string): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const records: DismissalRecord[] = JSON.parse(stored);
    const now = Date.now();

    // Find dismissal for this path
    const record = records.find(r => r.pathname === pathname);
    if (!record) return false;

    // Check if dismissal has expired
    const isExpired = now - record.timestamp > DISMISSAL_DURATION;
    if (isExpired) {
      // Clean up expired dismissal
      clearPromptDismissal(pathname);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking prompt dismissal:', error);
    return false;
  }
}

/**
 * Set the auth prompt as dismissed for a specific path
 */
export function setPromptDismissed(pathname: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const records: DismissalRecord[] = stored ? JSON.parse(stored) : [];

    // Remove existing record for this path
    const filtered = records.filter(r => r.pathname !== pathname);

    // Add new dismissal record
    filtered.push({
      pathname,
      timestamp: Date.now(),
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error setting prompt dismissal:', error);
  }
}

/**
 * Clear dismissal for a specific path
 */
export function clearPromptDismissal(pathname: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const records: DismissalRecord[] = JSON.parse(stored);
    const filtered = records.filter(r => r.pathname !== pathname);

    if (filtered.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error clearing prompt dismissal:', error);
  }
}

/**
 * Clear all expired dismissals
 */
export function cleanupExpiredDismissals(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const records: DismissalRecord[] = JSON.parse(stored);
    const now = Date.now();

    const valid = records.filter(r => now - r.timestamp <= DISMISSAL_DURATION);

    if (valid.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else if (valid.length !== records.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }
  } catch (error) {
    console.error('Error cleaning up dismissals:', error);
  }
}