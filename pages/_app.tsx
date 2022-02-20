import React from "react";
import Head from "next/head";

import { AppProps } from "next/app";

import dynamic from "next/dynamic";
import AppBarTop from "../src/common/component/AppBarTop";

const App = ({ Component, pageProps }: AppProps) => {
  const SafeHydrate = dynamic(() => import("../src/SafeHydrate"), {
    ssr: false,
  });

  return (
    <>
      <Head>
        <title>Neos Util Console</title>
        <meta property="og:title" content="Neos Util Console" />
        <meta
          property="og:description"
          content="This site provides useful functions related to NeosVR."
        />
      </Head>
      <SafeHydrate>
        <AppBarTop />
        <Component {...pageProps} />
        <style jsx global>{`
          html,
          body {
            padding: 0;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
              Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
              sans-serif;
          }

          * {
            box-sizing: border-box;
          }
        `}</style>
      </SafeHydrate>
    </>
  );
};

export default App;
