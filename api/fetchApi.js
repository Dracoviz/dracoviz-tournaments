import { track } from "../utils/analytics";
import { EVENT, PARAM } from "../utils/analyticsEvents";

const API_HOST = process.env.API_HOST;
const API_KEY = process.env.API_KEY;

// Only report latency when it is bad enough to be a real user complaint.
// Emitting an event for every one of the ~38 call sites would roughly double
// hit volume for very little insight.
const SLOW_REQUEST_MS = 3000;

/**
 * `url` is "session/create/", "session/get/?id=abc" etc. Strip the query so the
 * endpoint stays a low-cardinality dimension (and so ids never leak into it).
 */
const toEndpoint = (url) => String(url).split("?")[0];

const fetchApi = (url, method, headers, body) => {
  const endpoint = toEndpoint(url);
  const startedAt = Date.now();

  const onSettled = (response, networkError) => {
    const duration = Date.now() - startedAt;
    if (networkError || !response.ok) {
      track(EVENT.API_ERROR, {
        [PARAM.ENDPOINT]: endpoint,
        [PARAM.DURATION_MS]: duration,
        [PARAM.METHOD]: method,
        [PARAM.ERROR_CODE]: networkError ? "network_error" : `http_${response.status}`,
      });
    } else if (duration >= SLOW_REQUEST_MS) {
      track(EVENT.API_SLOW, {
        [PARAM.ENDPOINT]: endpoint,
        [PARAM.DURATION_MS]: duration,
        [PARAM.METHOD]: method,
      });
    }
  };

  return fetch(`${API_HOST}/${url}`, {
    method,
    headers: {
        "x_authorization": `Basic ${API_KEY}`,
        ...headers,
    },
    body
  }).then((response) => {
    onSettled(response, null);
    return response;
  }, (error) => {
    onSettled(null, error);
    throw error;
  });
}

/**
 * Several API handlers return HTTP 200 with `{ error: "api_*" }` in the body,
 * so the transport-level wrapper above cannot see those failures. Call sites
 * that branch on `newData.error` report them through here.
 *
 * The `api_*` values are i18n keys and are already a clean enum, which makes
 * them ideal `error_code` values.
 */
export const trackApiResult = (endpoint, body, extra = {}) => {
  if (!body || body.error == null) return false;
  track(EVENT.API_ERROR, {
    [PARAM.ENDPOINT]: toEndpoint(endpoint),
    [PARAM.ERROR_CODE]: body.error,
    ...extra,
  });
  return true;
};

export default fetchApi;
