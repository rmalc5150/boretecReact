

import TaskTabs from '../../components/sections/taskTabs'
import Breakdowns from '../../components/sections/neededBreakdown';
import Menu from '../../components/buttons/menu'
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const Home = () => {
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
          <div className="flex justify-center items-center w-full pt-2">
        <div>
        <div className="cursor-pointer" onClick={refreshPage}><img src="/logo.png" alt="Logo" className="h-20 w-20 mx-auto"></img></div>
            
        </div>
    </div>
      <TaskTabs />
      {/*<ToShipCards />}
      
          <ToBuildCards />
          <ToOrderCards />*/}
          {<Breakdowns />}
        
      

    </div>
  )
}

export default Home
