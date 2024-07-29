'use client'

import React, { useEffect, useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import AddInvoice from "../cards/AddInvoice"
import { invoiceCards } from '../cards/InvoiceCard'
import InvoiceCard from '../cards/InvoiceCard'
//import { useNavigate } from 'react-router-dom';
import { useRouter } from "next/router";


const Invoices: React.FC<{ searchedTerm: string }> = ({ searchedTerm }) => {
const [showAddInvoice, setShowAddInvoice] = useState(false)
const [invoices, setInvoices] = useState<invoiceCards[]>([])
const [searchTerm, setSearchTerm] = useState('')
const [isInputFocused, setIsInputFocused] = useState(false)
const [isLoading, setIsLoading] = useState(false)
const [urlSearch, setUrlSearch] = useState(searchedTerm)
const router = useRouter();

useEffect(() => {
  fetchinvoices();
}, []);



const fetchinvoices = async () => {
  setIsLoading(true);
  const params: InvokeCommandInput = {
    FunctionName: 'boretec_invoices_selectAll',
    Payload: JSON.stringify({}),
  };

  try {
    const command = new InvokeCommand(params);
    const response = await lambdaClient.send(command);
    const payloadString = new TextDecoder().decode(response.Payload);
    const payloadObject = JSON.parse(payloadString);

    if (Array.isArray(payloadObject)) {
      const itemsWithVisibility = payloadObject.map((item) => ({
        ...item,
        isVisible: true, // Set isVisible to true for all items initially
      }))
      //console.log(itemsWithVisibility);
      setInvoices(itemsWithVisibility)
      setIsLoading(false)
    }

  } catch (error) {
    console.error('Error fetching invoices', error);
  }
};

const handleInputFocus = () => {
  setIsInputFocused(true)
}

const handleInputBlur = () => {
  setIsInputFocused(false)
}

const handleSearch = (search:string) => {
  const newSearchTerm = search.toLowerCase()


  if (!newSearchTerm.trim()) {
    // If the search term is empty, set all items to visible
    setInvoices(
      invoices.map((item) => ({ ...item, isVisible: true }))
    )
  } else {
    // Otherwise, filter based on the search term
    const searchWords = newSearchTerm.split(/\s+/)
    setInvoices(
      invoices.map((item) => {
        const itemText =
          `${item.displayName} ${item.customerEmail} ${item.invoiceNumber} ${item.itemsDescription} ${item.invoiceItems}`.toLowerCase()
        const isVisible = searchWords.every((word) => itemText.includes(word))
        return { ...item, isVisible }
      })
    )
  }
}

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setUrlSearch('');
  setSearchTerm(event.target.value);
  handleSearch(event.target.value);
  
};

// Determine the count of visible items
const visibleItemCount = invoices.filter(
  (invoice) => invoice.isVisible
).length
  
const handleClearSearch = () => {

  setSearchTerm('');
  // Reset all items to be visible when the search is cleared
  setInvoices(invoices.map(item => ({ ...item, isVisible: true })));
  
};

  //accept search from URL
  useEffect(() => {
    const fullUrl = window.location.href;
    const partToSearch = fullUrl.includes('?') ? fullUrl.split('?')[2] : '';

    if (partToSearch) {
      setUrlSearch(partToSearch.toLowerCase());
      router.push('/sales');
    }
  }, []);

  useEffect(() => {
    if (urlSearch) {
      setSearchTerm(urlSearch)
      handleSearch(searchedTerm)
    } 
  }, [visibleItemCount]);



  const onClose = () => {
    setShowAddInvoice(false);
    fetchinvoices();
  }

  
    

  return (
    <section className="">
    <div className={`${showAddInvoice ? "mb-10":""} overflow-hidden`}>
    {showAddInvoice && 
    <div className="rounded-lg overflow-hidden mt-1 border border-gray-200">
      <div className="grid grid-cols-3 border-b border-white">
      <div className="bg-black w-full text-white text-center py-1 px-2"></div>
      <p className="bg-black w-full text-white text-center py-1 px-2">New Invoice</p>
      <div className="bg-black w-full text-white text-center flex justify-end">
        <button className="bg-black text-left py-1 px-2" onClick={()=>setShowAddInvoice(false)}>Close</button>
        </div>
      </div >
    
      <AddInvoice onClose={onClose}/>
      
      </div>}

    {!showAddInvoice && <div className="">
      <div className="flex mt-2 mb-5">
      <div className={`md:flex-grow w-full flex justify-between items-end ${isInputFocused ? 'border-gray-500' : 'border-gray-200 hover:border-gray-300'} border bg-white rounded-lg py-1 pl-3`}>
      <input
        type="text"
        id="searchInput"
        className="w-full outline-none focus:outline-none focus:ring-0 placeholder:text-gray-500 placeholder:font-light"
        placeholder="Search invoices"
        value={searchTerm} // Ensure this correctly references the state
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        
      />
              {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="pr-2 border-r border-gray-500 text-xs text-bottom text-gray-500 font-light hover:text-gray-600"
            type="button"
          >
            clear {/* This is a Unicode 'X' character: &#x2715; */}
          </button>
        )}
      <div className="whitespace-nowrap text-bottom text-right text-xs text-gray-500 font-light ml-2 pr-1">
        {visibleItemCount} item(s)
      </div>
    </div>
    <div className="flex justify-start items-start">
    <button className="whitespace-nowrap text-gray-900 py-1 px-3" onClick={()=>{setShowAddInvoice(true)}}>+ Invoice</button>
    </div>
      </div>
      
      {isLoading && (
          <div className="flex w-full justify-center items-center">
            <div>
        <p className="text-center animate-pulse">Loading...</p>


            </div>
            </div>
        )}
      {invoices.map((invoice, index) => (
        <div key={index} className={`${
          invoice.isVisible ? '' : 'hidden'
        }`}>
<InvoiceCard
isVisible={invoice.isVisible}
totalTax={invoice.totalTax}
customerBalance={invoice.customerBalance}
mobilePhone={invoice.mobilePhone}
  invoiceNumber={invoice.invoiceNumber}
  displayName={invoice.displayName}
  companyName={invoice.companyName}
  itemsDescription={invoice.itemsDescription}
  itemsDetailType={invoice.itemsDetailType}
  customerEmail={invoice.customerEmail}
  customerPhone={invoice.customerPhone}
  itemsQuantity={invoice.itemsQuantity}
  linesRefNames={invoice.linesRefNames}
  total={invoice.total}
  linesAmounts={invoice.linesAmounts}
  linesTypes={invoice.linesTypes}
  linesUnitPrice={invoice.linesUnitPrice}
  dueDate={invoice.dueDate}
  pdf={invoice.pdf}
  billEmail={invoice.billEmail}
  shipMethod={invoice.shipMethod}
  salesTerm={invoice.salesTerm}
  subTotal={invoice.subTotal}
  taxable={invoice.taxable}
  invoiceStatus={invoice.invoiceStatus}
  shipAddressLine1={invoice.shipAddressLine1}
  shipAddressLine2={invoice.shipAddressLine2}
  invoiceItems={invoice.invoiceItems}
  shipAddressLine4={invoice.shipAddressLine4}
  qboUrl = {invoice.qboUrl}
  openTime={invoice.openTime}
  emailId = {invoice.emailId}
  deliveredTime={invoice.deliveredTime}
  clickTime={invoice.clickTime}
  billAddressCountry={invoice.billAddressCountry}
  billAddressLine1={invoice.billAddressLine1}
  billAddressLine2={invoice.billAddressLine2}
  message={invoice.message}
  salesPerson={invoice.salesPerson}
  trackingNumber={invoice.trackingNumber}
  billAddressCity={invoice.billAddressCity}
  billAddressPostalCode={invoice.billAddressPostalCode}
  billAddressState={invoice.billAddressState}
  dateCreated={invoice.dateCreated}
  billAddressLine3 = {invoice.billAddressLine3} 
  billAddressLine4 ={invoice.billAddressLine4} 
  shipAddressCity = {invoice.shipAddressCity}
  shipAddressState={invoice.shipAddressState} 
  shipAddressPostalCode = {invoice.shipAddressPostalCode}
  poNumber= {invoice.poNumber}
  shipDate = {invoice.shipDate}
  shipping = {invoice.shipping}
  discount = {invoice.discount}
/>

          </div>
        ))}
      </div>}
      </div>
    </section>
  )
}

export default Invoices;
