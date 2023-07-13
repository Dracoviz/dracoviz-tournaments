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
import React from "react";
import ReactDOM from "react-dom";
import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import Script from "next/script";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/styles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

const firebaseConfig = {
  apiKey: 'AIzaSyBU5gODLafUagZGLtchmIZn0TTW3Foh2EU',
  authDomain: 'dracoviz.firebaseapp.com',
  projectId: 'dracoviz',
  storageBucket: 'dracoviz.appspot.com',
  messagingSenderId: '271724559602',
  appId: '1:271724559602:web:eac85e74445f94fa1a246b',
  measurementId: 'G-28LT7WYJGW',
};

const theme = createTheme();

firebase.initializeApp(firebaseConfig);

import PageChange from "/components/PageChange/PageChange.js";

import "/styles/scss/nextjs-material-kit.scss?v=1.2.0";

Router.events.on("routeChangeStart", (url) => {
  console.log(`Loading: ${url}`);
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

export default class MyApp extends App {
  componentDidMount() {
    let comment = document.createComment(`

=========================================================
* NextJS Material Kit v1.2.1 based on Material Kit Free - v2.0.2 (Bootstrap 4.0.0 Final Edition) and Material Kit React v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-kit
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/nextjs-material-kit/blob/main/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

`);
    document.insertBefore(comment, document.documentElement);
  }
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }
  render() {
    const { Component, pageProps } = this.props;

    return (
      <I18nextProvider i18n={i18n} defaultNS={'translation'}>
        <ThemeProvider theme={theme}>
          <React.Fragment>
            <Head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1, shrink-to-fit=no"
              />
              <title>Dracoviz Tournaments</title>
            </Head>
            <Script src="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&display=swap" />
            <Component {...pageProps} />
          </React.Fragment>
        </ThemeProvider>
      </I18nextProvider>
    );
  }
}
