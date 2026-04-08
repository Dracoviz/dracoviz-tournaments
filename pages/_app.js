/*!

=========================================================
* NextJS Material Kit v1.2.1 based on Material Kit Free - v2.0.2 (Bootstrap 4.0.0 Final Edition) and Material Kit React v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-kit
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/nextjs-material-kit/blob/main/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import ColorModeContext from "../utils/ColorModeContext";
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/styles';
import { appWithTranslation } from 'next-i18next';
import { setCookie, getCookie } from 'cookies-next';
import { ThemeProvider as Emotion10ThemeProvider } from '@emotion/react';

const firebaseConfig = {
  apiKey: 'AIzaSyBU5gODLafUagZGLtchmIZn0TTW3Foh2EU',
  authDomain: 'dracoviz.firebaseapp.com',
  projectId: 'dracoviz',
  storageBucket: 'dracoviz.appspot.com',
  messagingSenderId: '271724559602',
  appId: '1:271724559602:web:eac85e74445f94fa1a246b',
  measurementId: 'G-28LT7WYJGW',
};

firebase.initializeApp(firebaseConfig);

import PageChange from "/components/PageChange/PageChange.js";

import "/styles/scss/nextjs-material-kit.scss?v=1.2.0";

Router.events.on("routeChangeStart", (url) => {
  document.body.classList.add("body-page-transition");
  ReactDOM.render(
    <PageChange path={url} />,
    document.getElementById("page-transition")
  );
});
Router.events.on("routeChangeComplete", () => {
  ReactDOM.unmountComponentAtNode(document.getElementById("page-transition"));
  document.body.classList.remove("body-page-transition");
});
Router.events.on("routeChangeError", () => {
  ReactDOM.unmountComponentAtNode(document.getElementById("page-transition"));
  document.body.classList.remove("body-page-transition");
});

export const getDesignTokens = (mode) => ({ palette: { mode } });

function MyApp({ Component, pageProps }) {
  const [mode, setMode] = React.useState("dark");

  useEffect(() => {
    const nextTheme = getCookie("NEXT_THEME") ?? "dark";
    if (nextTheme === 'dark') {
      document.querySelector("body").classList.add("dark-theme");
    } else {
      document.querySelector("body").classList.remove("dark-theme");
    }
    setMode(nextTheme);
  }, []);

  const colorMode = React.useMemo(
    () => ({
      // The dark mode switch would invoke this method
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextTheme = prevMode === 'light' ? 'dark' : 'light';
          if (nextTheme === 'dark') {
            document.querySelector("body").classList.add("dark-theme");
          } else {
            document.querySelector("body").classList.remove("dark-theme");
          }
          setCookie("NEXT_THEME", nextTheme);
          return nextTheme;
        });
      },
    }),
    [],
  );

  // Update the theme only if the mode changes
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  return (
    <ColorModeContext.Provider value={colorMode}>
      <Emotion10ThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <React.Fragment>
            <Head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no"
              />
              <title>Dracoviz Tournaments</title>
            </Head>
            <Component {...pageProps} />
          </React.Fragment>
        </ThemeProvider>
      </Emotion10ThemeProvider>
    </ColorModeContext.Provider>
  );
}

MyApp.getInitialProps = async ({ Component, router, ctx }) => {
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return { pageProps };
}

export default appWithTranslation(MyApp); 
