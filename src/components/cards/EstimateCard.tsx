'use client'

import React, { useEffect, useState } from 'react'
import CompanyLogo from '../ui/companyLogo'
import AddInvoiceFromEstimate from '../cards/AddInvoiceFromEstimate'
import Cookies from 'js-cookie'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'

//db fields
export interface EstimateCards {
  urlKey: string
  estimateID: number
  items: string // Since the items are stringified JSON, use string; otherwise, define a more specific type if you plan to parse it
  displayName: string
  familyName: string
  givenName: string
  companyName: string
  primaryEmail: string
  primaryPhone: string
  billAddressCity: string
  billAddressLine1: string
  billAddressLine2: string | null
  billAddressState: string
  billAddressPostalCode: string
  country: string
  fullyQualifiedName: string
  shipAddressState: string
  shipAddressCity: string
  shipAddressLine1: string
  shipAddressLine2: string | null
  shipAddressPostalCode: string
  customerType: string
  mobilePhone: string
  tax: number
  subtotal: number
  discount: number
  message: string
  emails: string // Assuming emails is a stringified array, use string; otherwise, define a more specific type
  dateCreated: string // Use string for ISO date strings; consider Date for Date objects
  expirationDate: string
  origin: string
  isVisible: boolean
  converted: boolean
  selectedCustomer: string
  notes: string
}


const EstimateCard: React.FC<EstimateCards> = ({
  urlKey,
  estimateID,
  items,
  displayName,
  familyName,
  givenName,
  companyName,
  primaryEmail,
  primaryPhone,
  billAddressCity,
  billAddressLine1,
  billAddressLine2,
  billAddressState,
  billAddressPostalCode,
  country,
  fullyQualifiedName,
  shipAddressState,
  shipAddressCity,
  shipAddressLine1,
  shipAddressLine2,
  shipAddressPostalCode,
  customerType,
  mobilePhone,
  tax,
  subtotal,
  discount,
  message,
  emails,
  dateCreated,
  expirationDate,
  origin,
  converted: initialConverted,
  selectedCustomer,
  isVisible,
  notes
}) => {
  const [converted, setConverted] = useState(initialConverted)
  const [showNotes, setShowNotes] = useState(false)
  const [updatedNotes, setNotes] = useState(notes)
  const [textareaValue, setTextareaValue] = useState<string>('')
  const [unsavedNotes, setUnsavedNotes] = useState(false)
  const [companyUrl, setCompanyUrl] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showConvertToInvoice, setShowConvertToInvoice] = useState(false)
  const parsedItems = JSON.parse(items)
  const expirationDateFormatted = new Date(expirationDate)
  const today = new Date()
  const expirationDateComparable = new Date(expirationDate)
  const estimateUrl = `https://inventory.boretec.com/estimates?${urlKey}`
  const todaySliced = new Date().toString().slice(0, 15);
  const nameCheck = () => {
    const email = Cookies.get('email')
    if (email) {
      const extractedUsername = email.split('@')[0].toLowerCase()
      return extractedUsername
    }
  }
