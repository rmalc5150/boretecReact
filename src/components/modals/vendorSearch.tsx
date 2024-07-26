'use client'

import React, { useEffect, useState, useRef } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'

export interface VendorItem {
  vName: string
  vUrl: string
  vPartNumber: string
  vLeadTime: number
  vCost: number
  vPaymentMethod: string
  qboID: number
  isVisible: boolean
  [key: string]: string | number | boolean;
  
}

interface VendorProps {
  //changeCustomer: () => void;
  handleAddVendor: (vendor:VendorItem) => void; // Callback now accepts a single VendorItem
}

const VendorSearch: React.FC<VendorProps> = ({ handleAddVendor }) => {
  const [vendors, setVendors] = useState<VendorItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [vendorSaving, setVendorSaving] = useState(false)
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorNumber, setNewVendorNumber] = useState('');



  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    setIsLoading(true)
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_selectAll_vendors_names_qboID',
      Payload: JSON.stringify({}),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject)
      if (Array.isArray(payloadObject)) {
        const itemsWithVisibility = payloadObject.map((item) => ({
          ...item,
          isVisible: true, // Set isVisible to true for all items initially
        }))

        setVendors(itemsWithVisibility)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error fetching vendors', error)
    }
  }

  const addNewVendor = async () => {
    setVendorSaving(true)

    const payload = {
      newVendorName, 
      newVendorNumber
    };

    const params: InvokeCommandInput = {
      FunctionName: 'boretec_new_vendor_to_qbo',
      Payload: JSON.stringify(payload),
    }
    //console.log(payload);
    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject)
      if (payloadObject.statusCode === 200) {

        setTimeout(() => {
          setNewVendorName("");
          setNewVendorNumber("");
          fetchVendors(); 
          setVendorSaving(false)
          setShowAddVendor(false) 
      }, 5000);
      
        
      } else {
        alert("New Vendor didn't save.")
        setVendorSaving(false)
        }

      
    } catch (error) {
      console.error('Error saving vendor', error)
    }
  }

  const handleInputFocus = () => {
    setIsInputFocused(true)
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value.toLowerCase()
    setSearchTerm(newSearchTerm)

    if (!newSearchTerm.trim()) {
      // If the search term is empty, set all items to visible
      setVendors(vendors.map((item) => ({ ...item, isVisible: true })))
    } else {
      // Otherwise, filter based on the search term
      const searchWords = newSearchTerm.split(/\s+/)
      setVendors(
        vendors.map((item) => {
          const itemText = `${item.vName}`.toLowerCase()
          const isVisible = searchWords.every((word) => itemText.includes(word))
          return { ...item, isVisible }
        })
      )
    }
  }



  const visibleVendor = vendors.filter(
    (item) =>
      item.isVisible &&
      (item.vName.toLowerCase().includes(searchTerm.toLowerCase()))
  )





  return (
    <section className="text-gray-600">

      <div className="">

        {!showAddVendor && <div className="md:flex mx-1 py-2">
          <div
            className={`md:flex-grow w-full flex justify-between items-end ${
              isInputFocused
                ? 'border-gray-500'
                : 'border-gray-200 hover:border-gray-300'
            } border bg-white rounded-lg py-1 pl-3`}
          >
            <input
              type="text"
              id="searchInput"
              className="flex-grow outline-none focus:outline-none focus:ring-0 placeholder:text-gray-500 placeholder:font-light"
              placeholder="Search..."
              value={searchTerm} // Ensure this correctly references the state
              onChange={handleSearch}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />

          </div>
          <button className="whitespace-nowrap px-1" onClick={()=>setShowAddVendor(true)}>+ Vendor</button>
        </div>}

        {isLoading && (
          <div className="flex w-full justify-center items-center">
            <div>
              <p className="text-center animate-pulse">Loading...</p>
            </div>
          </div>
        )}

        {!isLoading && visibleVendor.length > 0 && !showAddVendor && (
          <div className="">
            
            <div className="h-48 overflow-y-auto">
            <table className="leading-normal w-full table-fixed">

  <tbody>
    {visibleVendor.map((vendor, index) => (
      <tr key={index} className="border-b h-12 border-gray-200 hover:bg-gray-50 text-center cursor-pointer"
          onClick={() => {
            const vendorWithDefaults: VendorItem = {
              ...vendor,
              vUrl: vendor.vUrl || '',
              vPartNumber: vendor.vPartNumber || '',
              vLeadTime: vendor.vLeadTime || 0,
              vCost: vendor.vCost || 0,
              vPaymentMethod: vendor.vPaymentMethod || ''
            };
            handleAddVendor(vendorWithDefaults);
            }}>
        <td className="whitespace-normal break-words px-1">
          {vendor.vName}
        </td>
      </tr>
    ))}
  </tbody>
</table>
            </div>
          
          </div>
        )}
      
      {showAddVendor && 
      <div className="text-left">
        <p className="w-full bg-gray-100 text-gray-900 text-center border-t border-b border-gray-300 ">New Vendor</p>
        <div className="m-1">
        <label htmlFor="vendorName">Name:</label>
        <input
          type="text"
          className="w-full bg-gray-100 rounded-md border border-gray-300 px-1"
          value={newVendorName}
          onChange={(e) => setNewVendorName(e.target.value)}
        />
      </div>
      <div className="mx-1 mb-4">
        <label htmlFor="vendorNumber">Phone Number:</label>
        <input
          type="tel"
          className="w-full bg-gray-100 rounded-md border border-gray-300 px-1"
          value={newVendorNumber}
          onChange={(e) => setNewVendorNumber(e.target.value)}
        />
      </div>
        <button className="bg-black text-white text-center px-2 w-full" onClick={addNewVendor}>{vendorSaving ? "Saving..." :"Add New Vendor"}</button>
        <button className="bg-gray-600 border-t border-white text-white text-center px-2 w-full" onClick={()=>setShowAddVendor(false)}>Back</button>

        </div>
      }
      </div>

    </section>
  )
}

export default VendorSearch
