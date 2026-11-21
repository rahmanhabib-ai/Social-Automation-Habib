/**
 * Utility to manage active page session & route persistence.
 * When the app auto-reloads (due to code changes, dev server restart, or browser refresh),
 * it restores the user's exact last active page instead of resetting to the public homepage,
 * UNLESS the user explicitly logged out.
 */

const STORAGE_ACTIVE_ROUTE = 'app_last_active_route';
const STORAGE_SESSION_ACTIVE = 'app_has_active_session';
const STORAGE_LOGGED_OUT = 'app_logged_out';

/**
 * Saves the current active route into localStorage to survive reloads/refreshes.
 */
export function saveActiveRoute(pathname: string, search: string = ''): void {
  if (typeof window === 'undefined') return;

  const cleanPath = (pathname || '').trim();
  // Don't save public/auth landing pages as session targets
  if (
    !cleanPath ||
    cleanPath === '/' ||
    cleanPath === '/home' ||
    cleanPath === '/login' ||
    cleanPath === '/register'
  ) {
    return;
  }

  const fullRoute = `${cleanPath}${search || ''}`;
  try {
    localStorage.setItem(STORAGE_ACTIVE_ROUTE, fullRoute);
    localStorage.setItem(STORAGE_SESSION_ACTIVE, 'true');
    localStorage.removeItem(STORAGE_LOGGED_OUT);
  } catch (e) {
    // Ignore storage quota or disabled storage
  }
}

/**
 * Retrieves the last active route if the user is in an active session (not logged out).
 */
export function getLastActiveRoute(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const isLoggedOut = localStorage.getItem(STORAGE_LOGGED_OUT) === 'true';
    if (isLoggedOut) {
      return null;
    }

    const hasSession = localStorage.getItem(STORAGE_SESSION_ACTIVE) === 'true';
    const lastRoute = localStorage.getItem(STORAGE_ACTIVE_ROUTE);

    if (hasSession && lastRoute && lastRoute !== '/' && lastRoute !== '/home') {
      return lastRoute;
    }
  } catch (e) {
    // Ignore
  }
  return null;
}

/**
 * Starts an active session with a designated target route (e.g. after login or portal entry).
 */
export function startActiveSession(targetRoute: string = '/admin/controller'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_LOGGED_OUT);
    localStorage.setItem(STORAGE_SESSION_ACTIVE, 'true');
    localStorage.setItem(STORAGE_ACTIVE_ROUTE, targetRoute);
  } catch (e) {}
}

/**
 * Explicitly clears the active session when the user logs out.
 * When logged out, visiting '/' will keep the user on the public homepage.
 */
export function clearActiveSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_ACTIVE_ROUTE);
    localStorage.removeItem(STORAGE_SESSION_ACTIVE);
    localStorage.setItem(STORAGE_LOGGED_OUT, 'true');
  } catch (e) {}
}
