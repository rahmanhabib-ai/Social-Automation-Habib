/**
 * Google Drive & Docs OAuth Helper
 * Integrates with Firebase Auth and Google Identity Services (GIS)
 * using client ID from firebase-applet-config.json or user-configured credentials.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const GOOGLE_WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly'
];

export const GOOGLE_DRIVE_SCOPES = GOOGLE_WORKSPACE_SCOPES;

let cachedAccessToken: string | null = null;
let cachedUserEmail: string | null = null;

function getFirebaseAuthApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export function getCachedToken(): string | null {
  return cachedAccessToken;
}

export function getCachedUserEmail(): string | null {
  return cachedUserEmail;
}

export function setCachedToken(token: string | null, email?: string | null) {
  cachedAccessToken = token;
  if (email !== undefined) cachedUserEmail = email;
}

/**
 * Perform Google Sign-In with Drive & Docs scopes
 */
export async function connectGoogleDriveWithPopup(customClientId?: string): Promise<{
  accessToken: string;
  email?: string;
  displayName?: string;
}> {
  // 1. Try Firebase Auth popup
  try {
    const app = getFirebaseAuthApp();
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    for (const scope of GOOGLE_DRIVE_SCOPES) {
      provider.addScope(scope);
    }
    provider.setCustomParameters({ prompt: 'consent' });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (token) {
      cachedAccessToken = token;
      cachedUserEmail = result.user?.email || null;
      return {
        accessToken: token,
        email: result.user?.email || undefined,
        displayName: result.user?.displayName || undefined
      };
    }
  } catch (fbErr: any) {
    console.warn('Firebase Auth popup attempt notice, checking GIS fallback:', fbErr?.message);
    // If user cancelled, rethrow
    if (fbErr?.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In পপআপ উইন্ডো বন্ধ করা হয়েছে।');
    }
  }

  // 2. Fallback to Google Identity Services (GIS) Token Client
  const effectiveClientId = customClientId?.trim() || firebaseConfig.oAuthClientId;
  if (!effectiveClientId) {
    throw new Error('Google OAuth Client ID কনফিগার করা নেই। অনুগ্রহ করে Client ID প্রদান করুন।');
  }

  if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
    throw new Error('Google Identity Services SDK লোড হয়নি। অনুগ্রহ করে পেজ রিফ্রেশ করুন।');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: effectiveClientId,
        scope: GOOGLE_DRIVE_SCOPES.join(' '),
        callback: (resp: any) => {
          if (resp && resp.access_token) {
            cachedAccessToken = resp.access_token;
            resolve({ accessToken: resp.access_token });
          } else if (resp?.error) {
            reject(new Error(resp.error_description || resp.error || 'Google Connect ব্যর্থ হয়েছে।'));
          } else {
            reject(new Error('Google Access Token পাওয়া যায়নি।'));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message || 'Google Auth ত্রুটি'));
        }
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (e: any) {
      reject(e);
    }
  });
}

export async function disconnectGoogleDrive() {
  cachedAccessToken = null;
  cachedUserEmail = null;
  try {
    const app = getFirebaseAuthApp();
    const auth = getAuth(app);
    await signOut(auth);
  } catch (e) {
    // Ignore signout cleanup error
  }
}
