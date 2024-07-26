import React, { useEffect } from 'react';
import { supabase } from '../../supabaseConfig';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from "next/router";
import Cookies from 'js-cookie';

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.email) {
        Cookies.set('email', session.user.email);
        //router.push('/');
      }
    };

    checkUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);
  return (
    <div>

    
    <div className="h-[50vh] flex justify-center items-center p-2 m-5 md:m-10">
      <div className="w-full lg:w-1/2">
        <div className="flex items-center justify-center">
          <img
            src="/icons/boretec_black_512x512.png"
            alt="logo"
            className="h-20"
          />
          <p className="font-light text-sky-100 ml-2"></p>
        </div>
        <div className="w-full">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#000",
                    brandAccent: "#000",
                    brandButtonText: "#fff",
                    inputLabelText: "#000",
                    inputText: "#000",
                    inputBorderFocus: "#000",
                    inputBorder: "#000",
                  },
                  fontSizes: {
                    baseInputSize: "16px",
                  }                            
                },
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: "",
                  password_label: "",
                  email_input_placeholder: "email",
                  password_input_placeholder: "password",
                },
              },
            }}
            showLinks={false}
            providers={[]}
          />
        </div>
        <div>
      
    </div>
      </div>
    </div>
    </div>
  );
};

export default Login;