
//rentalTabs.tsx
import React, { useEffect, useState } from 'react'

import ToRent from '../../components/cards/rentalCards'
import Rented from '../../components/cards/rentedCards'

// Define a type for individual tasks
type Task = {
  id: number;
  name: string;
  checked: boolean;
};

const RentalTabs = () => {
  const [tabToDisplay, setTabToDisplay] = useState("rented")


  // Accept search from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fullUrl = window.location.href;
      if (fullUrl.includes('?')) {
        const tabToDisplay = fullUrl.split('?')[1];
        setTabToDisplay(tabToDisplay);
      }
    }
  }, []);




  return (
    <section className="mt-10">
    <div className="flex text-slate-900 text-center">
      <div className={`flex-grow rounded-lg p-1 cursor-pointer ${tabToDisplay === "rented" ? "bg-white border border-gray-200 ":"bg-gray-100"}`} onClick = {()=>setTabToDisplay('rented')}>Rented</div>
      <div className={`mx-1 flex-grow rounded-lg p-1 cursor-pointer ${tabToDisplay === "available" ? "bg-white border border-gray-200 ":"bg-gray-100"}`} onClick = {()=>setTabToDisplay('available')}>Available</div>
    </div>
    {tabToDisplay === 'rented' && (

      
      <Rented />

      
    )}
    {tabToDisplay === 'available' && (
      <ToRent />
    )}
    
    

    </section>
  )}

export default RentalTabs;
