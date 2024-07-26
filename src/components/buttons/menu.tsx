"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
//import { userouter.push } from 'react-router-dom';
import { useRouter } from "next/router";
import { InvokeCommand, type InvokeCommandInput } from "@aws-sdk/client-lambda";
import { lambdaClient } from "../../lib/amazon";

function useAdminCheck() {
  const [admin, setAdmin] = useState(false);
  const [superAdmin, setSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const email = Cookies.get("email");
      if (email) {
        const extractedUsername = email.split("@")[0].toLowerCase();
        setAdmin(
          [
            "bill",
            "randall",
            "rhonda",
            "dave",
            "chad",
            "vitaliy",
            "billie",
            "sam",
            "casey",
          ].includes(extractedUsername)
        );
        setSuperAdmin(
          ["bill", "randall", "rhonda", "billie", "sam", "vitaliy"].includes(
            extractedUsername
          )
        );
      }
    };

    checkAdminStatus();
  }, []);

  return [admin, superAdmin];
}

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [outstandingEstimates, setOutstandingEstimates] = useState(0);
  const [salesAdmin, superAdmin] = useAdminCheck();
  const router = useRouter();
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

      if (Array.isArray(payloadObject)) {
        setOutstandingEstimates(payloadObject.length);
      }
    } catch (error) {
      console.error("Error fetching estimates", error);
    }
  };
  useEffect(() => {
    fetchOustandingestimates();
  }, []);

  useEffect(() => {
    // Function to detect if the device is mobile
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };
    // Set isOpen to true if isMobile returns true
    setMobile(isMobile());
    setIsOpen(!isMobile());
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);



  // Variants for the dropdown menu
  const dropdownVariants = {
    open: { opacity: 1, scale: 1, y: 10 },
    closed: { opacity: 0, scale: 0.95, y: "-5%" },
  };

  // Render function for alert bubble
  const renderAlertBubble = () => (
    <span className="top-1 right-4 absolute -mt-2 -mr-2 bg-pink-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
      {outstandingEstimates}
    </span>
  );

  return (
    <div className="userDropdown text-sm text-gray-800 flex md:justify-between md:mb-10">
      <motion.div
        className="w-full flex flex-wrap md:mr-12 z-10"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={dropdownVariants}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`py-1 px-5 hover:font-medium text-center ${
            !isOpen && "hidden"
          }`}
        >
          <a href="/tasks">Tasks</a>
        </div>
        <div
          className={`py-1 px-5 hover:font-medium text-center ${
            !isOpen && "hidden"
          }`}
        >
          <a href="/inventory">Inventory</a>
        </div>
        {salesAdmin && (
          <div
            className={`py-1 px-5 hover:font-medium text-center ${
              !isOpen && "hidden"
            }`}
          >
            <a href="/sales" className="flex">
              Sales
              {outstandingEstimates > 0 && renderAlertBubble()}
            </a>
          </div>
        )}
        {superAdmin && (
          <div
            className={`py-1 px-5 hover:font-medium text-center ${
              !isOpen && "hidden"
            }`}
          >
            <a href="/analytics">Analytics</a>
          </div>
        )}
        <div
          className={`py-1 px-5 hover:font-medium text-center ${
            !isOpen && "hidden"
          }`}
        >
          <a href="/logout">Logout</a>
        </div>
      </motion.div>

      {mobile && (
        <div
          className="flex items-center justify-end cursor-pointer px-2 py-4"
          onClick={toggleDropdown}
        >
          {!isOpen && <div className="rounded-md h-1 w-1 bg-gray-700"></div>}
          

          {/*<svg viewBox="0 0 100 80" width="50" height="50" fill="currentColor">
          {!isOpen && <rect x="10" width="40" height="5"></rect>}
          {!isOpen && <div className="rounded-full h-6 w-6"></div>}
          {isOpen && <rect x="45" width="5" height="40"></rect>}
        </svg>*/}
        </div>
      )}
    </div>
  );
};

export default Menu;
