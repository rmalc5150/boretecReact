// pages/analytics.tsx
import React from "react";
import Legal from "../src/pages/legal/page";

import { PageProps } from "../src/types/PageProps";

const LegalPage = ({ session }: PageProps) => {
    //console.log(session);
  return <Legal /> ;
};

export default LegalPage;