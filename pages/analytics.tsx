// pages/analytics.tsx
import React from "react";
import Analytics from "../src/pages/analytics/page";
import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";

const AnalyticsPage = ({ session }: PageProps) => {
    //console.log(session);
  return session ? <Analytics /> : <Login />;
};

export default AnalyticsPage;