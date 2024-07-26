// pages/analytics.tsx
import React from "react";
import Estimates from "../src/pages/estimates/page";
//import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";

const EstimatesPage = ({ session }: PageProps) => {
    //console.log(session);
  return <Estimates />;
};

export default EstimatesPage;