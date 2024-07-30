// pages/analytics.tsx
import React from "react";
import Legal from "../src/pages/legal/page";
import Head from "next/head";

import { PageProps } from "../src/types/PageProps";

const LegalPage = ({ session }: PageProps) => {
    //console.log(session);
    return (
      <>
        <Head>
          <title>Boretec - Disclaimer</title>
        </Head>
       <Legal />
      </>
    );
  };

export default LegalPage;