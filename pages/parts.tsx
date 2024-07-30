// pages/tasks.tsx
import Parts from "../src/pages/parts/page";
import Head from "next/head";

const PartsPage = () => {
    //console.log(session);


return (
  <>
    <Head>
      <title>Boretec - Parts</title>
    </Head>
    <Parts />
  </>
);
};

export default PartsPage;