const name = nameCheck(); 

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(estimateUrl)
      //console.log("URL copied to clipboard!");
      // Optionally, show a message to the user indicating the URL was copied
    } catch (err) {
      console.error('Failed to copy URL: ', err)
      // Optionally, handle the error (e.g., show an error message to the user)
    }
  }

  // Function to check the email and set the company URL
  const checkAndSetCompanyUrl = (customerEmail: string) => {
    // List of common free email providers' domains
    const freeEmailProviders: string[] = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'aol.com',
      'msn.com',
      'att.net',
      'windstream.net'
    ]

    // Extract the domain from the email
    const emailDomain = customerEmail.toLowerCase().split('@')[1]

    // Check if the email domain is not in the list of free email providers
    if (!freeEmailProviders.includes(emailDomain)) {
      // The email is not from a free provider, so set the company URL
      setCompanyUrl(emailDomain)
    } else {
      // Optionally, handle the case where it's a free email provider
      //console.log('The provided email is from a free email provider.');
    }
  }
  const sendToRds = async (scrapedNotes: string) => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_save_notes_estimates',
      Payload: JSON.stringify({ scrapedNotes, estimateID }),
    }
    console.log(params);

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)

      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      console.log(payloadObject);
      if (payloadObject.status != 200) {
        alert("notes didn't save to the database.")
        setUnsavedNotes(true)
      }
    } catch (error) {
      console.error('Error fetching inventory items', error)
    }
  }

  const saveNotes = () => {
    const parent = document.getElementById(`${urlKey}`)
    // Find the p tag with className 'date'
    const dateElement = parent?.querySelector('p.date')
    // Find the textarea
    const textAreaElement = parent?.querySelector(
      'textarea.notes'
    ) as HTMLTextAreaElement
   
    if (dateElement && textAreaElement) {
      // Extract text content
      const dateText = dateElement.textContent || ''
      const notesText = textAreaElement.value

      let scrapedNotes = ''
      // Append the concatenated text as a new paragraph to the notes variable
      if (updatedNotes) {
        scrapedNotes = `${updatedNotes}\n${dateText} ${notesText}`
      } else {
        scrapedNotes = `${dateText} ${notesText}`
      }
      console.log(scrapedNotes);
      // Update the notes state
      setNotes(scrapedNotes)
      setUnsavedNotes(false)
      setTextareaValue('')
      sendToRds(scrapedNotes)
    }
  }

  useEffect(() => {
    //function to set companyUrl
  //console.log(parsedItems);
    if (primaryEmail) {
      checkAndSetCompanyUrl(primaryEmail)
    }
    // Function to detect if the device is mobile
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    }
    // Set isOpen to true if isMobile returns true
    setIsMobile(isMobile())
  }, [])

  const smsBody = `${givenName}, here's the link to the estimate: ${estimateUrl}`

  const composeSms = () => {
    const smsLink = `sms:${mobilePhone}?body=${encodeURIComponent(smsBody)}`
    window.location.href = smsLink
  }


  return (
    <div id={urlKey} className="bg-white my-4 rounded-lg overflow-hidden">
      {showConvertToInvoice && 
      <div className="rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 border-b border-white">
        <div className="bg-indigo-700 w-full text-white text-center py-1 px-2"></div>
        <p className="bg-indigo-700 w-full text-white text-center py-1 px-2">Convert Estimate {estimateID} to an Invoice</p>
        <div className="bg-indigo-700 w-full text-white text-center flex justify-end">
          <button className="bg-indigo-700 text-left py-1 px-2" onClick={()=>setShowConvertToInvoice(false)}>Close</button>
          </div>
        </div >
      
        <AddInvoiceFromEstimate items={items} selectedCustomer={selectedCustomer} estimateID={estimateID} discount={discount} onClose={()=>{setShowConvertToInvoice(false); setConverted(true)}}/>
        
        </div>}
      
      {!showConvertToInvoice && <div>
        {!converted && expirationDateComparable >= today && origin.toLowerCase() !== "boretec.com" &&(
          <div className="bg-blue-700 text-white text-center p-1">
            <div className="grid grid-cols-3">
              <p className="pl-1 text-left">Estimate: {estimateID}</p>
              <p>Open</p>
              <p className="pr-1 text-right">
                $
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(subtotal + tax - discount)}
              </p>
            </div>
          </div>
        )}
        {!converted && expirationDateComparable < today && origin.toLowerCase() !== "boretec.com" && (
          <div className="bg-indigo-900 text-white text-center p-1">
            <div className="grid grid-cols-3">
              <p className="pl-1 text-left">Estimate: {estimateID}</p>
              <p>Expired</p>
              <p className="pr-1 text-right">
                $
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(subtotal + tax - discount)}
              </p>
            </div>
          </div>
        )}
        {!converted && origin.toLowerCase() === "boretec.com" && !updatedNotes && (
          <div className="bg-pink-700 text-white text-center">
            <div className="grid grid-cols-3 p-1">
              <p className="pl-1 text-left">Estimate: {estimateID}</p>
              <p className="animate-pulse">Follow Up - Add Notes</p>
              <p className="pr-1 text-right">
                $
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(subtotal + tax - discount)}
              </p>
            </div>
          </div>
        )}
          {!converted && origin.toLowerCase() === "boretec.com" && updatedNotes && (
          <div className="bg-cyan-700 text-white text-center p-1">
            <div className="grid grid-cols-3">
              <p className="pl-1 text-left">Estimate: {estimateID}</p>
              <p>Open</p>
              <p className="pr-1 text-right">
                $
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(subtotal + tax - discount)}
              </p>
            </div>
          </div>
        )}
        {converted && (
          <div className="bg-emerald-600 text-white text-center p-1">
            <div className="grid grid-cols-3">
              <p className="pl-1 text-left">Estimate: {estimateID}</p>
              <p>Converted</p>
              <p className="pr-1 text-right">
                $
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(subtotal + tax - discount)}
              </p>
            </div>
          </div>
        )}
        <div className="border-r border-l border-gray-200">
        <div className="grid grid-cols-3 p-1 ">
          <div className="flex items-top">
            <a href={`https://${companyUrl}`} target="_blank">
              <CompanyLogo companyName={companyUrl} />
            </a>
          </div>
          <div>
            <div className="flex items-center mt-1 space-x-2">
            <a href={`/sales?customers?${companyName.replace(/\s/g, "*")}`} className="flex justify-center w-full">
              <p className="w-full text-center font-medium text-lg">
                {companyName}
              </p>
              </a>
            </div>
          </div>
          <div className="text-right font-medium">
            {expirationDate && (
              <p className="">
                Expires: {expirationDateFormatted.toString().slice(0, 15)}
              </p>
            )}
          </div>
        </div>
        <div className="text-center text-gray-700 py-1 border-r">
          {/* Mobile view */}
          {isMobile && (
            <table className="min-w-full divide-y divide-gray-200 border-b border-gray-200">
              <thead className="">
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-1 text-xs font-medium uppercase"
                  >
                    Quantity
                  </th>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedItems.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {item.quantity}
                    </td>
                    <td className="px-2 py-1">{item.name}</td>
                    <td className="px-2 py-1 whitespace-nowrap">
                    $
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(item.retailPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Desktop view */}
          {!isMobile && (
            <table className="min-w-full divide-y divide-gray-200 border-b border-gray-200">
              <thead className="">
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-1 text-xs font-medium uppercase"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 text-xs font-medium uppercase"
                  >
                    Part Number
                  </th>
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
                  <th
                    scope="col"
                    className="px-2 py-1 text-xs font-medium uppercase"
                  >
                    Line Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedItems.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {item.quantity}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {item.partNumber}
                    </td>
                    <td className="px-2 py-1">{item.name}</td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      $
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(item.retailPrice)}
                    </td>
                    {/* Assuming lineAmount calculation */}
                    <td className="px-2 py-1 whitespace-nowrap">
                    $
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(item.quantity * item.retailPrice)}
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="grid md:grid-cols-2">
          <div className="px-2 flex items-end order-2 md:order-1">
            <div className="">
              <div>
                {origin === "boretec.com" ? <p>Origin: {origin}</p> : <p>Origin: {origin.slice(0, 1).toUpperCase() + origin.slice(1)}</p> }
              </div>
              <p>
                Date Created: {new Date(dateCreated).toString().slice(0, 15)}
              </p>
            </div>
          </div>
          <div className="text-right px-2 order-1 md:order-2">
            <p>
              Subtotal: $
              {new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(subtotal)}
            </p>
            {discount > 1 && (
              <p>
                {discount.toFixed(2)}% discount: -$
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format((discount / 100) * subtotal)}
              </p>
            )}
            <p>
              Tax: $
              {new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(tax)}
            </p>
            <p className="font-semibold">
              Total: $
              {new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(subtotal - (discount / 100) * subtotal + tax)}
            </p>
          </div>
        </div>
        <div className="text-gray-900 text-center bg-gray-50">
        <div className="border-t bg-gray-50 border-gray-300">
          {!showNotes && (
            <div
              onClick={() => setShowNotes(true)}
              className="text-center py-1 cursor-pointer"
            >
              Notes
            </div>
          )}
          {showNotes && (
            <div
              onClick={() => setShowNotes(false)}
              className="text-center py-1 cursor-pointer"
            >
              Hide Notes
            </div>
          )}
        </div>

      </div>
        {showNotes && (
        <div className="border-t border-gray-300">
          {notes ? (<div className="px-1 whitespace-pre-wrap text-sm">{updatedNotes}</div>) :(<div className="px-1 py-1 whitespace-pre-wrap text-sm">No notes have been taken for this estimate.</div>)}
          {!converted && <div className="updatedNotes">
            <p className="date text-sm px-1">{todaySliced} {name ? `(${name.slice(0,1).toUpperCase()+name.slice(1)})`: ""}:</p>
            <textarea
              className="notes text-gray-600 bg-white font-light h-full w-full px-1"
              contentEditable="true"
              value={textareaValue}
              onChange={(e) => {
                setTextareaValue(e.target.value)
                setUnsavedNotes(true)
              }}
              placeholder="new note..."
            ></textarea>
          </div>}
        </div>
      )}
        {unsavedNotes && (
        <div
          className="bg-purple-700 text-white text-center cursor-pointer py-1"
          onClick={() => {
            setUnsavedNotes(false); setTextareaValue('')
          }}
        >
          Discard Notes
        </div>
      )}
      {unsavedNotes && (
        <div
          className="bg-blue-700 text-white text-center cursor-pointer py-1"
          onClick={() => saveNotes()}
        >
          Save Notes
        </div>
      )}
        {converted && <div className=" text-gray-900 text-center bg-gray-50">

          {showDetails ? (
            <button
              className="border-t bg-gray-50 border-gray-300 text-center py-1 cursor-pointer w-full"
              onClick={() => setShowDetails(false)}
            >
              Hide Details
            </button>
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="border-t bg-gray-50 border-gray-300 text-center py-1 cursor-pointer w-full"
            >
              Show Details
            </button>
          )}
        </div>}
        {!converted && <div className="md:grid md:grid-cols-2 sm:grid-cols-1 text-gray-900 text-center bg-gray-50">
          <div className="bg-gray-50 border-t border-gray-300">
            <button className="text-center py-1 cursor-pointer md:border-r border-gray-300 w-full" onClick={()=>{setShowConvertToInvoice(true)}}>
              Convert to Invoice
            </button>
          </div>
          {showDetails ? (
            <button
              className="border-t bg-gray-50 border-gray-300 text-center py-1 cursor-pointer w-full"
              onClick={() => setShowDetails(false)}
            >
              Hide Details
            </button>
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="border-t bg-gray-50 border-gray-300 text-center py-1 cursor-pointer w-full"
            >
              Show Details
            </button>
          )}
        </div>}
        {showDetails && (
          <div className="bg-white">
            <div className="grid md:grid-cols-3 md:justify-items-center pb-2 px-2 border-t border-gray-300">
              <div className="pt-2">
                <div className="flex space-x-1">
                  <p className="font-medium"> {givenName}</p>
                  <p className="font-medium"> {familyName}</p>
                </div>
                
                <p>
                  <span className="font-medium">Primary email:</span>{' '}
                  {primaryEmail}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {primaryPhone}
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
                {shipAddressCity && <p>{shipAddressCity}</p>}
                {shipAddressState && <p>{shipAddressState}</p>}
              </div>
              <div className="pt-2">
                <p className="font-medium">Billing Address:</p>

                <p>{billAddressLine1}</p>
                <p>
                  {billAddressCity}
                  {billAddressCity ? ', ' : ''}
                  {billAddressState}{' '}
                </p>
                <p>{billAddressPostalCode}</p>
                <p>{country}</p>
              </div>
            </div>
            {message && (
              <div className="w-full p-2">
                <p>Message:</p>
                <p>{message}</p>
              </div>
            )}
            {JSON.parse(emails).length > 0 && (
              <div className="w-full p-2">
                <p>Additional Emails:</p>
                <div className="flex">
                  {JSON.parse(emails).map((email: string, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-200 rounded-lg m-1 py-1 px-2"
                    >
                      {email}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
        {mobilePhone ? (
          <div className="md:grid md:grid-cols-3 sm:grid-cols-1 text-white text-center bg-gray-900">
            <button
              onClick={copyToClipboard}
              className="md:border-r border-b md:border-b-0 border-gray-50 py-1 w-full"
            >
              Copy Estimate Link
            </button>

            <a href="#" onClick={composeSms}>
              <div className="md:border-r border-b md:border-b-0 border-gray-50 py-1">
                Text Estimate
              </div>
            </a>
            <a href={`tel:${primaryPhone}`} style={{ textDecoration: 'none' }}>
              <div className="py-1">Call</div>
            </a>
          </div>
        ) : (
          <div className="md:grid md:grid-cols-2 sm:grid-cols-1 text-white text-center bg-gray-900">
            <button onClick={copyToClipboard} className="md:border-r border-b md:border-b-0 border-gray-50 py-1 w-full">
              
                Copy Estimate Link
             
            </button>

            <a href={`tel:${primaryPhone}`} style={{ textDecoration: 'none' }}>
              <div className="py-1">Call</div>
            </a>
          </div>
        )}
      </div>}
    </div>
  )
}
export default EstimateCard
