'use client'

import React, { useEffect, useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import ToOrderCardEditable from '../../components/cards/ToOrderCardEditable'
import ToOrderSelectAll from '../forms/ToOrderSelectAll'
import Cookies from 'js-cookie'

function useAdminCheck() {
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      const email = Cookies.get('email')
      if (email) {
        const extractedUsername = email.split('@')[0].toLowerCase()

        setAdmin(['bill', 'randall', 'rhonda', 'dave', 'chad', 'vitaliy', 'sam'].includes(extractedUsername))
      }
    }

    checkAdminStatus()
  }, [])

  return admin
}

interface Vendor {
  vName: string
  vUrl: string
  vPartNumber: string
  vLeadTime: number
  vCost: number
  vPaymentMethod: string
}

interface toOrderItem {
  vendors: string
  quantity: number
  editor: string
  status: string
  imageUrl: string
  partNumber: string
  internalDescription: string
  dateEdited: string
  partLocation: string
  dateCreated: string
  dateOrdered: string
  manufacturer: string
  manufactPartNum: string
  PoNumber: string
  paymentMethod: string
  cost: number
  vendorUsed: string
  leadTime: number
  dateNeeded: string
  origin: string
  id: number
}

const ToOrder = () => {
  const [toOrderItems, setToOrderItems] = useState<toOrderItem[]>([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [waitingForCards, setWaitingForCards] = useState(true);
  const admin = useAdminCheck()


  const fetchToOrderItems = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_fetch_toOrder',
      Payload: JSON.stringify({}),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      //console.log(response);
      const payloadString = new TextDecoder().decode(response.Payload);
      //console.log(payloadString)
      const payloadObject = JSON.parse(payloadString);
      //console.log(payloadObject);
      if (payloadObject.length >= 0){
        setWaitingForCards(false)
      }
      setToOrderItems(payloadObject); // Assuming the payload contains the array of items
    } catch (error) {
      console.error('Error fetching inventory items', error);
      console.log(error)
    }
  };



  useEffect(() => {
    fetchToOrderItems();
  }, []);

    

  return (
    <section className="my-5">
      <div className={`${admin ? "flex justify-end":""}`}>

      {admin && <button className="text-xs font-light text-gray-600 mb-1 mx-2" onClick={()=>setShowAllOrders(!showAllOrders)}>{showAllOrders ? "Hide All": "Show All"}</button>}
      </div>
      {admin && showAllOrders && <div className="my-2"><ToOrderSelectAll /></div>}
      

      {!waitingForCards && toOrderItems.length === 0 && (<p className="w-full p-2 font-light">No pending Orders.</p>)}
      {waitingForCards && (<div className="w-full py-10 flex justify-center items-center font-light">
        <p className="animate-pulse">Loading...</p>
      </div>)}
      <div className="flex flex-wrap">
      {
          toOrderItems.map((item) => (
            <div key={item.dateCreated} className={`p-2 mb-4 w-full md:w-1/2 lg:w-1/3`}>
            <ToOrderCardEditable  
              status={item.status}
              PoNumber={item.PoNumber}
              manufacturer={item.manufacturer}
              manufactPartNum={item.manufactPartNum}
              quantity={item.quantity}
              partNumber={item.partNumber}
              imageUrl={item.imageUrl}
              vendorUsed={item.vendorUsed}
              dateCreated={item.dateCreated}
              dateNeeded={item.dateNeeded}
              leadTime={item.leadTime}
              paymentMethod={item.paymentMethod}
              internalDescription={item.internalDescription}
              vendors={JSON.stringify(item.vendors)}
              partLocation={item.partLocation}
              cost={item.cost}
              dateEdited={item.dateEdited}
              dateOrdered={item.dateOrdered}
              origin={item.origin}
              id={item.id}
            />
            </div>
          ))
        }
      </div>
  
      
    </section>
  )
}

export default ToOrder;
