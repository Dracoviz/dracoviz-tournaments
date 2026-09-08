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

import styles from "/styles/jss/nextjs-material-kit/pages/usagePage.js";
import UsageOverview from "../pages-sections/usage-sections/UsageOverview";
import PokemonDetail from "../pages-sections/usage-sections/PokemonDetail";
import {
  UsageEmpty, UsageError, UsageForbidden, UsageLoading, UsageSampleBanner,
} from "../pages-sections/usage-sections/UsageStates";
import {
  IS_SAMPLE_DATA, STATUS, useSpeciesUsage, useUsageData,
} from "../pages-sections/usage-sections/useUsageData";

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
 * The numbers are precomputed into two-week periods by a script rather than aggregated per request,
 * so this page only ever reads finished periods and never waits on a heavy query.
 *
 * The Pokemon being drilled into lives in the query string rather than in state, so a link to one
 * Pokemon's breakdown is shareable and the browser's back button does the obvious thing.
 */
export default function Usage() {
  const { t } = useTranslation();
  const router = useRouter();
  const classes = useStyles();
  const [authId, setAuthId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(true);

  const selectedSpecies = typeof router.query.pokemon === "string" ? router.query.pokemon : null;

  const {
    status, periods, error, retry, loadOlder, isLoadingMore, hasOlder,
  } = useUsageData(authId);
  const species = useSpeciesUsage(authId, selectedSpecies, periods.length || undefined);

  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        Router.push("/login");
        return;
      }
      setAuthId(user.uid);
    });
    return () => unregisterAuthObserver();
  }, []);

  // Shallow routing so switching Pokemon never re-runs getServerSideProps.
  const selectSpecies = (speciesId) => router.push(
    { pathname: "/usage", query: { pokemon: speciesId } },
    undefined,
    { shallow: true },
  );
  const clearSpecies = () => router.push({ pathname: "/usage" }, undefined, { shallow: true });

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
