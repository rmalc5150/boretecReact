// pages/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../src/supabaseConfig";
import { Session } from "@supabase/supabase-js";
import { PageProps } from "../src/types/PageProps";

const HomePage = ({ session }: PageProps) => {
  const router = useRouter();

  useEffect(() => {
   
      if (session) {
        router.push("/tasks");
      } else {
        router.push("/login");
      }
    
  }, [session, router]);



  return null; // or a landing page if you want something here before redirect
};

export default HomePage;

/*import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Cookies from "js-cookie";

import { Session } from "@supabase/supabase-js";
import { supabase } from "../src/supabaseConfig";
import Login from "./login/page";
import Logout from "./logout/page";
import Tasks from "./main/page";
import Sales from "../src/pages/sales/page";
import Estimates from "./estimates/page";
import Rentals from "./rentals/page";
import Parts from "./parts/page";
import Inventory from "./inventory/page";
import BulkUpload from "./bulkUpload/page";
import Analytics from "./analytics/page";
import Legal from "./legal/page";

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [disclaimer, setDisclaimer] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user && session.user.email) {
        const userEmail = session.user.email.toString();
        setEmail(userEmail);
        //console.log(userEmail);
      }

      setLoading(false);
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
      setLoading(false); // Ensure loading is set to false when the component unmounts
    };
  }, []);



  return (
    <Sales />

  );
};

export default App;*/
