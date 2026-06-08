import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  type Auth,
} from 'firebase/auth';

function firebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  if (!apiKey || !authDomain || !projectId) {
    return null;
  }

  return { apiKey, authDomain, projectId };
}

export function isFirebaseAuthConfigured(): boolean {
  return firebaseConfig() !== null;
}

function getFirebaseApp(): FirebaseApp {
  const config = firebaseConfig();
  if (!config) {
    throw new Error(
      'Firebase is not configured (NEXT_PUBLIC_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID)',
    );
  }
  return getApps().length > 0 ? getApp() : initializeApp(config);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super('Sign-in cancelled');
    this.name = 'GoogleSignInCancelledError';
  }
}

function mapFirebaseAuthError(err: unknown): Error {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code?: string }).code)
      : '';

  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request'
  ) {
    return new GoogleSignInCancelledError();
  }
  if (code === 'auth/popup-blocked') {
    return new Error('Popup blocked. Allow popups for this site and try again.');
  }

  return err instanceof Error ? err : new Error('Google sign-in failed');
}

/** Obtain a Firebase ID token after Google Sign-In (web popup). */
export async function obtainGoogleIdToken(): Promise<string> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken(true);
    if (!token) {
      throw new Error('Failed to obtain Firebase ID token');
    }
    return token;
  } catch (err) {
    throw mapFirebaseAuthError(err);
  }
}
