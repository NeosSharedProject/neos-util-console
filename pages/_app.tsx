import React from "react";

import { AppProps } from "next/app";

import dynamic from "next/dynamic";
import AppBarTop from "../src/common/component/AppBarTop";

const App = ({ Component, pageProps }: AppProps) => {
  const SafeHydrate = dynamic(() => import("../src/SafeHydrate"), {
    ssr: false,
  });

  return (
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
  );
};

export default App;
