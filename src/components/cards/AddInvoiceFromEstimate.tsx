import React, { useState, useEffect } from "react";
import { InvokeCommand, type InvokeCommandInput } from "@aws-sdk/client-lambda";
import { lambdaClient } from "../../lib/amazon";
import InventorySearch from "../modals/inventorySearchEstimate2Invoice";
import CustomerSearch, { CustomerCard } from "../modals/customersSearch";
import Cookies from "js-cookie";
import DatePicker from "react-datepicker";
import { useRouter } from "next/router";
import { fetchAccessToken } from "../tokenFunctions";

interface EstimateCardAddProps {
  items: string;
  selectedCustomer: string;
  estimateID: number;
  discount: number;
  onClose: () => void;
}

interface InventoryItem {
  partNumber: string;
  name: string;
  quantity: number;
  retailPrice: number;
  images: string;
  qboID: number;
  weight: number;
  isVisible: boolean;
}
const EstimateCardAdd: React.FC<EstimateCardAddProps> = ({
  items,
  selectedCustomer,
  estimateID,
  discount: passedDiscount,
  onClose,
}) => {
  const [updatedSelectedCustomer, setSelectedCustomer] =
    useState<CustomerCard | null>(JSON.parse(selectedCustomer));
  const [dueDate, setdueDate] = useState<Date>(
    new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000)
  );
  const [shipDate, setShipDate] = useState<Date | null>(new Date());
  const [trackingNumber, setTrackingNumber] = useState<string[]>([]);
  const [newTrackingNumber, setNewTracking] = useState("");
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingMethod, setShippingMethod] = useState<string>("fedex");
  const [purchaseOrder, setpurchaseOrder] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [emails, setEmails] = useState<string[]>([]);
  const [discount, setDiscount] = useState(passedDiscount || 0);
  const [emailInputValue, setEmailInputValue] = useState("");
  const [showItemsHeader, setShowItemsHeader] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddItems, setShowAddItems] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [updatedItems, setItems] = useState<InventoryItem[]>(JSON.parse(items));
  const [isSaving, setIsSaving] = useState(false);
  const [ccPayment, setCCpayment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkItemQboIDs(updatedItems);
    const updateCustomerQboID = async () => {
      if (updatedSelectedCustomer && updatedSelectedCustomer.qboID !== 0) {
        return; // If customer is not selected or qboID already exists, do not fetch.
      } else if (updatedSelectedCustomer) {
        const qboID = await fetchQboID();
        //console.log(qboID);
        if (qboID) {
          setSelectedCustomer({
            ...updatedSelectedCustomer,
            qboID: qboID,
          });
        }
      }
    };

    updateCustomerQboID();
    // Function to detect if the device is mobile
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };
    setIsMobile(isMobile());
  }, []);

  const addTracking = (newValue: string) => {
    setTrackingNumber([...trackingNumber, newValue]);
    setNewTracking("");
  };

  const handleTrackingChange = (index: number, newValue: string) => {
    if (trackingNumber.length === 0) {
      // If the array is empty, add the new value as the first item
      setTrackingNumber([newValue]);
    } else {
      // Otherwise, update the existing serial number
      const updatedTracking = [...trackingNumber];
      updatedTracking[index] = newValue;
      setTrackingNumber(updatedTracking);
    }
  };

  const nameCheck = () => {
    const email = Cookies.get("email");
    if (email) {
      const extractedUsername = email.split("@")[0].toLowerCase();
      return extractedUsername;
    }
  };

  const fetchQboID = async (): Promise<number | null> => {
    const payload = {
      displayName: updatedSelectedCustomer?.companyName,
      primaryEmail: updatedSelectedCustomer?.primaryEmail,
    };
    //console.log(payload);
    const params = {
      FunctionName: "boretec_fetch_Cust_qboID", //change to qbo lambda.
      Payload: JSON.stringify(payload),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      const applicationResponse = JSON.parse(
        new TextDecoder().decode(response.Payload)
      );
      //const responseBody = JSON.parse(applicationResponse.body);

      return applicationResponse.length > 0
        ? parseInt(applicationResponse[0].qboID, 10)
        : null;
    } catch (error) {
      console.error("Failed to fetch QuickBooks Customer ID: ", error);
      return null; // Return null on error to handle gracefully
    }
  };

  const fetchItemQboID = async (partNumber: string) => {
    const payload = {
      partNumber,
    };
    //console.log(payload);
    const params = {
      FunctionName: "boretec_fetch_item_qboID", //change to qbo lambda.
      Payload: JSON.stringify(payload),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      const applicationResponse = JSON.parse(
        new TextDecoder().decode(response.Payload)
      );
      //const responseBody = JSON.parse(applicationResponse.body);
      //console.log(applicationResponse);
      return applicationResponse.length > 0
        ? parseInt(applicationResponse[0].qboID, 10)
        : null;
    } catch (error) {
      console.error("Failed to fetch QuickBooks item ID: ", error);
      return null; // Return null on error to handle gracefully
    }
  };

  const checkItemQboIDs = async (items: InventoryItem[]) => {
    const updatedItemsWithQboIDs = await Promise.all(
      items.map(async (item) => {
        // Check if the item already has a valid qboID
        if (!item.qboID || item.qboID === 0) {
          // Fetch qboID for the item if not present
          const fetchedQboID = await fetchItemQboID(item.partNumber);
          //console.log(fetchedQboID);
          // If a qboID is fetched, update the item's qboID
          if (fetchedQboID !== null) {
            return { ...item, qboID: fetchedQboID };
          }
        }
        // Return the item as is if it already has a qboID or if fetching failed
        return item;
      })
    );
    //console.log(updatedItemsWithQboIDs);
    // Update the state with the new items array
    setItems(updatedItemsWithQboIDs);
  };

  const setToConverted = async () => {
    const payload = {
      estimateID,
    };
    //console.log(payload);
    const params = {
      FunctionName: "boretec_convert_estimate", //change to qbo lambda.
      Payload: JSON.stringify(payload),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      const applicationResponse = JSON.parse(
        new TextDecoder().decode(response.Payload)
      );
      //const responseBody = JSON.parse(applicationResponse.body);
    } catch (error) {
      console.error("Failed to fetch QuickBooks Customer ID: ", error);
      return null; // Return null on error to handle gracefully
    }
  };

  const handleSend = async () => {
    setIsSaving(true);
    const fetchedAccessToken = await fetchAccessToken();
    if (fetchedAccessToken) {
      let setTrackingNumbers = JSON.stringify(trackingNumber);
      if (newTrackingNumber && trackingNumber.length === 0) {
        setTrackingNumbers = JSON.stringify([newTrackingNumber]);
      }
      if (
        trackingNumber.length === 0 &&
        shippingMethod !== "pickUp" &&
        !newTrackingNumber
      ) {
        alert("Add a tracking number.");
        return;
      }
      setIsSaving(true);
      const payload = {
        updatedItems,
        updatedSelectedCustomer,
        tax: calculateTax().toFixed(2),
        subtotal: calculateSubTotal(),
        total:
          calculateTax() +
          calculateSubTotal() -
          (calculateSubTotal() * discount) / 100 +
          shippingCost,
        shippingCost: (shippingCost * 1.15).toFixed(2),
        shipDate,
        shippingMethod,
        trackingNumber: setTrackingNumbers,
        discount,
        message,
        emails,
        dueDate,
        dateCreated: new Date(),
        origin: nameCheck(),
        ccPayment,
        purchaseOrder,
        accessToken: fetchedAccessToken
      };

      console.log(JSON.stringify(payload));

      const params = {
        FunctionName: "createAndInsertInvoiceToShipTransaction", //change to qbo lambda.
        Payload: JSON.stringify(payload),
      };

      try {
        const command = new InvokeCommand(params);

        const response = await lambdaClient.send(command);

        //console.log('Lambda response:', response);

        // Parse the Payload to get the application-level response
        const applicationResponse = JSON.parse(
          new TextDecoder().decode(response.Payload)
        );

        const stringifiedApplicationResponse = JSON.stringify(applicationResponse);
  

        if (applicationResponse.statusCode === 200) {
          //console.log('Item added successfully.');
          setToConverted();
          onClose();
        } else {
          setIsSaving(false);
          alert("Failed to process invoice: " + stringifiedApplicationResponse);
        }
      } catch (error) {
        alert("Failed to add or send the invoice. " + error);
        console.error("Error invoking Lambda function:", error);
      }
    } else {
      setIsSaving(false);
      alert("We need to login to Quickbooks to refresh the credentials.");
      router.push(
        "https://appcenter.intuit.com/connect/oauth2?client_id=ABIgT9WGOJyDM8vD1lGo4inh4gZE43LxBufFIpDCeZkQ8KbiLd&redirect_uri=http://inventory.boretec.com/api/callback&response_type=code&scope=com.intuit.quickbooks.accounting"
      );
    }
  };

  const handleCustomerClick = (customer: CustomerCard) => {
    setSelectedCustomer(customer);
    const keysToCheck: (keyof CustomerCard)[] = [
      "displayName",
      "familyName",
      "givenName",
      "companyName",
      "primaryEmail",
      "primaryPhone",
      "billAddressCity",
      "billAddressLine1",
      "billAddressState",
      "billAddressPostalCode",
      "country",
      "shipAddressState",
      "shipAddressCity",
      "shipAddressLine1",
      "shipAddressPostalCode",
    ];

    // Check each key for the customer
    for (const key of keysToCheck) {
      // If the key is not present, or is null, or is an empty string, set isEditing to true
      if (customer[key] === null || customer[key] === "") {
        setIsEditing(true);
        return; // Exit the function early since we've found a field that meets the criteria
      }
    }
  };

  const changeCustomer = () => {
    setIsEditing(true);
  };

  const handleInventoryClick = (updatedItems: InventoryItem[]) => {
    // Create a new array that includes all existing updatedItems plus the new item

    // Update the state with the new array
    setItems(updatedItems);
    setShowAddItems(false);
    setShowPreview(true);
    //console.log(updatedItems);

    // Optionally, log the updated updatedItems array to the console
    //console.log(updatedItems)
  };

  const removeItem = (itemToRemove: InventoryItem) => {
    // Create a new array excluding the item to remove
    const visibleItems = updatedItems.filter(
      (item) => item.partNumber !== itemToRemove.partNumber
    );

    // Update the state with the new array
    setItems(visibleItems);
  };

  const handleItemsChange = (index: number, quantity: string) => {
    const newInventory = updatedItems.map((item, idx) => {
      if (idx === index) {
        return { ...item, quantity: parseInt(quantity, 10) || 0 };
      }
      return item;
    });

    setItems(newInventory);
  };

  const invokeLambdaFunction = async (selectedCustomer: any) => {
    const { isVisible, ...otherFields } = selectedCustomer;
    const params: InvokeCommandInput = {
      FunctionName: "boretec_update_customer_rds_only",
      Payload: JSON.stringify({ payload: otherFields }),
    };
    //console.log(payload);
    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      const payloadString = new TextDecoder().decode(response.Payload);
      const payloadObject = JSON.parse(payloadString);
      //console.log(payloadObject);
      return payloadObject;
    } catch (error) {
      throw new Error("Error invoking Lambda function");
    }
  };

  /*const invokeLambdaFunctionQBO = async (payload: any) => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_send_customer_Update_2_QBO',
      Payload: JSON.stringify(payload),
    }
    //console.log(payload);
    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject);
      return payloadObject
    } catch (error) {
      throw new Error('Error invoking Lambda function')
    }
  }*/

  const saveCustomerDetails = async () => {
    if (
      updatedSelectedCustomer?.customerType === "" ||
      updatedSelectedCustomer?.customerType === null
    ) {
      setSelectedCustomer({
        ...updatedSelectedCustomer,
        customerType: "Direct",
      });
    }

    const keysToCheck: (keyof CustomerCard)[] = [
      "familyName",
      "givenName",
      "companyName",
      "primaryEmail",
      "primaryPhone",
      "billAddressCity",
      "billAddressLine1",
      "billAddressState",
      "billAddressPostalCode",
      "country",
      "shipAddressState",
      "shipAddressCity",
      "shipAddressLine1",
      "shipAddressPostalCode",
    ];
    if (
      updatedSelectedCustomer?.customerType === "Reseller" &&
      (updatedSelectedCustomer.taxResaleNumber === 0 ||
        updatedSelectedCustomer.taxResaleNumber === null)
    ) {
      alert("All resellers must have a Tax Resale Number.");
      return;
    }
    // Check each key for the customer
    for (const key of keysToCheck) {
      // If the key is not present, or is null, or is an empty string, set isEditing to true
      if (
        !updatedSelectedCustomer ||
        updatedSelectedCustomer[key] === null ||
        updatedSelectedCustomer[key] === ""
      ) {
        alert("All blue fields must be filled in.");
        return; // Exit the function early since we've found a field that meets the criteria
      }
    }

    setIsSaving(true);

    try {
      const response = await invokeLambdaFunction(updatedSelectedCustomer);
      //const responseQBO = await invokeLambdaFunctionQBO(updatedSelectedCustomer)
      if (response.statusCode === 200) {
        //&& responseQBO.statusCode === 200
        setIsSaving(false);
        setIsEditing(false);
      } else {
        alert(`There was a problem saving: ${response}`);
      }
    } catch (error) {
      console.error("Error invoking Lambda function", error);
      setIsSaving(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInputValue(event.target.value);
  };

  const handleAddEmail = () => {
    if (emailInputValue.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(emailInputValue.trim())) {
        setEmails([...emails, emailInputValue.trim()]);
        setEmailInputValue("");
      } else {
        // Handle invalid email format
        alert("Please enter a valid email address.");
      }
    }
  };

  const handleExpirationChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const days = parseInt(event.target.value);
    if (!isNaN(days)) {
      const currentDate = new Date();
      const dueDate = new Date(
        currentDate.getTime() + days * 24 * 60 * 60 * 1000
      );
      setdueDate(dueDate);
    }
  };

  const calculateSubTotal = () => {
    return updatedItems.reduce((total, item) => {
      return total + item.quantity * item.retailPrice;
    }, 0);
  };

  const calculateTotalWeight = () => {
    return updatedItems.reduce((total, item) => {
      return total + item.weight;
    }, 0);
  };

  const calculateTax = () => {
    let tax;
    if (updatedSelectedCustomer?.customerType === "Reseller") {
      tax = 0;
    } else if (
      updatedSelectedCustomer?.shipAddressState.toLowerCase() === "sc"
    ) {
      tax = (calculateSubTotal() - discount) * 0.07;
    } else if (
      updatedSelectedCustomer?.shipAddressState.toLowerCase() ===
      "south carolina"
    ) {
      tax = (calculateSubTotal() - discount) * 0.07;
    } else if (shippingMethod === "pickUp") {
      tax = (calculateSubTotal() - discount) * 0.07;
    } else {
      tax = 0;
    }

    return tax;
  };

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setDiscount(isNaN(value) ? 0 : value);
  };

  const copyBillingAddress = () => {
    setSelectedCustomer((prevState) => {
      // Provide a fallback empty string for properties that are potentially undefined but are expected to be strings
      if (prevState) {
        return {
          ...prevState,
          shipAddressLine1: prevState.billAddressLine1 ?? "",
          shipAddressLine2: prevState.billAddressLine2 ?? "",
          shipAddressCity: prevState.billAddressCity ?? "",
          shipAddressState: prevState.billAddressState ?? "",
          shipAddressPostalCode: prevState.billAddressPostalCode ?? "",
          // Make sure to provide appropriate fallbacks for all other properties that could be undefined
        };
      }
      return prevState; // Return prevState directly if it's null
    });
  };

  return (
    <div className="bg-white lg:text-sm">
      <div className="grid md:grid-cols-3">
        <button
          className="text-lg text-center font-medium px-4 py-1 text-white bg-indigo-500"
          onClick={() => {
            setIsEditing(true);
          }}
        >
          Edit Customer Info
        </button>

        <button
          className={`text-lg text-center font-medium px-4 py-1 text-white bg-indigo-600 ${
            !showItemsHeader ? "opacity-20" : ""
          }`}
          disabled={!showItemsHeader}
          onClick={() => {
            setShowAddItems(true);
            setIsEditing(false);
          }}
        >
          Add Items
        </button>

        <button
          className={`text-lg text-center font-medium px-4 py-1 text-white bg-indigo-700 ${
            !showPreview ? "opacity-20" : ""
          }`}
          onClick={() => setShowAddItems(false)}
        >
          Preview
        </button>
      </div>
      {/* beginning of input div*/}
      <div className="">
        {!updatedSelectedCustomer && showAddCustomer && (
          <div className="">
            {!isMobile && (
              <div className="grid md:grid-cols-3 gap-1 my-1">
                <div>
                  <p className="font-medium m-1">Contact details:</p>
                  <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                  <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                  <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>

                  <p className="font-medium m-1">Customer Type:</p>
                  <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                </div>

                <div>
                  <p className="font-medium m-1">Billing Address:</p>
                  <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                  <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                  <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                </div>

                <div>
                  <p className="font-medium m-1">Shipping Address:</p>
                  <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                  <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                  <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                </div>
              </div>
            )}
            <div className="p-1 text-gray-700 text-sm italic flex justify-center updatedItems-center text-gray-600 bg-gray-200 w-full border-t border-b border-gray-300">
              <p className="">Select a customer.</p>
            </div>
            <div className="bg-gray-100 py-1">
              <CustomerSearch
                onRowClick={handleCustomerClick}
                isMobile={isMobile}
              />
            </div>
          </div>
        )}
        {updatedSelectedCustomer && (
          <div>
            {isEditing && (
              <div className="p-1 text-gray-700 text-sm italic flex justify-center updatedItems-center text-gray-600 bg-gray-200 w-full border-t border-b border-gray-300">
                <p className="">Fill in the indigo fields.</p>
              </div>
            )}
            <div className="border-t border-gray-300 grid md:grid-cols-3 gap-1 p-2">
              <div>
                <p className="font-medium">Contact details:</p>
                <div>
                  {isEditing ? (
                    <div>
                      <p>First Name:</p>
                      <input
                        id="givenName"
                        type="text"
                        value={updatedSelectedCustomer.givenName || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            givenName: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>Last Name:</p>
                      <input
                        id="familyName"
                        type="text"
                        value={updatedSelectedCustomer.familyName || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            familyName: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>Company Name:</p>
                      <input
                        id="companyName"
                        type="text"
                        value={updatedSelectedCustomer.companyName || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            companyName: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>Primary Email:</p>
                      <input
                        id="primaryEmail"
                        type="email"
                        value={updatedSelectedCustomer.primaryEmail || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            primaryEmail: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>Mobile Phone:</p>
                      <input
                        id="mobilePhone"
                        type="tel"
                        value={updatedSelectedCustomer.mobilePhone || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            mobilePhone: e.target.value,
                          })
                        }
                        className="focus:outline-indigo-600 rounded-md px-2 py-1 border border-gray-600 w-full"
                      />
                      <p>Primary Phone:</p>
                      <input
                        id="primaryPhone"
                        type="tel"
                        value={updatedSelectedCustomer.primaryPhone || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            primaryPhone: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex space-x-2">
                        <p>{updatedSelectedCustomer.givenName}</p>
                        <p>{updatedSelectedCustomer.familyName}</p>
                      </div>
                      <p>{updatedSelectedCustomer.companyName}</p>
                      <p>{updatedSelectedCustomer.primaryEmail}</p>
                      <p>Phone: {updatedSelectedCustomer.primaryPhone}</p>
                      {updatedSelectedCustomer.mobilePhone && (
                        <p>Mobile: {updatedSelectedCustomer.mobilePhone}</p>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <p>QBO ID: {updatedSelectedCustomer.qboID}</p>
                  <p className="font-medium mt-2">Customer Type:</p>
                  {isEditing ? (
                    <select
                      defaultValue={updatedSelectedCustomer.customerType || ""}
                      onChange={(e) =>
                        setSelectedCustomer({
                          ...updatedSelectedCustomer,
                          customerType: e.target.value,
                        })
                      }
                      className={`customerType ${
                        isEditing
                          ? "bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 flex-grow"
                          : ""
                      }`}
                    >
                      <option value="Direct">Direct</option>
                      <option value="Reseller">Reseller</option>
                    </select>
                  ) : (
                    <p>{updatedSelectedCustomer.customerType}</p>
                  )}
                  {updatedSelectedCustomer.customerType === "Reseller" && (
                    <div>
                      <p className="font-medium">Tax Resale Number:</p>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={
                            updatedSelectedCustomer.taxResaleNumber || ""
                          }
                          onChange={(e) =>
                            setSelectedCustomer({
                              ...updatedSelectedCustomer,
                              taxResaleNumber: parseInt(e.target.value) || 0,
                            })
                          }
                          className={`taxResaleNumber ${
                            isEditing
                              ? "bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 flex-grow"
                              : ""
                          }`}
                        />
                      ) : (
                        <p>{updatedSelectedCustomer.taxResaleNumber}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium">Billing Address:</p>
                <div>
                  {isEditing ? (
                    <>
                      <p>Line 1:</p>
                      <input
                        id="billAddressLine1"
                        type="text"
                        value={updatedSelectedCustomer.billAddressLine1 || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            billAddressLine1: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>Line 2:</p>
                      <input
                        id="billAddressLine2"
                        type="text"
                        value={updatedSelectedCustomer.billAddressLine2 || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            billAddressLine2: e.target.value,
                          })
                        }
                        className="focus:outline-indigo-600 rounded-md px-2 py-1 border border-gray-600 w-full"
                      />
                      <p>City:</p>
                      <input
                        id="billAddressCity"
                        type="text"
                        value={updatedSelectedCustomer.billAddressCity || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            billAddressCity: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>State:</p>
                      <input
                        id="billAddressState"
                        type="text"
                        value={updatedSelectedCustomer.billAddressState || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            billAddressState: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>Postal/Zip Code:</p>
                      <input
                        id="billAddressPostalCode"
                        type="text"
                        value={
                          updatedSelectedCustomer.billAddressPostalCode || ""
                        }
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            billAddressPostalCode: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>Country:</p>
                      <input
                        id="country"
                        type="text"
                        value={updatedSelectedCustomer.country || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            country: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                    </>
                  ) : (
                    <>
                      <p>{updatedSelectedCustomer.billAddressLine1}</p>
                      <p>{updatedSelectedCustomer.billAddressLine2}</p>
                      <p>{updatedSelectedCustomer.billAddressCity}</p>
                      <p>{updatedSelectedCustomer.billAddressState}</p>
                      <p>{updatedSelectedCustomer.billAddressPostalCode}</p>
                      <p>{updatedSelectedCustomer.country}</p>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium">Shipping Address:</p>
                <div>
                  {isEditing ? (
                    <div>
                      <p>Line 1:</p>
                      <input
                        id="shipAddressLine1"
                        type="text"
                        value={updatedSelectedCustomer.shipAddressLine1 || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            shipAddressLine1: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>Line 2:</p>
                      <input
                        id="shipAddressLine2"
                        type="text"
                        value={updatedSelectedCustomer.shipAddressLine2 || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            shipAddressLine2: e.target.value,
                          })
                        }
                        className="focus:outline-indigo-600 rounded-md px-2 py-1 border border-gray-600 w-full"
                      />
                      <p>City:</p>
                      <input
                        id="shipAddressCity"
                        type="text"
                        value={updatedSelectedCustomer.shipAddressCity || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            shipAddressCity: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>State:</p>
                      <input
                        id="shipAddressState"
                        type="text"
                        value={updatedSelectedCustomer.shipAddressState || ""}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            shipAddressState: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <p>Postal/Zip Code:</p>
                      <input
                        id="shipAddressPostalCode"
                        type="text"
                        value={
                          updatedSelectedCustomer.shipAddressPostalCode || ""
                        }
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...updatedSelectedCustomer,
                            shipAddressPostalCode: e.target.value,
                          })
                        }
                        className="bg-indigo-100 text-indigo-600 focus:outline-indigo-600 rounded-md px-2 py-1 border border-indigo-600 w-full"
                      />
                      <button
                        className="border rounded-md border-gray-600 py-1 px-2 mt-5 w-full"
                        onClick={copyBillingAddress}
                      >
                        Copy Billing Address
                      </button>
                    </div>
                  ) : (
                    <>
                      <p>{updatedSelectedCustomer.shipAddressLine1}</p>
                      <p>{updatedSelectedCustomer.shipAddressLine2}</p>
                      <p>{updatedSelectedCustomer.shipAddressCity}</p>
                      <p>{updatedSelectedCustomer.shipAddressState}</p>
                      <p>{updatedSelectedCustomer.shipAddressPostalCode}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            {isEditing && (
              <button
                onClick={() => saveCustomerDetails()}
                className="bg-black text-white py-1 w-full px-2"
              >
                {isSaving ? (
                  <p className="animate-pulse">Saving...</p>
                ) : (
                  <p>Save and Continue</p>
                )}
              </button>
            )}
          </div>
        )}
        {!isEditing && updatedSelectedCustomer && showAddCustomer && (
          <div className="grid md:grid-cols-2">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="bg-gray-600 text-white py-1 px-2"
            >
              New Customer
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gray-700 text-white py-1 px-2"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setShowAddCustomer(false);
                setShowAddItems(true);
                setShowItemsHeader(true);
              }}
              className="bg-gray-800 text-white py-2 px-2 border-t border-white hover:bg-black col-span-2"
            >
              Add Items
            </button>
          </div>
        )}

        {updatedItems.length > 0 && !showAddItems && (
          <div>
            <div className="bg-gray-100 border-t border-b border-gray-200 text-gray-600 text-center px-2 py-1 w-full">
              Requested Items
            </div>
            <div className="overflow-y-auto bg-white">
              <table className="leading-normal w-full text-center">
                <thead>
                  <tr className="text-center">
                    <th className="w-20">Quantity</th>
                    {!isMobile && <th></th>}
                    <th>Part Number - Description</th>
                    {!isMobile && <th>Weight</th>}
                    <th>Price</th>
                    {!isMobile && <th>Line total</th>}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {updatedItems.map((item, index) => (
                    <tr key={index} className={`border-b h-12 border-gray-200`}>
                      <td>
                        <input
                          type="number"
                          step="1"
                          value={item.quantity || 0}
                          onChange={(e) =>
                            handleItemsChange(index, e.target.value)
                          }
                          className={`mx-1 cursor-pointer appearance-none w-20 px-1 py-1 text-center leading-tight`}
                        />
                      </td>
                      {!isMobile && (
                        <td className="px-1 w-20">
                          {item.images !==
                            "https://boretec.com/images/image-coming-soon.png" && (
                            <img
                              className="rounded-md h-12"
                              src={item.images}
                            />
                          )}
                        </td>
                      )}
                      <td className="px-1">
                        {item.partNumber} - {item.name}
                      </td>
                      {!isMobile && <td>{item.weight} lbs</td>}
                      <td className="px-1">
                        $
                        {new Intl.NumberFormat("en-US", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(item.retailPrice)}
                      </td>
                      {!isMobile && (
                        <td className="px-1">
                          $
                          {new Intl.NumberFormat("en-US", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.retailPrice * item.quantity)}
                        </td>
                      )}
                      <td>
                        <button onClick={() => removeItem(item)}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            className="h-4"
                            viewBox="0 0 30 30"
                          >
                            <path d="M6 8v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8H6zM24 4h-6c0-.6-.4-1-1-1h-4c-.6 0-1 .4-1 1H6C5.4 4 5 4.4 5 5s.4 1 1 1h18c.6 0 1-.4 1-1S24.6 4 24 4z"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showAddItems && (
          <div className="">
            <div className="bg-gray-100">
              <InventorySearch
                handleAddItems={handleInventoryClick}
                itemsProp={updatedItems}
                changeCustomer={changeCustomer}
                isMobile={isMobile}
              />
            </div>
          </div>
        )}
      </div>
      {/* end of input div*/}
      {/* beginning of preview*/}
      {showPreview && (
        <div>
          <div>
            <div className="bg-gray-100 text-gray-600 text-center border-b border-gray-200 px-2 py-1 w-full">
              Shipping Information
            </div>
            <div className="px-4 py-6 grid md:grid-cols-4 gap-2">
              <div className="">
                <div>
                  <b>Shipping Method</b>
                </div>
                <select
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 w-full mt-1"
                >
                  <option value="pickUp">Pick up</option>
                  <option value="fedex">Fedex</option>
                  <option value="fedexGround">Fedex Ground</option>
                  <option value="freight">Freight</option>
                  <option value="USPS">USPS</option>
                  <option value="UPS">UPS</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {shippingMethod !== "pickUp" && (
                <div>
                  <div>
                    <b>Tracking Numbers</b>
                  </div>
                  <div className="">
                    {trackingNumber.length > 0 && (
                      <div>
                        {trackingNumber.map(
                          (tracking: string, index: number) => (
                            <input
                              key={index}
                              type="text"
                              value={tracking}
                              onChange={(e) =>
                                handleTrackingChange(index, e.target.value)
                              }
                              className="my-1 p-1 bg-gray-100 rounded-lg w-full"
                            />
                          )
                        )}
                      </div>
                    )}

                    <div className=" my-1">
                      <input
                        type="text"
                        value={newTrackingNumber}
                        onChange={(e) => setNewTracking(e.target.value)}
                        className="p-1 bg-gray-100 rounded-lg w-full"
                      />
                      <button
                        className="px-1 hover:bg-gray-300 rounded-lg"
                        onClick={() => addTracking(newTrackingNumber)}
                      >
                        Add Another
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {shippingMethod !== "pickUp" && (
                <div>
                  <div>
                    <b>Shipping Cost</b>
                  </div>
                  <input
                    type="number"
                    value={shippingCost}
                    onChange={(e) =>
                      setShippingCost(parseFloat(e.target.value))
                    }
                    className="p-1 bg-gray-100 rounded-lg w-full text-center mt-1"
                  />
                  <p className="text-sm text-gray-500 text-right">
                    Total of available weights: {calculateTotalWeight()} lbs
                  </p>
                </div>
              )}

              <div>
                <div>
                  <b>Estimated Ship Date</b>
                </div>
                <DatePicker
                  selected={shipDate}
                  onChange={setShipDate}
                  dateFormat="MM-dd-yy" // Customize the date format
                  className={`p-1 bg-gray-100 rounded-lg w-full text-center mt-1`} // Apply Tailwind or custom styling here
                  // Wrapper class for additional styling
                  //popperPlacement="top-end" // Customize the popper placement
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-100 text-gray-600 text-center border-b border-t border-gray-200 px-2 py-1 w-full">
            Payment Information
          </div>
          <div className="px-4 py-2 grid md:grid-cols-2">
            <div>
              <div className="mt-2">
                <label htmlFor="expiration" className=" mt-1 mr-2">
                  Due:
                </label>
                <select
                  id="expiration"
                  onChange={handleExpirationChange}
                  className="border border-gray-300 rounded-lg px-2 py-1"
                >
                  <option value="0">Upon reciept</option>
                  <option value="5">in 5 days</option>
                  <option value="15">in 15 days</option>
                  <option value="30">in 30 days</option>
                </select>
              </div>
              <div className="mt-2">
                <label htmlFor="discount" className="mr-2">
                  Apply a discount of
                </label>
                <input
                  type="number"
                  id="discount"
                  value={discount}
                  onChange={handleDiscountChange}
                  className="border border-gray-300 rounded-lg px-3 py-1 w-20"
                />
                %
              </div>
              <div className="mt-2">
                <label htmlFor="discount" className="mr-2">
                  Enter Customer&apos;s purchase order (PO)
                </label>
                <input
                  type="text"
                  id="po"
                  placeholder="optional"
                  value={purchaseOrder}
                  onChange={(e) => setpurchaseOrder(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 w-20"
                />
              </div>
              {calculateSubTotal() + calculateTax() <= 3000 && (
                <div className="mt-2">
                  <label htmlFor="expiration" className=" mt-1 mr-2">
                    Allow Credit Card Payment:
                  </label>
                  <select
                    value={ccPayment.toString()}
                    onChange={(e) => setCCpayment(e.target.value === "true")}
                    className="border border-gray-300 rounded-lg px-2 py-1"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="my-2">
                Subtotal: $
                {new Intl.NumberFormat("en-US", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(calculateSubTotal())}
              </div>

              <div className="mt-2">
                <p>
                  Discount: -$
                  {new Intl.NumberFormat("en-US", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format((calculateSubTotal() * discount) / 100)}
                </p>
              </div>
              <div className="mt-2">
                <p>
                  Tax: $
                  {new Intl.NumberFormat("en-US", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(calculateTax())}
                </p>
              </div>
              <div className="mt-2">
                <p>
                  Shipping and Handling: $
                  {new Intl.NumberFormat("en-US", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(shippingCost * 1.15 || 0)}
                </p>
              </div>
              <div className="mt-2 font-bold">
                <p>
                  Total Cost: $ $
                  {new Intl.NumberFormat("en-US", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    calculateSubTotal() -
                      (calculateSubTotal() * discount) / 100 +
                      calculateTax() +
                      (shippingCost * 1.15 || 0)
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="m-2">
            <p>Message:</p>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-1"
            ></textarea>
          </div>
          <div className="m-2">
            <p>Additional emails:</p>
            <div className="flex flex-wrap">
              {emails.map((email, index) => (
                <div key={index} className="bg-gray-300 rounded-lg m-1 p-2">
                  {email}
                </div>
              ))}
            </div>
            <div className="flex updatedItems-center mt-2">
              <input
                type="email"
                value={emailInputValue}
                onChange={handleInputChange}
                placeholder="Add another email address to the estimate..."
                className="border border-gray-300 rounded-lg px-3 py-1 mr-2 flex-grow"
              />
              <button
                onClick={handleAddEmail}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 py-1 px-4 rounded-lg"
              >
                Add Email
              </button>
            </div>
          </div>
          {/* Buttons for Save and Close */}
          <div className="text-center">
            <button
              onClick={handleSend}
              className={`bg-gray-800 w-full hover:bg-black text-white font-bold py-2`}
            >
              {isSaving ? "Sending..." : "Save and Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateCardAdd;
