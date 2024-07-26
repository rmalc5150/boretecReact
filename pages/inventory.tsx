// pages/inventory.tsx
import React from "react";
import Analytics from "../src/pages/inventory/page";
import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";

const InventoryPage = ({ session }: PageProps) => {
    //console.log(session);
  return session ? <Analytics /> : <Login />;
};

export default InventoryPage;