

import SalesTabs from '../../components/sections/salesTabs'
import Menu from '../../components/buttons/menu'
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const Sales = () => {
  const [user, setUser] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkCookies = async () => {
      const email = Cookies.get("email");
      if (email) {
        const extractedUsername = email.split("@")[0].toLowerCase();
        setUser(extractedUsername)
      }
    }

    checkCookies();
  }, []);

const refreshPage = () =>{
  router.reload();
}

  return (
    <div className={`${user === "bill" && 'bg-gray-300 rounded-sm'}`}>
      <Menu />
      <div className="">
          <div className="flex justify-center items-center w-full py-4">
        <div>
            <div className="cursor-pointer" onClick={refreshPage}><img src="/logo.png" alt="Logo" className="h-20 w-20 mx-auto"></img></div>
            
        </div>
    </div>
    <SalesTabs />
    </div>
    </div>
  )
}

export default Sales