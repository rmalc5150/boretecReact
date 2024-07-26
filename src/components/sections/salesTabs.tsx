"use client";

import React, { useEffect, useState } from "react";
import { InvokeCommand, type InvokeCommandInput } from "@aws-sdk/client-lambda";
import { lambdaClient } from "../../lib/amazon";
import Invoices from "../../components/sections/invoices";
import Customers from "../../components/sections/customers";
import Estimates from "../../components/sections/estimates";

// Define a type for individual tasks
type Task = {
  id: number;
  name: string;
  checked: boolean;
};

const SalesTabs = () => {
  const [tabToDisplay, setTabToDisplay] = useState("invoices");
  const [outstandingEstimates, setOutstandingEstimates] = useState(0);
  const [searchedTerm, setSearchTerm] = useState('');

  //accept search from URL
  useEffect(() => {
    const fullUrl = window.location.href;

    if (fullUrl.includes("?")) {
      const tabToDisplay = fullUrl.split("?")[1];
      setTabToDisplay(tabToDisplay);
      const searchedTerm = fullUrl.split("?")[2].replace(/\*/g, " ");
      setSearchTerm(searchedTerm);
      
    }
  }, []);

  const fetchOustandingestimates = async () => {
    const params: InvokeCommandInput = {
      FunctionName: "boretec_estimates_outstanding",
      Payload: JSON.stringify({}),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      const payloadString = new TextDecoder().decode(response.Payload);
      const payloadObject = JSON.parse(payloadString);

      if (Array.isArray(payloadObject) && payloadObject.length > 0) {
        setOutstandingEstimates(payloadObject.length);
        setTabToDisplay("estimates");
      }
    } catch (error) {
      console.error("Error fetching estimates", error);
    }
  };
  useEffect(() => {
    fetchOustandingestimates();
  }, []);

  // Render function for alert bubble
  const renderAlertBubble = () => (
    <span className="top-0 right-0 absolute -mt-2 -mr-2 bg-pink-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
      {outstandingEstimates}
    </span>
  );
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
    <section className="">
      <div className="grid grid-cols-3 text-gray-900 text-center gap-1">
        <div
          className={`rounded-lg p-1 cursor-pointer ${
            tabToDisplay === "invoices"
              ? "bg-white border border-gray-200"
              : ''
          }`}
          onClick={() => {setTabToDisplay("invoices"); setSearchTerm('')}}
        >
          Invoices
        </div>
        <div
          className={`rounded-lg p-1 cursor-pointer relative ${
            tabToDisplay === "estimates"
              ? "bg-white border border-gray-200"
              : ''
          }`}
          onClick={() => {setTabToDisplay("estimates"); setSearchTerm('')}}
        >
          Estimates
          {outstandingEstimates > 0 && (
            <span className="absolute top-0 right-0 bg-pink-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center -mt-2 -mr-1">
              {outstandingEstimates}
            </span>
          )}
        </div>
        <div
          className={`rounded-lg p-1 cursor-pointer ${
            tabToDisplay === "customers"
              ? "bg-white border border-gray-200"
              : ''
          }`}
          onClick={() => {setTabToDisplay("customers"); setSearchTerm('')}}
        >
          Customers
        </div>
      </div>
      {tabToDisplay === "invoices" && <Invoices searchedTerm = {searchedTerm}/>}
      {tabToDisplay === "estimates" && <Estimates searchedTerm = {searchedTerm}/>}

      {tabToDisplay === "customers" && <Customers searchedTerm = {searchedTerm}/>}
    </section>
  );
};

export default SalesTabs;
