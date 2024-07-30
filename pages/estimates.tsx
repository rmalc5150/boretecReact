// pages/analytics.tsx
import React from "react";
import Estimates from "../src/pages/estimates/page";
import Head from "next/head";
import { PageProps } from "../src/types/PageProps";

const EstimatesPage = ({ session }: PageProps) => {
    //console.log(session);
    return (
      <>
        <Head>
          <title>Boretec - Estimates</title>
        </Head>
        <Estimates /> 
      </>
    );
  };

export default EstimatesPage;