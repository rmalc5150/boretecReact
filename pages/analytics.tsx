// pages/analytics.tsx
import React from "react";
import Analytics from "../src/pages/analytics/page";
import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";
import Head from "next/head";

const AnalyticsPage = ({ session }: PageProps) => {
    //console.log(session);
    return (
      <>
        <Head>
          <title>Boretec - Analytics</title>
        </Head>
        {session ? <Analytics /> : <Login />}
      </>
    );
  };

export default AnalyticsPage;