import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Cookies from "js-cookie";

import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseConfig";
import Login from "./pages/login/page";
import Logout from "./pages/logout/page";
import Tasks from "./pages/tasks/page";
import Sales from "./pages/sales/page";
import Estimates from "./pages/estimates/page";
import Rentals from "./pages/rentals/page";
import Parts from "./pages/parts/page";
import Inventory from "./pages/inventory/page";
import BulkUpload from "./pages/bulkUpload/page";
import Analytics from "./pages/analytics/page";
import Legal from "./pages/legal/page";

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  //const [disclaimer, setDisclaimer] = useState(true);
  //const [user, setUser] = useState("");

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {


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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error);
    } else {
      setSession(null);
      console.log("logged out");
    }
  };

  return (

    <Router>
      <Routes>
        <Route path="/" element={session ? <Tasks /> : <Login />} />
        <Route path="/tasks" element={session ? <Tasks /> : <Login />} />
        <Route
          path="/analytics"
          element={session ? <Analytics /> : <Login />}
        />
        <Route
          path="/bulkUpload"
          element={session ? <BulkUpload /> : <Login />}
        />
        <Route path="/estimates" element={<Estimates />} />
  

        <Route path="/legal" element={<Legal />} />
        <Route
          path="/inventory"
          element={session ? <Inventory /> : <Login />}
        />
        <Route path="/rentals" element={session ? <Rentals /> : <Login />} />

        <Route path="/sales" element={session ? <Sales /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/parts" element={<Parts />} />
      </Routes>
    </Router>

  );
};

export default App;
