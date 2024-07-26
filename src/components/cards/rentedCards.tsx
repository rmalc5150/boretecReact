'use client';

//lazy load of the cards to reduce memory.

import React, { useEffect, useState } from 'react';

import RentedCardEditable from '../../components/cards/rentedCardEditable';

//import Menu from '../buttons/menu';

interface RentedItems {
    dateShipped: string | null;
    invoiceNumber: string;
    status: string;
    serialNumbers: string;
    customerPhone: string;
    description: string;
    isVisible: boolean
    imagesOut: string;
    imagesIn:string;
    dateExpected: string | null;
    invoiceItems: string;
    shippedDate: string;
    quantity: number;
    NumberOfPieces: number;
    totalWeight: number;
    dimensions: string;
    trackingNumber: string;
    shipAddressLine1: string;
    shipAddressLine2: string;
    shipAddressLine3: string;
    shipAddressLine4: string;
    shipMethod: string;
    companyName: string;
    itemsDescription: string;
    customerEmail: string;
    itemsQuantity: string;
    InvoiceDueDate: string;
    billEmail: string;
    dateAdded: string;
    shipAddressCity: string;
    shipAddressState: string;
    shipAddressPostalCode: string;
    itemsDetailType: string;
    shipDate: string;
    checked: boolean;
  }

