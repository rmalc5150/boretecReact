// pages/inventory.tsx
import React from "react";
import Inventory from "../src/pages/inventory/page";
import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";
import Head from "next/head";

const InventoryPage = ({ session }: PageProps) => {
    //console.log(session);
    return (
      <>
        <Head>
          <title>Boretec - Inventory</title>
        </Head>
        {session ? <Inventory /> : <Login />}
      </>
    );
  };

export default InventoryPage;