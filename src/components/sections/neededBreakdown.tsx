'use client'

import React, { useEffect, useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import ToOrderCardEditable from '../../components/cards/ToOrderCardEditable'





interface Item {

  partNumber: string
  images: string
  location: string

}

const Breakdowns = () => {
  const [neededBreakdowns, setNeededBreakdowns] = useState<Item[]>([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [waitingForCards, setWaitingForCards] = useState(true);



  const fetchItems = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_breakdownsheets_needed',
      Payload: JSON.stringify({}),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      const payloadString = new TextDecoder().decode(response.Payload);
      const payloadObject = JSON.parse(payloadString);
      if (payloadObject.length >= 0){
        setWaitingForCards(false)
      }
      setNeededBreakdowns(payloadObject); // Assuming the payload contains the array of items
    } catch (error) {
      console.error('Error fetching inventory items', error);
      console.log(error)
    }
  };



  useEffect(() => {
    fetchItems();
  }, []);

    

  return (
    <section className="my-5">
 
      <h1>Needed Breakdown Sheets:</h1>


      

      {!waitingForCards && neededBreakdowns.length === 0 && (<p className="w-full p-2 font-light">No breakown sheets.</p>)}
      {waitingForCards && (<div className="w-full py-10 flex justify-center items-center font-light">
        <p className="animate-pulse">Loading...</p>
      </div>)}
      <div className="flex flex-wrap">
      {
          neededBreakdowns.map((item) => (
            <div key={item.partNumber} className={`px-2 mb-4 w-full md:w-1/2 lg:w-1/3`}>
              <a href={`/inventory?${item.partNumber.toLowerCase()}`}>
                <div className="rounded-lg bg-white border border-gray-200 flex justify-start items-center overflow-hidden">
                <img className="h-20" src={item.images} /> 
                <p className='pl-2'>{item.partNumber} @ {item.location}</p>
                </div>
                </a>
            </div>
          ))
        }
      </div>
  
      
    </section>
  )
}

export default Breakdowns;
