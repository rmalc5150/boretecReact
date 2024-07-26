'use client'

import React, { useEffect, useState, useRef } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'

export interface InventoryItem {
  partNumber: string
  name: string
  quantity: number
  retailPrice: number
  images: string
  qboID: number
  weight: number
  isVisible: boolean
}

interface InventoryProps {
  //changeCustomer: () => void;
  handleAddItems: (items: InventoryItem[]) => void; // Add a new prop for row click callback
  itemsProp: InventoryItem[];
  isMobile: boolean
}

const InventorySearch: React.FC<InventoryProps> = ({ handleAddItems, itemsProp, isMobile }) => {
  const [items, setItems] = useState<InventoryItem[]>(itemsProp)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  },[items]);

  useEffect(() => {
    fetchInventorys()
  }, [])

  const fetchInventorys = async () => {
    setIsLoading(true)
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_inventory_search_for_estimate_invoice',
      Payload: JSON.stringify({}),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)

      if (Array.isArray(payloadObject)) {
        const itemsWithVisibility = payloadObject.map((item) => ({
          ...item,
          isVisible: true, // Set isVisible to true for all items initially
        }))

        setInventory(itemsWithVisibility)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error fetching inventory', error)
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
      setInventory(inventory.map((item) => ({ ...item, isVisible: true })))
    } else {
      // Otherwise, filter based on the search term
      const searchWords = newSearchTerm.split(/\s+/)
      setInventory(
        inventory.map((item) => {
          const itemText = `${item.partNumber} ${item.name}`.toLowerCase()
          const isVisible = searchWords.every((word) => itemText.includes(word))
          return { ...item, isVisible }
        })
      )
    }
  }

  // Determine the count of visible items
  const visibleItemCount = inventory.filter(
    (customer) => customer.isVisible
  ).length

  const handleClearSearch = () => {
    setSearchTerm('')
    // Reset all items to be visible when the search is cleared
    setInventory(inventory.map((item) => ({ ...item, isVisible: true })))
  }

  const visibleInventory = inventory.filter(
    (item) =>
      item.isVisible &&
      (item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleChange = (index: number, quantity: string) => {
    const newInventory = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, quantity: parseInt(quantity, 10) || 0 }
      }
      return item
    })

    setItems(newInventory)
  }

  const addToItems = (item: InventoryItem) => {
    const existingItemIndex = items.findIndex(
      (it) => it.partNumber === item.partNumber
    )
    if (existingItemIndex > -1) {
      // If item exists, update the quantity
      const updatedItems = items.map((it, idx) =>
        idx === existingItemIndex ? { ...it, quantity: it.quantity + 1 } : it
      )
      setItems(updatedItems)
    } else {
      // Add new item with default quantity of 1 if not specified
      setItems((prevItems) => [
        ...prevItems,
        { ...item, quantity: item.quantity || 1 },
      ])
    }
    
  }
  const removeItem = (itemToRemove: InventoryItem) => {
    // Create a new array excluding the item to remove
    const updatedItems = items.filter(
      (item) => item.partNumber !== itemToRemove.partNumber
    )

    // Update the state with the new array
    setItems(updatedItems)
  }


  return (
    <section className="bg-gray-100 text-gray-600">

      {items.length != 0 && (
        <div className="bg-white text-gray-600">
 
          <table className="leading-normal w-full text-center mt-5 py-4">
            <thead>
              <tr className="text-center border-b border-gray-200">
                <th className={`${!isMobile ? "w-8" : "w-20"}`}>Quantity</th>
                {!isMobile && <th></th>}
                <th>Part Number - Description</th>
                <th>Price</th>
                {!isMobile && <th>Line total</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className={`border-b h-12 border-gray-200`}>
                  <td>
                    <input
                      type="number"
                      step="1"
                      value={item.quantity || 0}
                      onChange={(e) => handleChange(index, e.target.value)}
                      className={`${!isMobile ? "w-8" : "w-20"}cursor-pointer appearance-none w-20 rounded-0 px-1 text-center leading-tight focus:outline-gray-600 focus:text-white focus:bg-gray-600 `}
                    />
                  </td>
                  {!isMobile && <td className="px-1 w-20">
                    {item.images !==
                      'https://boretec.com/images/image-coming-soon.png' && (
                      <img className="rounded-md h-12" src={item.images} />
                    )}
                  </td>}
                  <td className="px-1">
                    {item.partNumber} - {item.name}
                  </td>
                  <td className="px-1">
                    $
                    {new Intl.NumberFormat('en-US', {
                      style: 'decimal',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(item.retailPrice)}
                  </td>
                  {!isMobile && <td className="px-1">
                    $
                    {new Intl.NumberFormat('en-US', {
                      style: 'decimal',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(item.retailPrice * item.quantity)}
                  </td>}
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
      )}

      <div className="">
      <div className="p-1 text-gray-700 text-sm italic flex justify-center items-center text-gray-600 bg-gray-200 w-full border-t border-b border-gray-300">
              <p className="">Add Items.</p>
            </div>
        <div className="md:flex mx-1 py-2">
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
              className="w-full outline-none focus:outline-none focus:ring-0 placeholder:text-gray-500 placeholder:font-light"
              placeholder="Search inventory"
              value={searchTerm} // Ensure this correctly references the state
              onChange={handleSearch}
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
        </div>

        {isLoading && (
          <div className="flex w-full justify-center items-center">
            <div>
              <p className="text-center animate-pulse">Loading...</p>
            </div>
          </div>
        )}

        {!isLoading && visibleInventory.length > 0 && (
          <div className="">
            
            <div className="h-48 md:h-96 overflow-y-auto">
              <table className="leading-normal w-full">
                <thead>
                  <tr className="text-center">
                  {!isMobile && <th></th>}
                    <th>Part Number - Description</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleInventory.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b h-12 border-gray-200 hover:bg-gray-50 cursor-pointer`}
                      onClick={() => addToItems(item)}
                    >
                      {!isMobile && <td className="px-1">
                        {item.images !==
                          'https://boretec.com/images/image-coming-soon.png' && (
                          <img className="rounded-md h-12" src={item.images} />
                        )}
                      </td>}
                      <td className="border-r border-gray-200 px-1">
                        {item.partNumber} - {item.name}
                      </td>
                      <td className="px-1">
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
            </div>
          </div>
        )}
        {items.length > 0 && <div className="">

          <button
            className="bg-black py-1 px-2 text-white w-full"
            onClick={() => handleAddItems(items)}
          >
            Save and Continue
          </button>
          </div>}
      </div>
      <div ref={bottomRef} />
    </section>
  )
}

export default InventorySearch
