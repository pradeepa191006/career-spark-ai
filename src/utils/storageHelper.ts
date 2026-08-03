/**
 * User Data Isolation LocalStorage Helper
 * Ensures all user documents, resumes, ATS reports, portfolios, and interview logs are isolated per authenticated user ID.
 */

export const getUserScopedKey = (baseKey: string, userId?: string): string => {
  if (!userId) {
    const activeEmail = localStorage.getItem('cs_active_session_email') || 'anonymous';
    return `${baseKey}_${activeEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  }
  return `${baseKey}_${userId}`;
};

export const getScopedStorage = <T>(baseKey: string, userId?: string, fallback: T = null as any): T => {
  try {
    const key = getUserScopedKey(baseKey, userId);
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
    // Legacy fallback check
    const legacyItem = localStorage.getItem(baseKey);
    if (legacyItem) {
      const parsed = JSON.parse(legacyItem);
      localStorage.setItem(key, JSON.stringify(parsed));
      return parsed;
    }
  } catch (e) {
    console.error(`Error reading ${baseKey} from storage`, e);
  }
  return fallback;
};

export const setScopedStorage = <T>(baseKey: string, data: T, userId?: string): void => {
  try {
    const key = getUserScopedKey(baseKey, userId);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${baseKey} to storage`, e);
  }
};

export const removeScopedStorage = (baseKey: string, userId?: string): void => {
  try {
    const key = getUserScopedKey(baseKey, userId);
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing ${baseKey} from storage`, e);
  }
};
