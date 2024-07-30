// pages/analytics.tsx
import React from "react";
import Logout from "../src/pages/logout/page";
import Head from "next/head";
import { PageProps } from "../src/types/PageProps";

const LogoutPage = ({ session }: PageProps) => {
   


return (
  <>
    <Head>
      <title>Boretec - Logout</title>
    </Head>
    <Logout />
  </>
);
};

export default LogoutPage;