'use client'

import React, { useEffect, useState } from 'react'

import ToShip from './toShip'
import ToBuild from './toBuild'
import ToOrder from './toOrder'

// Define a type for individual tasks
type Task = {
  id: number;
  name: string;
  checked: boolean;
};

const SalesTabs = () => {
  const [tabToDisplay, setTabToDisplay] = useState("shipping")


  //accept search from URL
  useEffect(() => {
    const fullUrl = window.location.href;
  
    if (fullUrl.includes('?')){
      const tabToDisplay = fullUrl.split('?')[1];
      setTabToDisplay(tabToDisplay)

    }
  },[]);
 const fetchOustandingestimates = async () => {
   

/*
      if (Array.isArray(payloadObject) && payloadObject.length > 0) {
        setOutstandingEstimates(payloadObject.length);
        setTabToDisplay('estimates');
        }*/

  

  };

  useEffect(() => {
    fetchOustandingestimates();
  }, []); 

  


/*

  useEffect(() => {
    fetchToBuildItems();
  }, []);



  const fetchToBuildItems = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_toShip_select_all',
      Payload: JSON.stringify({}),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      const payloadString = new TextDecoder().decode(response.Payload);
      const payloadObject = JSON.parse(payloadString);
      setToShipItems(payloadObject); // Assuming the payload contains the array of items
    } catch (error) {
      console.error('Error fetching inventory items', error);
    }
  };



      */
    
//customer card


  return (
    <section className="mt-5">
    <div className="flex text-center">
      <div className={`flex-grow rounded-lg p-1 cursor-pointer ${tabToDisplay === "shipping" ? "bg-white border border-gray-200 text-gray-900":''}`} onClick = {()=>setTabToDisplay('shipping')}>Shipping</div>
      <div className={`mx-1 flex-grow rounded-lg p-1 cursor-pointer ${tabToDisplay === "build" ? "bg-white border border-gray-200 text-gray-900":''}`} onClick = {()=>setTabToDisplay('build')}>Manufacturing</div>
      <div className={`flex-grow rounded-lg p-1 cursor-pointer ${tabToDisplay === "order" ? "bg-white border border-gray-200 text-gray-900":''}`} onClick = {()=>setTabToDisplay('order')}>Ordering</div>
    </div>
    {tabToDisplay === 'shipping' && (

      
      <ToShip />

      
    )}
    {tabToDisplay === 'build' && (
      <ToBuild />
    )}
    
    
    {tabToDisplay==="order" && (
  
  <ToOrder />
)}
    </section>
  )}

export default SalesTabs;
