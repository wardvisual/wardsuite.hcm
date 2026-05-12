import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth } from '@web/lib/firebase';
import { authApi } from '@web/modules/auth/api/auth.api';
import { AuthUser, LoginFormValues, RegisterFormValues } from '@web/modules/auth/types/auth.types';

export class AuthService {
  async login(values: LoginFormValues): Promise<{ user: AuthUser; token: string }> {
    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      values.email,
      values.password,
    );
    // Exchange Firebase ID token for our API session
    const idToken = await credential.user.getIdToken();
    const result = await authApi.login({ email: values.email, password: idToken });
    return result;
  }

  async register(values: RegisterFormValues): Promise<{ user: AuthUser }> {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      values.email,
      values.password,
    );
    const result = await authApi.register({
      email: values.email,
      name: values.name,
      firebaseUid: credential.user.uid,
    });
    return result;
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
  }

  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(firebaseAuth, callback);
  }
}

export const authService = new AuthService();
