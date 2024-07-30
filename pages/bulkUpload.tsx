// pages/bulkUpload.tsx
import React from "react";
import BulkUpload from "../src/pages/bulkUpload/page";
import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";
import Head from "next/head";

const BulkUploadPage = ({ session }: PageProps) => {
    //console.log(session);
    return (
      <>
        <Head>
          <title>Boretec - Bulk Upload</title>
        </Head>
        {session ? <BulkUpload /> : <Login />}
      </>
    );
  };

export default BulkUploadPage;