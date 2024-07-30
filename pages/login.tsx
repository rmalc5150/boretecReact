// pages/analytics.tsx
import React from "react";
import Head from "next/head";
import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";

const LoginPage = ({ session }: PageProps) => {
    //console.log(session);
    return (
      <>
        <Head>
          <title>Boretec - Login</title>
        </Head>
        <Login />
      </>
    );
    };

export default LoginPage;