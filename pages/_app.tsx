// pages/_app.tsx
import { useEffect, useState } from "react";
import { AppProps } from "next/app";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../src/supabaseConfig";
import "../src/index.css";



function MyApp({ Component, pageProps }: AppProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user && session.user.email) {
        const userEmail = session.user.email.toString();
        setEmail(userEmail);
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



  return <Component {...pageProps} session={session} loading={loading} />;
}

export default MyApp;