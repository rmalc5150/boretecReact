

import TaskTabs from '../../components/sections/taskTabs'
import Breakdowns from '../../components/sections/neededBreakdown';
import Menu from '../../components/buttons/menu'
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const Home = () => {
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
          <div className="flex justify-center items-center w-full pt-2">
        <div>
            <a href="./main"><img src="/logo.png" alt="Logo" className="h-20 w-20 mx-auto"></img></a>
            
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
