// pages/sales.tsx
import React from "react";
import Sales from "../src/pages/sales/page";
import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";

const SalesPage = ({ session }: PageProps) => {
    //console.log(session);
  return session ? <Sales /> : <Login />;
};

export default SalesPage;