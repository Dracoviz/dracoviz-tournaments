import { useCallback, useEffect, useState } from "react";
import fetchApi from "../../api/fetchApi";

/**
 * The data layer for the usage page.
 *
 * `SOURCE` is the seam between the generated fixture the page was built against and the live API.
 * Both sides return exactly the same shape, so flipping it is the only change needed to go live.
 *
 * Errors are returned as state rather than alert()ed the way the tournament pages do it, because
 * this is a read-only data page: an inline message with a retry button is far more useful here than
 * a modal dialog that leaves a blank screen behind it.
 */
const SOURCE = "sample";

/**
 * Whether the page is showing the generated fixture rather than real tournament results.
 *
 * The banner that says so is driven by this, so it disappears on its own the moment SOURCE
 * flips to "api" — there is no second place to remember to update, and no way to ship a page
 * that presents made-up numbers as real ones.
 */
export const IS_SAMPLE_DATA = SOURCE === "sample";

/** How many periods are fetched at a time. The API clamps this too; it will never return more. */
export const PAGE_SIZE = 6;

/**
 * Status values the page renders distinct screens for. `forbidden` is deliberately separate from
 * `error`: the caller is a real signed-in user who simply has not played recently, and the page
 * explains how to unlock the data instead of showing a failure.
 */
export const STATUS = {
  LOADING: "loading",
  READY: "ready",
  EMPTY: "empty",
  ERROR: "error",
  FORBIDDEN: "forbidden",
};

/** Simulated latency in sample mode, so loading states are actually visible while building. */
const SAMPLE_DELAY_MS = 250;

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

async function loadSampleOverview({ limit, before }) {
  const { default: sample } = await import("./sampleUsage.json");
  await wait(SAMPLE_DELAY_MS);
  const periods = sample.periods
    .filter((p) => before == null || p.periodIndex < before)
    .slice(0, limit);
  return { meta: sample.meta, periods, availablePeriods: sample.availablePeriods };
}

async function loadSampleSpecies({ speciesId, limit, before }) {
  // Only pulled in on a drill-down, so the overview never pays for the moveset and partner data.
  const { default: sample } = await import("./sampleUsageSpecies.json");
  await wait(SAMPLE_DELAY_MS);
  const periods = sample.species
    .filter((s) => s.speciesId === speciesId)
    .filter((s) => before == null || s.periodIndex < before)
    .sort((a, b) => b.periodIndex - a.periodIndex)
    .slice(0, limit);
  return { meta: sample.meta, speciesId, periods };
}

/**
 * Turns a fetch into either data or a status. A 403 is the eligibility gate rather than a failure,
 * so it gets its own status; everything else, including a network error, is just an error.
 */
async function callApi(url, authId) {
  let response;
  try {
    response = await fetchApi(url, "GET", { x_session_id: authId });
  } catch (ex) {
    throw Object.assign(new Error("api_usage_unavailable"), { status: STATUS.ERROR });
  }
  if (response.status === 403) {
    throw Object.assign(new Error("api_usage_not_eligible"), { status: STATUS.FORBIDDEN });
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || data == null || data.error != null) {
    throw Object.assign(
      new Error(data?.error ?? "api_usage_unavailable"),
      { status: STATUS.ERROR },
    );
  }
  return data;
}

function loadOverview({ authId, limit, before }) {
  if (SOURCE === "sample") {
    return loadSampleOverview({ limit, before });
  }
  const query = new URLSearchParams({ limit: String(limit) });
  if (before != null) query.set("before", String(before));
  return callApi(`usage/get/?${query}`, authId);
}

function loadSpecies({ authId, speciesId, limit, before }) {
  if (SOURCE === "sample") {
    return loadSampleSpecies({ speciesId, limit, before });
  }
  const query = new URLSearchParams({ speciesId, limit: String(limit) });
  if (before != null) query.set("before", String(before));
  return callApi(`usage/species/?${query}`, authId);
}

function toStatus(ex) {
  return ex?.status === STATUS.FORBIDDEN ? STATUS.FORBIDDEN : STATUS.ERROR;
}

/**
 * The usage overview: the most recent periods, newest first, with "load older" paging.
 *
 * Waits for `authId` before fetching, since every usage endpoint is gated on who is asking.
 */
export function useUsageData(authId) {
  const [state, setState] = useState({
    status: STATUS.LOADING, periods: [], availablePeriods: null, error: null,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authId == null || authId === "") {
      return undefined;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, status: STATUS.LOADING, error: null }));

    loadOverview({ authId, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setState({
          status: data.periods.length > 0 ? STATUS.READY : STATUS.EMPTY,
          periods: data.periods,
          availablePeriods: data.availablePeriods ?? null,
          error: null,
        });
      })
      .catch((ex) => {
        if (cancelled) return;
        setState({
          status: toStatus(ex), periods: [], availablePeriods: null, error: ex.message,
        });
      });

    return () => { cancelled = true; };
  }, [authId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const loadOlder = useCallback(() => {
    const oldest = state.periods[state.periods.length - 1];
    if (oldest == null || isLoadingMore) {
      return;
    }
    setIsLoadingMore(true);
    loadOverview({ authId, limit: PAGE_SIZE, before: oldest.periodIndex })
      .then((data) => setState((prev) => ({
        ...prev,
        // De-duplicated in case a period was published between the two calls.
        periods: [
          ...prev.periods,
          ...data.periods.filter(
            (p) => !prev.periods.some((existing) => existing.periodIndex === p.periodIndex),
          ),
        ],
      })))
      // A failed "load older" leaves what is already on screen alone; only the button resets.
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  }, [authId, state.periods, isLoadingMore]);

  const oldestLoaded = state.periods[state.periods.length - 1]?.periodIndex ?? null;
  const hasOlder = state.availablePeriods?.oldestIndex != null
    && oldestLoaded != null
    && state.availablePeriods.oldestIndex < oldestLoaded;

  return { ...state, retry, loadOlder, isLoadingMore, hasOlder };
}

/**
 * One species across the periods it qualified in.
 *
 * A period missing from `periods` does not mean there was no data that period: it means the species
 * did not clear the occurrence threshold. The caller tells the two apart by comparing against the
 * overview's period list, which is why this hook does not try to fill the gaps itself.
 */
export function useSpeciesUsage(authId, speciesId, limit = PAGE_SIZE) {
  const [state, setState] = useState({ status: STATUS.LOADING, periods: [], error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authId == null || authId === "" || speciesId == null) {
      return undefined;
    }
    let cancelled = false;
    setState({ status: STATUS.LOADING, periods: [], error: null });

    loadSpecies({ authId, speciesId, limit })
      .then((data) => {
        if (cancelled) return;
        setState({
          status: data.periods.length > 0 ? STATUS.READY : STATUS.EMPTY,
          periods: data.periods,
          error: null,
        });
      })
      .catch((ex) => {
        if (cancelled) return;
        setState({ status: toStatus(ex), periods: [], error: ex.message });
      });

    return () => { cancelled = true; };
  }, [authId, speciesId, limit, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
