import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Router from 'next/router';
import { track, trackPageView, stripQuery } from './analytics';
import { EVENT, PARAM, screenForPathname } from './analyticsEvents';

/**
 * Pull the identifying route params off the URL so per-tournament analysis is
 * still possible even though `page_location` is normalized to the route
 * pattern. Only opaque ids are lifted -- never `?pid=` (the registration
 * password) or any other query value.
 */
function pageParamsFor(query = {}) {
  const tournamentId = query.id ?? query.session;
  return {
    [PARAM.TOURNAMENT_ID]: tournamentId,
    [PARAM.SPECIES_ID]: query.pokemon,
  };
}

/**
 * Sends a normalized `page_view` on mount and on every real navigation, plus a
 * `route_transition` timing event.
 *
 * Before this, GA only fired `gtag('config')` once when <Header> mounted, so
 * client-side navigations were never recorded at all and any page without a
 * Header (404, _error) was invisible.
 *
 * The effect is keyed on the path WITHOUT its query string: navigating from
 * /tournament/A to /tournament/B is a real pageview, but the usage page's
 * shallow `?pokemon=` drilldowns are not (those emit their own event).
 */
export default function useAnalyticsPageTracking() {
  const router = useRouter();
  const path = stripQuery(router.asPath);
  const transitionStartedAt = useRef(null);

  useEffect(() => {
    trackPageView({
      screen: screenForPathname(router.pathname),
      pathname: router.pathname,
      asPath: router.asPath,
      locale: router.locale,
      params: pageParamsFor(router.query),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, router.locale]);

  useEffect(() => {
    const onStart = () => {
      transitionStartedAt.current = Date.now();
    };
    const onComplete = () => {
      if (transitionStartedAt.current == null) return;
      const duration = Date.now() - transitionStartedAt.current;
      transitionStartedAt.current = null;
      track(EVENT.ROUTE_TRANSITION, {
        [PARAM.SCREEN]: screenForPathname(Router.pathname),
        [PARAM.DURATION_MS]: duration,
      });
    };

    Router.events.on('routeChangeStart', onStart);
    Router.events.on('routeChangeComplete', onComplete);
    Router.events.on('routeChangeError', onComplete);
    return () => {
      Router.events.off('routeChangeStart', onStart);
      Router.events.off('routeChangeComplete', onComplete);
      Router.events.off('routeChangeError', onComplete);
    };
  }, []);
}
