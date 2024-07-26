// pages/analytics.tsx
import React from "react";
import Logout from "../src/pages/logout/page";
//import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";

const LogoutPage = ({ session }: PageProps) => {
    //console.log(session);
  return <Logout />;
};

export default LogoutPage;