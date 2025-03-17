import React, { useCallback, useEffect, useState, useContext } from "react";
import { makeStyles } from "@mui/styles";
import Router, { useRouter } from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import ProfilePreview from "../pages-sections/home-sections/ProfilePreview";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import fetchApi from "../api/fetchApi.js";
import { useTranslation } from 'next-i18next';

import styles from "/styles/jss/nextjs-material-kit/pages/homePage.js";
import { Button, CircularProgress, Tab, Tabs } from "@mui/material";
import TournamentList from "../pages-sections/home-sections/TournamentList";
import ProfileEditModal from "../pages-sections/home-sections/ProfileEditModal";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import LocaleSelect from "../components/LocaleSelect/LocaleSelect";

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'footer',
      ])),
      // Will be passed to the page component as props
    },
  }
}

const useStyles = makeStyles(styles);

export default function Index() {
  const { t } = useTranslation();
  const [authId, setAuthId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [currentModal, setCurrentModal] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const router = useRouter();
  const { query } = router;
  const { isNewUser } = query;

  const goToRoute = (route) => {
    router.push(route);
  }

  const getSharedData = useCallback((id) => {
    setAuthId(id);
    fetchApi("shared/get/", "GET", {
      x_session_id: id,
    })
    .then(response => response.json())
    .then(newData => {
      setData(newData)
      if (isNewUser === "true") {
        router.replace('/', undefined, { shallow: true });
        setCurrentModal("profile");
      }
    });
  }, [])

  const getShowMore = () => {
    setIsLoading(true)
    fetchApi("shared/get/?getAll=true", "GET", {
      x_session_id: authId,
    })
    .then(response => response.json())
    .then(newData => {
      setData(newData)
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
  }

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        Router.push("/login");
      } else {
        getSharedData(user.uid);
      }
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const onEditProfile = () => {
    setCurrentModal("profile");
  }

  const onSaveProfile = async (data) => {
    try {
      const response = await fetchApi(
        "shared/edit-profile/", "POST",
        { x_session_id: authId, "Content-Type": "application/json" },
        JSON.stringify(data)
      );
      const newData = await response.json();
      const { error } = newData;
      if (error) {
        alert(t(error))
      } else {
        closeModal();
        setData(null);
        getSharedData(authId);
      }
    } catch {
      closeModal();
    }
  }

  const closeModal = () => {
    setCurrentModal(null);
  }

  const handleChange = (_event, newTab) => {
    setCurrentTab(newTab);
  };

  const renderProfile = () => {
    const { description, name, avatar } = data;
    return (
      <ProfilePreview
        description={description}
        username={name}
        imageUrl={avatar}
        onClick={onEditProfile}
      />
    )
  }

  const renderTournaments = useCallback(() => {
    const { sessions } = data;
    const isConcludedTab = currentTab === 1;
    const listItems = sessions?.filter((s) => (s.concluded ?? false) === isConcludedTab);
    return (
      <TournamentList sessions={listItems} />
    )
  }, [currentTab, data]);

  const renderCollections = useCallback(() => {
    const { collections } = data;
    if (collections == null || collections.length <= 0) {
      return (
        <div>{t("no_collections")}</div>
      )
    }
    return collections.map((d) => (
      <div>{JSON.stringify(d)}</div>
    ));
  }, [data]);

  const renderEditProfileModal = () => {
    return (
      <ProfileEditModal 
        open={currentModal === "profile"}
        onClose={closeModal}
        player={data}
        onSave={onSaveProfile}
      />
    )
  }

  const classes = useStyles();

  return (
    <div>
      <Header
        absolute
        color="white"
        rightLinks={<HeaderLinks isSignedIn={isSignedIn} />}
      />
      <div className={classes.pageHeader}>
        <div className={classes.main}>
          {renderEditProfileModal()}
          <GridContainer>
            {
              data == null ? (
                <CircularProgress />
              ) : (
                <>
                  <GridItem xs={12}>
                    {renderProfile()}
                  </GridItem>
                  <GridItem xs={12}>
                    <LocaleSelect />
                  </GridItem>
                  <GridItem xs={12}>
                    <div className="tournament-head">
                      <h3>{t("your_tournaments")}</h3>
                      <div>
                        <Button color="primary" variant="contained" style={{ marginRight: 20, marginBottom: 10 }} onClick={() => goToRoute("/join-tournament")}>
                          {t("join_a_tournament")}
                        </Button>
                        <Button color="primary" variant="outlined" style={{ marginBottom: 10 }} onClick={() => goToRoute("/create-tournament")}>
                          {t("create_a_tournament")}
                        </Button>
                      </div>
                    </div>
                  </GridItem>
                  <GridItem xs={12}>
                    <Tabs value={currentTab} onChange={handleChange} aria-label="tournaments tabs">
                      <Tab
                        label={t("tab_active")}
                        id="active-tab"
                        aria-controls="simple-tabpanel-0"
                      />
                      <Tab
                        label={t("tab_concluded")}
                        id="concluded-tab"
                        aria-controls="simple-tabpanel-1"
                      />
                    </Tabs>
                  </GridItem>
                  <GridItem xs={12}>
                    {renderTournaments()}
                    {
                      data.isNotAll && <Button onClick={getShowMore} disabled={isLoading}>
                        {t('show_all')}
                      </Button>
                    }
                  </GridItem>
                  {/* <GridItem xs={12}>
                    <div className="tournament-head">
                      <h3>{t("your_collections")}</h3>
                      <div>
                        <Button color="primary" variant="contained" style={{ marginBottom: 10 }} onClick={() => goToRoute("/create-collection")}>
                          {t("create_a_collection")}
                        </Button>
                      </div>
                    </div>
                  </GridItem>
                  <GridItem xs={12}>
                    {renderCollections()}
                  </GridItem> */}
                </>
              )
            }
          </GridContainer>
        </div>
        <Footer />
      </div>
    </div>
  );
}