const RentalsCards = () => {
  const [rentalsItems, setRentedItems] = useState<RentedItems[]>([]);
  const [showRentalsCardAdd, setShowRentalsCardAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [status, setStatus] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [rentedArray, setRentedArray] = useState<RentedItems[]>([]);
  const [filterCategory, setFilterCategory] = useState('All')

  const rentalCardsAll:RentedItems[] = [
    {
      "dateShipped": "2024-06-10",
      "invoiceNumber": "12876",  // Not available in the provided JSON
      "status": "",  // Not available in the provided JSON
      "serialNumbers": "",  // Not available in the provided JSON
      "customerPhone": "",  // Not available in the provided JSON
      "description": "6\" Auger x 1-5/8 Hex x 4'BTE # 80-0604X1-5/8",
      "isVisible": true,
      "dateExpected": "2024-06-25",
      "imagesOut": '["https://boretec.com/images/undefined-2024-05-30T10:17:30-h-200.png"]',
      "imagesIn": "",
      "invoiceItems":'[{"quantity":4,"partNumber":"80-1810X3","description":"18\\" auger 10\' long on 3\\" hex with 3/8\\" flights","unitPrice":2872,"lineAmount":11488}]',  // Not available in the provided JSON
      "shippedDate": "",  // Not available in the provided JSON
      "quantity": 1,
      "NumberOfPieces": 1,  // Assuming quantity represents NumberOfPieces
      "totalWeight": 45,  // Assuming weight
      "dimensions": "",  // Not available in the provided JSON
      "trackingNumber": "",  // Not available in the provided JSON
      "shipAddressLine1": "34 Glass House Rd",  // Not available in the provided JSON
      "shipAddressLine2": "",  // Not available in the provided JSON
      "shipAddressLine3": "",  // Not available in the provided JSON
      "shipAddressLine4": "",  // Not available in the provided JSON
      "shipMethod": "",  // Not available in the provided JSON
      "companyName": "Utility Company",  // Not available in the provided JSON
      "itemsDescription": "",  // Not available in the provided JSON
      "customerEmail": "example@utility.com",  // Not available in the provided JSON
      "itemsQuantity": "1",  // Assuming same as quantity
      "InvoiceDueDate": "",  // Not available in the provided JSON
      "billEmail": "example@utility.com",  // Not available in the provided JSON
      "dateAdded": "Jun 06 2024 13:49:20 (Eastern)",  // Assuming editDateTime
      "shipAddressCity": "Atlanta",  // Not available in the provided JSON
      "shipAddressState": "GA",  // Not available in the provided JSON
      "shipAddressPostalCode": "30033",  // Not available in the provided JSON
      "itemsDetailType": "",  // Not available in the provided JSON
      "shipDate": "",  // Not available in the provided JSON
      "checked": false  // Assuming default value as false
  },
  {
    "dateShipped": null,
    "invoiceNumber": "129834",  // Not available in the provided JSON
    "status": "",  // Not available in the provided JSON
    "serialNumbers": "['45663']",  // Not available in the provided JSON
    "customerPhone": "555-555-5555",  // Not available in the provided JSON
    "description": "30\" SRS steering head, cuts 32.5\" 12'Long, uses 10' long auger",
    "isVisible": true,
    "imagesOut": "",
    "imagesIn": '',
    "invoiceItems":'[{"quantity":1,"partNumber":"9954-6","description":"18\\" OTS with wing cutters","unitPrice":2872,"lineAmount":11488}]', 
    "shippedDate": "",  // Not available in the provided JSON
    "quantity": 1,
    "dateExpected": null,
    "NumberOfPieces": 1,  // Assuming quantity represents NumberOfPieces
    "totalWeight": 45,  // Assuming weight
    "dimensions": "",  // Not available in the provided JSON
    "trackingNumber": "",  // Not available in the provided JSON
    "shipAddressLine1": "Suite 200",  // Not available in the provided JSON
    "shipAddressLine2": "34 Electricity Way",  // Not available in the provided JSON
    "shipAddressLine3": "Fontana, CA 92352",  // Not available in the provided JSON
    "shipAddressLine4": "",  // Not available in the provided JSON
    "shipMethod": "",  // Not available in the provided JSON
    "companyName": "So Cal Edison",  // Not available in the provided JSON
    "itemsDescription": "",  // Not available in the provided JSON
    "customerEmail": "example@sce.com",  // Not available in the provided JSON
    "itemsQuantity": "1",  // Assuming same as quantity
    "InvoiceDueDate": "",  // Not available in the provided JSON
    "billEmail": "example@sce.com",  // Not available in the provided JSON
    "dateAdded": "Jun 11 2024 07:43:48 (Eastern)",  // Assuming editDateTime
    "shipAddressCity": "Fontana",  // Not available in the provided JSON
    "shipAddressState": "CA",  // Not available in the provided JSON
    "shipAddressPostalCode": "92352",  // Not available in the provided JSON
    "itemsDetailType": "",  // Not available in the provided JSON
    "shipDate": "",  // Not available in the provided JSON
    "checked": false  // Assuming default value as false
}

  ]




  const fetchRentedItems = async () => {

        setRentedItems(rentalCardsAll);
        
      
  };

useEffect(() => {
  fetchRentedItems();
},[]);

  const handleCloseRentalsCardAdd = () => {
    setShowRentalsCardAdd(false);
  };



  const handleShowRentalsCardAdd = () => {
    setShowRentalsCardAdd(true);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  const handleClearSearch = () => {

    setSearchTerm('');
    // Reset all items to be visible when the search is cleared
    setRentedItems(rentalsItems.map(item => ({ ...item, isVisible: true })));
    
  };



 const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value.toLowerCase();
    setSearchTerm(newSearchTerm);

    if (!newSearchTerm.trim()) {
      // If the search term is empty, set all items to visible
      setRentedItems(rentalsItems.map(item => ({ ...item, isVisible: true })));
    } else {
      // Otherwise, filter based on the search term
      const searchWords = newSearchTerm.split(/\s+/);
      setRentedItems(rentalsItems.map(item => {
        const itemText = `${item.invoiceItems} ${item.companyName}`.toLowerCase();
        const isVisible = searchWords.every(word => itemText.includes(word));
        return { ...item, isVisible };
      }));
    }
  };


  // Determine the count of visible items
  const visibleItemCount = rentalsItems.filter((item) => item.isVisible).length

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterCategory(event.target.value)
  }


  return (
<section className="mt-5">
      {rentedArray.length > 0 && <div className="mb-5">
      <h1>Rented:</h1>
      {/*rentedArray.map((item, index) => (
          <div key={index} className={`px-2 mb-4 w-full md:w-1/2 lg:w-1/3 ${item.isVisible ? '' : 'hidden'}`}>
            <RentedCardEditable {...item} />
          </div>
        ))*/}
      </div>}

      {!showRentalsCardAdd && <div>
 
      <div className="sticky top-0 py-1">

      <div className="mt-2 flex flex-col md:flex-row w-full space-y-2 md:space-y-0 md:space-x-2 items-center">
      <div className={`md:flex-grow w-full flex justify-between items-end ${isInputFocused ? 'border-gray-500' : 'border-gray-200 hover:border-gray-300'} border bg-white rounded-lg py-1 pl-3`}>
      <input
        type="text"
        id="searchInput"
        className="w-full outline-none focus:outline-none focus:ring-0 placeholder:text-gray-500 placeholder:font-light"
        placeholder="Search rentals"
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
  </div>
  </div>}

      <div className="flex justify-end my-2">
        <p className="py-1 px-2">Select a category:</p>
        <select
          value={filterCategory}
          onChange={handleCategoryChange}
          className="border py-1 px-2 border-gray-200 rounded-md"
        >
          <option value="All">All</option>
          <option value="Auger">Augers</option>
          <option value="Boring Machine">Boring Machines</option>
          <option value="Cutting Head">Cutting Heads</option>
          <option value="Steering Head">Steering Heads</option>
          <option value="Steering Station">Steering Stations</option>
          <option value="Steering System">Steering Systems</option>
    
          

        </select>
      </div>
     {status === "loading" && (      
     <div className="px-2 text-md font-thin h-screen w-full flex justify-center pt-5">
      <div className="text-center">
      <p className="font-bold">Double Click to edit.</p>
      <p className="font-bold">Tap the image to enlarge.</p>
      <p className="animate-pulse">Loading...</p>
      </div>
</div>
)}

      <div className="flex flex-wrap -mx-2 my-2">
        {rentalsItems.map((item) => (
          <div key={item.invoiceNumber} className={`px-2 mb-4 w-full md:w-1/2 ${item.isVisible ? '' : 'hidden'}`}>
            <RentedCardEditable {...item} />
          </div>
        ))}
      </div>

    </section>
  );
};

export default RentalsCards;
