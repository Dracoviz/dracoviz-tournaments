import { useEffect } from 'react';
import { useRouter } from 'next/router';
import firebase from 'firebase/compat/app';
import { getCookie } from 'cookies-next';
import { identify, resetIdentity } from './analytics';
import { USER_PROP } from './analyticsEvents';

/**
 * One auth listener whose only job is analytics identity.
 *
 * Deliberately additive: the twelve existing per-page `onAuthStateChanged`
 * listeners are left alone. Refactoring them into shared state is a worthwhile
 * cleanup but is unrelated risk, and auth is the one thing in this app that
 * must not regress.
 */
export default function useAnalyticsIdentity() {
  const router = useRouter();

  useEffect(() => {
    const unregister = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        resetIdentity();
        return;
      }
      identify(user.uid, {
        [USER_PROP.APP_LOCALE]: router.locale,
        [USER_PROP.THEME]: getCookie('NEXT_THEME') ?? 'dark',
      });
    });
    return () => unregister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
