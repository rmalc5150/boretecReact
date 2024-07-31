"use client";

import React, { useEffect, useState } from "react";
import CompanyLogo from "../ui/companyLogo";
import EmailEventSearch from "../buttons/EmailEventSearch";
import ResendLink from "../buttons/ResendLink"

//db fields
export interface invoiceCards {
  totalTax: number;
  customerBalance: number;
  invoiceNumber: string;
  displayName: string;
  companyName: string;
  itemsDescription: string; // Could be transformed into string[] if split
  itemsDetailType: string; // Could be transformed into string[] if split
  customerEmail: string;
  customerPhone: string;
  mobilePhone: string;
  itemsQuantity: string; // Could be transformed into number[] if split and converted
  linesRefNames: string; // Could be transformed into string[] if split
  total: number; // Could be converted to number if needed
  linesAmounts: string; // Could be transformed into number[] if split and converted
  linesTypes: string; // Could be transformed into string[] if split
  linesUnitPrice: string; // Could be transformed into number[] if split and converted
  dueDate: string; // Could use Date type if converting string to Date object
  pdf: string;
  billEmail: string;
  shipMethod: string;
  salesTerm: string;
  subTotal: number; // Could be converted to number if needed
  taxable: boolean; // Assuming 0 or 1, could also be boolean
  invoiceStatus: string;
  shipAddressLine1: string;
  shipAddressLine2: string;
  invoiceItems: string;
  shipAddressLine4: string;
  openTime: string;
  clickTime: string;
  deliveredTime: string;
  qboUrl: string;
  emailId: string;
  billAddressCountry: string | null;
  billAddressLine1: string;
  billAddressLine2: string;
  billAddressCity: string | null;
  billAddressPostalCode: string | null;
  billAddressLine3: string | null;
  billAddressLine4: string | null;
  billAddressState: string;
  salesPerson: string;
  trackingNumber: string;
  message: string;
  dateCreated: string | null;
  isVisible: boolean;
  shipAddressCity: string;
  shipAddressState: string;
  shipAddressPostalCode: string;
  poNumber: string;
  shipDate: string;
  shipping: number;
  discount: number;
}

// Define a type for individual machines
interface ItemDetail {
  description: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}


