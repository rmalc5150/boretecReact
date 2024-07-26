'use client'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';
import React, { useEffect, useState, useRef } from 'react'


export interface InventoryItem {
  partNumber: string
  name: string
  quantity: number
  description: string
  images: string
  type: string
  vendors: string
  location: string
  cost: number
  manufactPartNum: string
  manufacturer: string
  quantityNeeded: number
  docFileName: string
  items: string
  isVisible: boolean

}

interface InventoryProps {
  onClose: () => void;
  onSave: () => void;
}

const InventorySearch: React.FC<InventoryProps> = ({onClose, onSave }) => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saving, setSavingStatus] = useState(false)





  useEffect(() => {
    fetchInventoryItems()
  }, [])

  const fetchInventoryItems = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_inventory_select_all_rentals',
      Payload: JSON.stringify({}),
    };
    setIsLoading(true);
    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      setIsLoading(false);
      const payloadString = new TextDecoder().decode(response.Payload);
      const payloadObject = JSON.parse(payloadString);
  
      if (Array.isArray(payloadObject)) {
        const itemsWithVisibility = payloadObject.map((item) => ({
          ...item,
          isVisible: true // Set isVisible to true for all items initially
        }));
  
        setInventory(itemsWithVisibility);
        
      }
    } catch (error) {
      console.error('Error fetching inventory items', error);
      setIsLoading(false)
    }
  };



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
          const itemText = `${item.partNumber} ${item.description}`.toLowerCase()
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
        item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const addToItems = (itemToAdd: InventoryItem) => {
    const existingItemIndex = items.findIndex(
      (it) => it.partNumber === itemToAdd.partNumber
    );
    if (existingItemIndex > -1) {
      // If item exists, update the quantityNeeded by incrementing by 1
      const updatedItems = items.map((it, idx) =>
        idx === existingItemIndex ? { ...it, quantityNeeded: it.quantityNeeded + 1 } : it
      );
      setItems(updatedItems);
    } else {
      // Add new item with quantityNeeded initialized to 1
      setItems((prevItems) => [
        ...prevItems,
        { ...itemToAdd, quantityNeeded: 1 }, // Set quantityNeeded to 1 here
      ]);
    }
};

const handleChange = (index: number, quantityNeeded: string, maxValue: string) => {
  const newItems = items.map((item, idx) => {
    if (idx === index) {
      // Parse the input and use Math.min to cap it at item.quantity
      const parsedQuantity = parseInt(quantityNeeded, 10);
const parsedMaxValue = parseInt(maxValue, 10);
      const validQuantity = Math.min(parsedQuantity, parsedMaxValue) || 1;

      // Update quantityNeeded with the validated and capped quantity
      return { ...item, quantityNeeded: validQuantity }
    }
    return item;
  });

  setItems(newItems);
};




  const removeItem = (itemToRemove: InventoryItem) => {
    // Create a new array excluding the item to remove
    const updatedItems = items.filter(
      (item) => item.partNumber !== itemToRemove.partNumber
    )

    // Update the state with the new array
    setItems(updatedItems)
  }

  const handleSave = async () => {
    //lambda to insert objects into rentals table.

    //console.log(items);
    const payload = {
      items
    }
  
  const params: InvokeCommandInput = {
      FunctionName: 'boretec_add_item_to_rentals',
      Payload: JSON.stringify(payload)
  };
  
  setSavingStatus(true);
    try {
        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);

        const result = JSON.parse(new TextDecoder("utf-8").decode(response.Payload));
        console.log(result);
        if (result.statusCode === 200 && !result.duplicates) {
          onSave();
          onClose();  
        } else if (result.statusCode === 200 && result.duplicates){
          alert(`These item(s) already exist in the rentals database: ${result.duplicates}`);
          onSave();
          onClose();  
        } else {
            // Display error message from Lambda response if available
            const errorMessage = result.errorMessage || 'Failed to upload the file.';
           alert("There was a problem: item(s) weren't added).")
           setSavingStatus(false);
        }
    } catch (error) {
        // Detailed error logging
        console.error('Error invoking Lambda function', error);
    }
  }


  return (
    <div>
    <section className="text-gray-600">
      {items.length === 0 && <div className="py-2 w-full text-center">
        <p className="">No items have been selected.</p>
  
      </div>}
      {items.length != 0 && (
        <div className="bg-white text-gray-600">
 
          <table className="leading-normal w-full text-center py-9 pb-4">
            <thead>
              <tr className="text-center border-b border-gray-200">
              <th className="">Needed</th>
                <th className="">Stock</th>
                 
                <th>Part Number</th>
                <th>Description</th>
               
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
                      value={item.quantityNeeded || 0}
                      onChange={(e) => handleChange(index, e.target.value, item.quantity.toString())}
                      className={`w-20 cursor-pointer appearance-none w-20 rounded-0 px-1 text-center leading-tight focus:outline-gray-600 focus:text-white focus:bg-gray-600 `}
                    />
                  </td>
                  <td className="px-1">
                    {item.quantity}
                  </td>


                  <td className="px-1">
                    {item.partNumber}
                  </td>
                  <td className="px-1">
                    {item.description}
                  </td>
      
                  <td>
                    <button onClick={() => removeItem(item)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        className="h-4 px-1 opacity-70"
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
 {/*<div ref={bottomRef} />*/}
      <div className="">

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
              placeholder="Search available inventory"
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
            
            <div className="h-60 overflow-y-auto">
              <table className="leading-normal w-full">
                <thead>
                  <tr className="text-center">
                  <th></th>
                  <th>Stock</th>
                    <th>Part Number</th>
                    <th>Description</th>
                  
                  </tr>
                </thead>
                <tbody>
                  {visibleInventory.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer h-12 text-center`}
                      onClick={() => addToItems(item)}
                    >
                      <td className="px-1 w-20">
                        {item.images !==
                          'https://boretec.com/images/image-coming-soon.png' && ( 
                          <img className="rounded-md w-12 h-16 object-contain" src={item.images} />
                        )}
                      </td>
                      <td className="px-1">{item.quantity}</td>
                      <td className="px-1">
                        {item.partNumber} 
                      </td>
                      <td className="px-1">
                       {item.description}
                      </td>
                     
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {items.length > 0 ? (<div className="">

          <button
            className="bg-black py-1 px-2 text-white w-full rounded-b-sm"
            onClick={handleSave}>
            {saving ? <span className="animate-pulse">Saving...</span> : <span>Add Selected Equipment</span>}
          </button>
          </div>) : (<div className="">

<button
  className="bg-black py-1 px-2 text-white w-full rounded-b-sm"
  onClick={onClose}
>
  Close
</button>
</div>)}
      </div>

    </section>
    
    </div>
  )
}

export default InventorySearch
