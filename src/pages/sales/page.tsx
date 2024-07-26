

import SalesTabs from '../../components/sections/salesTabs'
import Menu from '../../components/buttons/menu'
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const Sales = () => {
  const [user, setUser] = useState('');


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


  return (
    <div className={`${user === "bill" && 'bg-gray-300 rounded-sm'} p-2`}>
      <Menu />
      <div className="">
          <div className="flex justify-center items-center w-full py-4">
        <div>
            <a href="/sales"><img src="/logo.png" alt="Logo" className="h-20 w-20 mx-auto"></img></a>
            
        </div>
    </div>
    <SalesTabs />
    </div>
    </div>
  )
}

export default Sales