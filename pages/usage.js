import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router, { useRouter } from "next/router";
import firebase from "firebase/compat/app";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import { Tab, Tabs } from "@mui/material";

import styles from "/styles/jss/nextjs-material-kit/pages/usagePage.js";
import UsageOverview from "../pages-sections/usage-sections/UsageOverview";
import PokemonDetail from "../pages-sections/usage-sections/PokemonDetail";
import { track } from "../utils/analytics";
import { EVENT, PARAM, SCREEN } from "../utils/analyticsEvents";
import {
  UsageEmpty, UsageError, UsageForbidden, UsageLoading, UsageSampleBanner,
} from "../pages-sections/usage-sections/UsageStates";
import {
  IS_SAMPLE_DATA, STATUS, useSpeciesUsage, useUsageData,
} from "../pages-sections/usage-sections/useUsageData";
import USAGE_METAS, {
  DEFAULT_USAGE_META, resolveUsageMeta,
} from "../pages-sections/usage-sections/usageMetas";

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "footer",
      ])),
    },
  };
}

const useStyles = makeStyles(styles);

/**
 * Play! Pokemon usage statistics across Dracoviz tournaments.
 *
 * The numbers are precomputed into weekly periods by a script rather than aggregated per request,
 * so this page only ever reads finished weeks and never waits on a heavy query.
 *
 * Both the selected ruleset and the Pokemon being drilled into live in the query string rather than
 * in state, so a link to one ruleset's breakdown of one Pokemon is shareable and the browser's back
 * button does the obvious thing.
 */
export default function Usage() {
  const { t } = useTranslation();
  const router = useRouter();
  const classes = useStyles();
  const [authId, setAuthId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(true);

  const selectedSpecies = typeof router.query.pokemon === "string" ? router.query.pokemon : null;
  // Falls back to the default rather than erroring, so a stale or hand-edited ?meta= still loads.
  const meta = resolveUsageMeta(router.query.meta);

  const {
    status, periods, error, retry, loadOlder, isLoadingMore, hasOlder,
  } = useUsageData(authId, meta);
  const species = useSpeciesUsage(authId, meta, selectedSpecies, periods.length || undefined);

  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        track(EVENT.AUTH_GATE_REDIRECT, { [PARAM.SCREEN]: SCREEN.USAGE });
        Router.push("/login");
        return;
      }
      setAuthId(user.uid);
    });
    return () => unregisterAuthObserver();
  }, []);

  // Shallow routing so navigating within the page never re-runs getServerSideProps. The default
  // ruleset is left out of the query so its URL stays the bare /usage.
  const go = (query) => router.push(
    { pathname: "/usage", query: { ...query, ...(meta === DEFAULT_USAGE_META ? {} : { meta }) } },
    undefined,
    { shallow: true },
  );
  const selectSpecies = (speciesId) => {
    track(EVENT.USAGE_SPECIES_DRILLDOWN, { [PARAM.SPECIES_ID]: speciesId, [PARAM.META]: meta });
    return go({ pokemon: speciesId });
  };
  const clearSpecies = () => go({});

  const selectMeta = (value) => {
    if (value === meta) {
      return undefined;
    }
    track(EVENT.USAGE_META_SWITCHED, { [PARAM.META]: value });
    // The drill-down is dropped on purpose: a Pokemon reported in one ruleset need not clear the
    // bar in the other, and carrying the id across would land on an empty detail view.
    return router.push(
      { pathname: "/usage", query: value === DEFAULT_USAGE_META ? {} : { meta: value } },
      undefined,
      { shallow: true },
    );
  };

  const renderBody = () => {
    if (authId === "" || status === STATUS.LOADING) {
      return <UsageLoading />;
    }
    if (status === STATUS.FORBIDDEN) {
      return <UsageForbidden />;
    }
    if (status === STATUS.ERROR) {
      return <UsageError onRetry={retry} />;
    }
    if (status === STATUS.EMPTY) {
      return <UsageEmpty />;
    }
    if (selectedSpecies != null) {
      return (
        <PokemonDetail
          speciesId={selectedSpecies}
          overviewPeriods={periods}
          status={species.status}
          periods={species.periods}
          onRetry={species.retry}
          onBack={clearSpecies}
        />
      );
    }
    return (
      <UsageOverview
        periods={periods}
        onSelectSpecies={selectSpecies}
        onLoadOlder={loadOlder}
        hasOlder={hasOlder}
        isLoadingMore={isLoadingMore}
      />
    );
  };

  return (
    <div>
      <Header
        absolute
        color="white"
        rightLinks={<HeaderLinks isSignedIn={isSignedIn} />}
      />
      <div className={classes.pageHeader}>
        <div className={classes.main}>
          <GridContainer>
            <GridItem xs={12}>
              <h2>{t("usage_title")}</h2>
              <p className={classes.intro}>{t("usage_description")}</p>
              {IS_SAMPLE_DATA && <UsageSampleBanner />}
              <Tabs
                value={meta}
                onChange={(event, value) => selectMeta(value)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label={t("usage_meta_tabs_label")}
                className={classes.metaTabs}
              >
                {USAGE_METAS.map((option) => (
                  <Tab key={option.value} value={option.value} label={t(option.labelKey)} />
                ))}
              </Tabs>
            </GridItem>
            <GridItem xs={12}>
              {renderBody()}
            </GridItem>
          </GridContainer>
        </div>
        <Footer />
      </div>
    </div>
  );
}
