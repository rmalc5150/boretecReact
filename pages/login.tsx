// pages/analytics.tsx
import React from "react";

import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";

const LoginPage = ({ session }: PageProps) => {
    //console.log(session);
  return <Login />;
};

export default LoginPage;