const InvoiceCard: React.FC<invoiceCards> = ({
  discount,
  billAddressLine3,
  billAddressLine4,
  shipAddressCity,
  poNumber,
  shipping,
  shipDate,
  shipAddressState,
  shipAddressPostalCode,
  invoiceNumber,
  totalTax,
  displayName,
  companyName,
  itemsDescription, // These can be transformed into string[] if split
  itemsDetailType, // These can be transformed into string[] if split
  customerEmail,
  customerPhone,
  mobilePhone,
  itemsQuantity, // These can be transformed into number[] if split and converted
  linesRefNames, // These can be transformed into string[] if split
  total, // Could be converted to number if needed
  linesAmounts, // These can be transformed into number[] if split and converted
  linesTypes, // These can be transformed into string[] if split
  linesUnitPrice, // These can be transformed into number[] if split and converted
  dueDate, // Could use Date type if converting string to Date object
  pdf,
  shipMethod,
  salesTerm,
  subTotal, // Could be converted to number if needed
  invoiceStatus,
  taxable, // Assuming 0 or 1, could also be boolean
  billEmail,
  customerBalance,
  shipAddressLine1,
  shipAddressLine2,
  invoiceItems,
  shipAddressLine4,
  salesPerson,
  trackingNumber,
  message,
  openTime,
  emailId,
  clickTime,
  deliveredTime,
  qboUrl,
  billAddressCountry,
  billAddressLine1,
  billAddressLine2,
  billAddressCity,
  billAddressPostalCode,
  billAddressState,
  dateCreated, // Could use Date type if converting string to Date object
}) => {
  const [companyUrl, setCompanyUrl] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showEmailEvents, setShowEmailEvents] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);
  const [trackingNumberArray, setTrackingNumberArray] = useState<
    string[] | null
  >(null);

  const dueDateFormatted = new Date(dueDate);

  // Function to check the email and set the company URL
  const checkAndSetCompanyUrl = (customerEmail: string) => {
    // List of common free email providers' domains
    const freeEmailProviders: string[] = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "aol.com",
      "msn.com",
      "att.net",
      "windstream.net",
    ];

    // Extract the domain from the email
    const emailDomain = customerEmail
      .toLowerCase()
      .split("@")[1]
      .replace(",", "");

    // Check if the email domain is not in the list of free email providers
    if (!freeEmailProviders.includes(emailDomain)) {
      // The email is not from a free provider, so set the company URL
      setCompanyUrl(emailDomain);
    } else {
      // Optionally, handle the case where it's a free email provider
      //console.log('The provided email is from a free email provider.');
    }
  };

  useEffect(() => {
    let trackingNumberArray;

    try {
      // Attempt to parse the trackingNumber
      const parsed = JSON.parse(trackingNumber);
      // Check if the parsed result is an array
      trackingNumberArray = Array.isArray(parsed) ? parsed : null;
      setTrackingNumberArray(trackingNumberArray);
    } catch (error) {
      // Handle parsing errors (e.g., invalid JSON)
      trackingNumberArray = null;
      setTrackingNumberArray(trackingNumberArray);
    }
    //function to set companyUrl
    if (customerEmail) {
      checkAndSetCompanyUrl(customerEmail);
    }
    // Function to detect if the device is mobile
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };
    // Set isOpen to true if isMobile returns true
    setIsMobile(isMobile());
  }, []);

  const createItemsJson = (
    description: string | null,
    partNumber: string | null,
    quantity: string | null,
    amounts: string | null,
    unitPrice: string | null,
    invoiceItems: string | null
  ): { [key: string]: ItemDetail } => {
    // Check for null and use default value ('') if true
    const safeDescription = description ?? "";
    const safePartNumber = partNumber ?? "";
    const safeQuantity = quantity ?? "";
    const safeAmounts = amounts ?? "";
    const safeUnitPrice = unitPrice ?? "";

    // Proceed with splitting the sanitized inputs
    const descriptions = safeDescription.split(",");
    const partNumbers = safePartNumber.split(","); //.map(pn => {
    // Check if partNumber contains a colon and split it to use the part after the colon
    // return pn.includes(':') ? pn.split(':')[1] : pn;
    //});
    const quantities = safeQuantity.split(",").map(Number);
    const amountsArr = safeAmounts.split(",").map(Number);
    const unitPrices = safeUnitPrice.split(",").map(Number);

    let result: { [key: string]: ItemDetail } = {};
    if (invoiceItems) {
      result = JSON.parse(invoiceItems);
    } else {
      descriptions.forEach((desc, index) => {
        if (
          desc &&
          !isNaN(quantities[index]) &&
          !isNaN(unitPrices[index]) &&
          !isNaN(amountsArr[index])
        ) {
          result[desc] = {
            description: descriptions[index],
            partNumber: partNumbers[index],
            quantity: quantities[index],
            unitPrice: unitPrices[index],
            lineAmount: amountsArr[index],
          };
        }
      });
    }
    //console.log(result);
    return result;
  };

  const itemsJson = createItemsJson(
    itemsDescription,
    itemsDetailType,
    itemsQuantity,
    linesAmounts,
    linesUnitPrice,
    invoiceItems
  );

  //console.log(itemsJson);
  const calculateSubTotal = () => {
    // Convert object values to an array and calculate the subtotal
    return Object.values(itemsJson).reduce((total, item) => {
      // Directly accumulate the pre-calculated lineAmounts
      return total + item.lineAmount;
    }, 0);
  };



  const today = new Date();
  const dueDateComparable = new Date(dueDate);

  return (
    <div>
    {showResendLink ? (<ResendLink displayName={displayName} emails={billEmail} link={qboUrl} invoiceNumber={invoiceNumber} onHide = {()=>setShowResendLink(false)}/>) : 
    (<div className="bg-white my-4 rounded-lg overflow-hidden">
      {invoiceStatus !== "Paid" && dueDateComparable > today && (
        <div className="bg-indigo-500 text-white text-center p-1">
          <div className="grid grid-cols-3">
            <p className="text-left pl-1">{invoiceNumber}</p>
            <p className=""></p>
            <p className="text-right pr-1">
              $
              {new Intl.NumberFormat("en-US", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(total)}
            </p>
          </div>
        </div>
      )}

      {invoiceStatus !== "Paid" && dueDateComparable < today && (
        <div className="bg-rose-600 text-white text-center p-1">
          <div className="grid grid-cols-3">
            <p className="text-left pl-1">{invoiceNumber}</p>
            <p className="">Past due</p>
            <p className="text-right pr-1">
              $
              {new Intl.NumberFormat("en-US", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(total)}
            </p>
          </div>
        </div>
      )}
      {invoiceStatus === "Paid" && (
        <div className="bg-teal-600 text-white text-center p-1">
          <div className="grid grid-cols-3">
            <p className="text-left pl-1">{invoiceNumber}</p>
            <p className="">{invoiceStatus}</p>
            <p className="text-right pr-1">
              $
              {new Intl.NumberFormat("en-US", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(total)}
            </p>
          </div>
        </div>
      )}
      {invoiceStatus !== "Paid" && !clickTime && deliveredTime && (
        <div className="bg-violet-500 text-white text-center p-1 border-t border-white">
          <p className="text-center">Unclicked</p>
        </div>
      )}
      {invoiceStatus !== "Paid" && emailId && !deliveredTime && (
        <div className="bg-violet-500 text-white text-center p-1 border-t border-white">
          <p className="text-center">Undelivered</p>
        </div>
      )}
      <div className="border-r border-l border-gray-200">
        {isMobile ? (
          <div className=" p-1">
            <div className="grid grid-cols-2 text-sm">
              {dueDate && (
                <p className="">
                  Due: {dueDateFormatted.toString().slice(0, 15)}
                </p>
              )}
              {/*salesTerm && <p className="">Term: {salesTerm}</p>*/}

              {shipMethod && (
                <div className="text-right">
                  {shipMethod && <p className="">{shipMethod}</p>}{" "}
                  {Array.isArray(trackingNumberArray) &&
                    trackingNumberArray.map((number, index) => (
                      <a
                        key={index}
                        href={`https://www.google.com/search?q=${number}`}
                        className=""
                        target="_blank"
                      >
                        {number}
                      </a>
                    ))}
                </div>
              )}
            </div>

            <div className="text-center mt-1">
              <a
                href={`/sales?customers?${displayName.replace(/\s/g, "*")}`}
                className=""
              >
                <p className=" font-medium text-lg">{displayName}</p>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 p-1">
            <div className="flex items-top">
              <a href={`https://${companyUrl}`} target="_blank">
                <CompanyLogo companyName={companyUrl} />
              </a>
            </div>
            <div>
              <div className="flex items-center mt-1 space-x-2">
                <a
                  href={`/sales?customers?${displayName.replace(/\s/g, "*")}`}
                  className="flex justify-center w-full"
                >
                  <p className="w-full text-center font-medium text-lg">
                    {displayName}
                  </p>{" "}
                </a>
              </div>
            </div>
            <div className="text-right font-medium">
              {dueDate && (
                <p className="">
                  Due: {dueDateFormatted.toString().slice(0, 15)}
                </p>
              )}
              {/*salesTerm && <p className="">Term: {salesTerm}</p>*/}

              {shipMethod && (
                <div className="">
                  {shipMethod && <p className="">{shipMethod}</p>}{" "}
                  {Array.isArray(trackingNumberArray) &&
                    trackingNumberArray.map((number, index) => (
                      <a
                        key={index}
                        href={`https://www.google.com/search?q=${number}`}
                        className=""
                        target="_blank"
                      >
                        {number}
                      </a>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center text-gray-700 py-1 ">
          <table className="min-w-full divide-y divide-gray-200 border-b border-gray-200">
            <thead className="">
              <tr>
                <th
                  scope="col"
                  className="px-2 py-1 text-xs font-medium uppercase"
                >
                  Quantity
                </th>
                {!isMobile && (
                  <th
                    scope="col"
                    className="px-2 py-1 text-xs font-medium uppercase"
                  >
                    Part Number
                  </th>
                )}
                <th
                  scope="col"
                  className="px-2 py-1 text-xs font-medium uppercase"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 text-xs font-medium uppercase"
                >
                  Unit Price
                </th>
                {!isMobile && (
                  <th
                    scope="col"
                    className="px-2 py-1 text-xs font-medium uppercase"
                  >
                    Line Amount
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 ">
              {Object.entries(itemsJson).map(([index, details]) => (
                <tr key={index}>
                  <td className="px-2 py-1 whitespace-nowrap">
                    {details.quantity}
                  </td>
                  {!isMobile && (
                    <td className="px-2 py-1 whitespace-nowrap">
                      {details.partNumber && details.partNumber.includes(":")
                        ? details.partNumber.split(":")[1]
                        : details.partNumber}
                    </td>
                  )}
                  <td className={`px-2 py-1`}>
                    {isMobile &&
                      `${
                        details.partNumber && details.partNumber.includes(":")
                          ? details.partNumber.split(":")[1]
                          : details.partNumber
                      } - `}
                    {details.description}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    $
                    {new Intl.NumberFormat("en-US", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(details.unitPrice)}
                  </td>
                  {!isMobile && (
                    <td className="px-2 py-1 whitespace-nowrap">
                      $
                      {new Intl.NumberFormat("en-US", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(details.quantity * details.unitPrice)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid md:grid-cols-2 pb-2">
          <div className="px-2 order-2 flex items-end md:order-1">
            <div className="text-md">
              {/*{deliveredTime && (
                <p>
                  Delivered: {new Date(deliveredTime).toString().slice(4, 16)}{" "}
                  at {new Date(deliveredTime).toLocaleTimeString()}
                </p>
              )}
              {openTime && (
                <p>
                  Opened: {new Date(openTime).toString().slice(4, 16)} at{" "}
                  {new Date(openTime).toLocaleTimeString()}
                </p>
              )}
              {clickTime && (
                <p>
                  Clicked: {new Date(clickTime).toString().slice(4, 16)} at{" "}
                  {new Date(clickTime).toLocaleTimeString()}
                </p>
              )}*/}
              {salesPerson && (
                <p className="pt-2">
                  Sales Person:{" "}
                  {salesPerson.slice(0, 1).toUpperCase() + salesPerson.slice(1)}
                </p>
              )}
            </div>
          </div>
          <div className="text-right px-2 order-1 md:order-2">
            <p>
              Subtotal: $
              {new Intl.NumberFormat("en-US", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(calculateSubTotal())}
            </p>
            {shipping && (
              <p>
                Shipping: $
                {new Intl.NumberFormat("en-US", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(shipping)}
              </p>
            )}
            {totalTax && (
              <p>
                Tax: $
                {new Intl.NumberFormat("en-US", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totalTax)}
              </p>
            )}
            {discount && (
              <p>
                Discount: {discount}% (-$
                {new Intl.NumberFormat("en-US", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format((discount / 100) * calculateSubTotal())}
                )
              </p>
            )}
            <p>
              Total: $
              {new Intl.NumberFormat("en-US", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(total)}
            </p>
          </div>
        </div>



        {showDetails && (
          <div className="border-t bg-gray-50 border-gray-300">
            <div className="grid md:grid-cols-3 md:justify-items-center pb-2 px-2 mt-2">
              <div className="pt-2">
                {dateCreated && (
                  <p className="">
                    <span className="font-medium">Invoice generated:</span>{" "}
                    {new Date(dateCreated).toString().slice(0, 15)}
                  </p>
                )}
                {shipDate && (
                  <p>
                    <span className="font-medium">Expected Ship Date:</span>{" "}
                    {shipDate}
                  </p>
                )}
                {customerBalance && (
                  <p>
                    <span className="font-medium">
                      Balance before invoice was generated:
                    </span>{" "}
                    $
                    {new Intl.NumberFormat("en-US", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(customerBalance - total)}
                  </p>
                )}
                {poNumber && (
                  <p>
                    <span className="font-medium">PO Number:</span> {poNumber}
                  </p>
                )}
                <p>
                  <span className="font-medium">Sent to:</span> {billEmail}
                </p>
                <p>
                  <span className="font-medium">Primary email:</span>{" "}
                  {customerEmail}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {customerPhone}
                </p>
                {mobilePhone && (
                  <p>
                    <span className="font-medium">Mobile:</span> {mobilePhone}
                  </p>
                )}

              </div>
              <div className="pt-2">
                <p className="font-medium">Shipping Address:</p>
                <p>{shipAddressLine1}</p>
                {shipAddressLine2 && <p>{shipAddressLine2}</p>}
                <p>
                  {shipAddressCity}, {shipAddressState} {shipAddressPostalCode}
                </p>
                {billAddressCountry && <p>{billAddressCountry}</p>}
              </div>
              <div className="pt-2">
                <p className="font-medium">Billing Address:</p>

                <p>{billAddressLine1}</p>
                {billAddressLine2 && <p>{billAddressLine2}</p>}
                {billAddressLine3 ? (
                  <p>{billAddressLine3}</p>
                ) : (
                  <p>
                    {billAddressCity}, {billAddressState}{" "}
                    {billAddressPostalCode}
                  </p>
                )}
                {billAddressLine4 ? (
                  <p>{billAddressLine4}</p>
                ) : (
                  <p>{billAddressCountry}</p>
                )}
              </div>
            </div>
            <div className="pb-2 py-1 px-2 w-full">
              {message && (
                <p>
                  <span className="font-medium">Message:</span> {message}
                </p>
              )}
              {qboUrl && (
                  <div className="w-full">
                    <a href={qboUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center font-medium py-1 px-2 bg-gray-200 rounded-lg">Invoice link</a>
                  </div>
                )}
            </div>
          </div>
        )}

     
          <div className="bg-gray-50 border-t border-gray-300">
            {!showDetails && (
              <div
                onClick={() => setShowDetails(true)}
                className="text-center py-1 cursor-pointer"
              >
                Invoice Details
              </div>
            )}
            {showDetails && (
              <div
                onClick={() => setShowDetails(false)}
                className="text-center py-1 cursor-pointer"
              >
                Hide Invoice Details
              </div>
             
            )}
            </div>

            {showEmailEvents && (
              <EmailEventSearch emailId={emailId} isMobile = {isMobile} />
        )}





            {emailId && 
              <div className="bg-gray-50 border-t border-gray-300">
            {!showEmailEvents && (
              <div
                onClick={() => setShowEmailEvents(true)}
                className="text-center py-1 cursor-pointer"
              >
                Delivery Details
              </div>
            )}
            {showEmailEvents && (
              <div
                onClick={() => setShowEmailEvents(false)}
                className="text-center py-1 cursor-pointer"
              >
                Hide Delivery Details
              </div>
            )}
            </div>}
          
      
      </div>

      <div
        className={`md:grid ${
          qboUrl ? "md:grid-cols-3" : "md:grid-cols-2"
        } sm:grid-cols-1 text-white text-center bg-gray-900`}
      >
        {qboUrl && (
          <div
            className="md:border-r border-b md:border-b-0 border-gray-50 py-1 cursor-pointer"
            //onClick={composeEmail}
            onClick={()=>setShowResendLink(true)}
          >
            Resend Link
          </div>
        )}

        {pdf && (
          <a href={pdf}>
            <div className="md:border-r border-b md:border-b-0 border-gray-50 py-1">
              <div className="text-center cursor-pointer">Download PDF</div>
            </div>
          </a>
        )}
        <div className={`${!pdf && "col-span-2"}`}>
          {customerPhone ? (
            <a href={`tel:${customerPhone}`} style={{ textDecoration: "none" }}>
              <div className="py-1">Call</div>
            </a>
          ) : (
            <div className="py-1">No phone on file</div>
          )}
        </div>
      </div>
    </div>)}
    </div>
  );
};
export default InvoiceCard;
