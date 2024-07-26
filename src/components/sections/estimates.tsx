'use client'

import React, { useEffect, useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
//import { useNavigate } from 'react-router-dom';
import { useRouter } from "next/router";
import EstimateCard, { EstimateCards } from '../cards/EstimateCard'
import AddEstimate from '../cards/AddEstimate'


const Estimates: React.FC<{ searchedTerm: string }> = ({ searchedTerm }) => {
  const [showAddEstimate, setShowAddEstimate] = useState(false)
const [estimates, setEstimates] = useState<EstimateCards[]>([])
const [searchTerm, setSearchTerm] = useState('')
const [isInputFocused, setIsInputFocused] = useState(false)
const [isLoading, setIsLoading] = useState(false)
const [urlSearch, setUrlSearch] = useState(searchedTerm)
const router = useRouter();

useEffect(() => {
  fetchestimates();
}, []);



const fetchestimates = async () => {
  setIsLoading(true);
  const params: InvokeCommandInput = {
    FunctionName: 'boretec_estimates_selectAll',
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
      setEstimates(itemsWithVisibility)
      setIsLoading(false)
    }

  } catch (error) {
    console.error('Error fetching estimates', error);
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
    setEstimates(
      estimates.map((item) => ({ ...item, isVisible: true }))
    )
  } else {
    // Otherwise, filter based on the search term
    const searchWords = newSearchTerm.split(/\s+/)
    setEstimates(
      estimates.map((item) => {
        const itemText =
          `${item.displayName} ${item.primaryEmail} ${item.estimateID}`.toLowerCase()
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
const visibleItemCount = estimates.filter(
  (estimate) => estimate.isVisible
).length
  
const handleClearSearch = () => {

  setSearchTerm('');
  // Reset all items to be visible when the search is cleared
  setEstimates(estimates.map(item => ({ ...item, isVisible: true })));
  
};



useEffect(() => {
  if (urlSearch) {
    setSearchTerm(urlSearch)
    handleSearch(searchedTerm)
  } 
}, [visibleItemCount]);



  
  const onClose = () => {
    setShowAddEstimate(false);
    fetchestimates();
  }

 

  return (
    <section className={``}>
    <div className={`${showAddEstimate ? "mb-10":"border-gray-300"} overflow-hidden`}>
    {showAddEstimate && 
    <div className="rounded-lg overflow-hidden">
      <div className="grid grid-cols-3 border-b border-white">
      <div className="bg-blue-700 w-full text-white text-center py-1 px-2"></div>
      <p className="bg-blue-700 w-full text-white text-center py-1 px-2">New Estimate</p>
      <div className="bg-blue-700 w-full text-white text-center flex justify-end">
        <button className="bg-blue-700 text-left py-1 px-2" onClick={()=>setShowAddEstimate(false)}>Close</button>
        </div>
      </div >
    
      <AddEstimate onClose={onClose}/>
      
      </div>}
    {!showAddEstimate && <div className="">
    <div className="flex mt-2 mb-5">
      <div className={`md:flex-grow w-full flex justify-between items-end ${isInputFocused ? 'border-gray-500' : 'border-gray-200 hover:border-gray-300'} border bg-white rounded-lg py-1 pl-3`}>
      <input
        type="text"
        id="searchInput"
        className="w-full outline-none focus:outline-none focus:ring-0 placeholder:text-gray-500 placeholder:font-light"
        placeholder="Search estimates"
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
   <button className="whitespace-nowrap text-gray-900 py-1 px-3" onClick={()=>setShowAddEstimate(true)}>+ Estimate</button>
      </div>
      
      {isLoading && (
          <div className="flex w-full justify-center items-center">
            <div>
        <p className="text-center animate-pulse">Loading...</p>


            </div>
            </div>
        )}
      {estimates.map((estimate, index) => (
        <div key={index} className={`${
          estimate.isVisible ? '' : 'hidden'
        }`}>
<EstimateCard
  urlKey={estimate.urlKey}
  estimateID={estimate.estimateID}
  items={estimate.items} // Assuming this is the stringified JSON of items
  displayName={estimate.displayName}
  familyName={estimate.familyName}
  givenName={estimate.givenName}
  companyName={estimate.companyName}
  primaryEmail={estimate.primaryEmail}
  primaryPhone={estimate.primaryPhone}
  billAddressCity={estimate.billAddressCity}
  billAddressLine1={estimate.billAddressLine1}
  billAddressLine2={estimate.billAddressLine2} // Assuming there's a mechanism to handle null values
  billAddressState={estimate.billAddressState}
  billAddressPostalCode={estimate.billAddressPostalCode}
  country={estimate.country}
  fullyQualifiedName={estimate.fullyQualifiedName}
  shipAddressState={estimate.shipAddressState}
  shipAddressCity={estimate.shipAddressCity}
  shipAddressLine1={estimate.shipAddressLine1}
  shipAddressLine2={estimate.shipAddressLine2} // Assuming there's a mechanism to handle null values
  shipAddressPostalCode={estimate.shipAddressPostalCode}
  customerType={estimate.customerType}
  mobilePhone={estimate.mobilePhone}
  tax={estimate.tax}
  subtotal={estimate.subtotal} // Notice the change from subTotal to subtotal if necessary
  discount={estimate.discount}
  message={estimate.message}
  emails={estimate.emails} // Assuming this is the stringified JSON of emails
  expirationDate={estimate.expirationDate}
  dateCreated={estimate.dateCreated}
  origin={estimate.origin}
  converted={estimate.converted}
  isVisible={estimate.isVisible}
  selectedCustomer={estimate.selectedCustomer}
  notes={estimate.notes}

/>

          </div>
        ))}
      
      </div>}
      
      </div>
      {estimates.length === 0 && <div className="flex justify-center items-center h-20 text-gray-600 text-sm"><p>No estimtes to show. Click &quot;+ Estimate&quot; to create a new estimate.</p></div>}
    </section>
  )
}

export default Estimates;
