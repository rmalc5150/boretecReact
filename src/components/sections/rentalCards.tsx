

import React, { useEffect, useState } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';
import RentalCardEditable from '../../components/cards/rentalCardEditable';
import RentalsCardAdd from '../../components/modals/inventorySearchRentals';
//import { useNavigate } from 'react-router-dom';
import { useRouter } from "next/router";

import Cookies from 'js-cookie'
//import Menu from '../buttons/menu';

interface RentalsItem {
  partNumber: string;
  name: string;
  description: string;
  quantity: number; 
  available: number;
  location: string;
  cost: number;      // Changed from number to string as per your schema
  retailPrice: number;
  weight: number;
  leadTime: number;
  images: string;    // This might be better as string[] if multiple images are expected
  type: string;
  category: string;
  showItem: string;
  editor: string;
  editDateTime: string;
  dynamicPricing: string;
  qboID: string;
  royalties: number; // Changed from boolean to number (tinyint)
  isVisible: boolean;
}

const RentalsCards = () => {
  const [rentalsItems, setRentalsItems] = useState<RentalsItem[]>([]);
  const [showRentalsCardAdd, setShowRentalsCardAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [status, setStatus] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [rentedArray, setRentedArray] = useState<RentalsItem[]>([]);
  //const navigate = useNavigate();
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState('All')






  const fetchRentalsItems = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_rentals_select_all',
      Payload: JSON.stringify({}),
    };
    setStatus('loading');
    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      setStatus('');
      const payloadString = new TextDecoder().decode(response.Payload);
      const payloadObject = JSON.parse(payloadString);
  
      if (Array.isArray(payloadObject)) {
        const itemsWithVisibility = payloadObject.map((item) => ({
          ...item,
          isVisible: true // Set isVisible to true for all items initially
        }));
        //console.log(itemsWithVisibility);
        setRentalsItems(itemsWithVisibility);
        
      }
    } catch (error) {
      console.error('Error fetching rentals items', error);
      setStatus("Something went wrong. Refresh the page.")
    }
  };
  

  const handleCloseRentalsCardAdd = () => {
    setShowRentalsCardAdd(false);
  };

  const handleAddItem = (newItem: RentalsItem) => {
    setRentalsItems((prevItems) => [...prevItems, newItem]);
    handleCloseRentalsCardAdd();
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
    setRentalsItems(rentalsItems.map(item => ({ ...item, isVisible: true })));
    
  };



 const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value.toLowerCase();
    setSearchTerm(newSearchTerm);

    if (!newSearchTerm.trim()) {
      // If the search term is empty, set all items to visible
      setRentalsItems(rentalsItems.map(item => ({ ...item, isVisible: true })));
    } else {
      // Otherwise, filter based on the search term
      const searchWords = newSearchTerm.split(/\s+/);
      setRentalsItems(rentalsItems.map(item => {
        const itemText = `${item.description} ${item.partNumber} ${item.location}`.toLowerCase();
        const isVisible = searchWords.every(word => itemText.includes(word));
        return { ...item, isVisible };
      }));
    }
  };

  //filtering by category
  const filteredItems = rentalsItems.filter(
    (item) => filterCategory === 'All' || item.category === filterCategory
  )

  // Determine the count of visible items
  const visibleItemCount = filteredItems.filter((item) => item.isVisible).length

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterCategory(event.target.value)
  }

  //accept search from URL
  useEffect(() => {
    const fullUrl = window.location.href;
  
    if (fullUrl.includes('?') && visibleItemCount > 1){
      const partToSearch = fullUrl.split('?')[1];
      setSearchTerm(partToSearch)
      const searchWords = partToSearch.split(/\s+/);
        setRentalsItems(rentalsItems.map(item => {
        const itemText = `${item.description} ${item.partNumber} ${item.location}`.toLowerCase();
        const isVisible = searchWords.every(word => itemText.includes(word));
        return { ...item, isVisible };

      }));
      router.push('/rentals'); 
    }
  },[visibleItemCount]);

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
        <h1>Available:</h1>
      <div className="sticky top-0 bg-gray-50 opacity-95 py-1">

      <div className="mt-2 flex flex-col md:flex-row w-full space-y-2 md:space-y-0 md:space-x-2 items-center">
      <div className={`md:flex-grow w-full flex justify-between items-end ${isInputFocused ? 'border-gray-500' : 'border-gray-200 hover:border-gray-300'} border bg-white rounded-lg py-1 pl-3`}>
      <input
        type="text"
        id="searchInput"
        className="w-full outline-none focus:outline-none focus:ring-0 placeholder:text-gray-500 placeholder:font-light"
        placeholder="Search available rentals"
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
    <button id="show-RentalsCardAdd" className="whitespace-nowrap text-gray-900 py-1 px-3" onClick={handleShowRentalsCardAdd}>
      + Equipment
    </button>
    {/*{showMenu && (<div className="hidden md:block"><Menu /></div>)}*/}
  </div>
  </div>
  </div>}
      <div id="RentalsCardAdd-div" className="mt-2">
        {showRentalsCardAdd && (
          <div>
            <h1>Add Equipment:</h1>
          <RentalsCardAdd
            onSave={fetchRentalsItems}
            onClose={handleCloseRentalsCardAdd} // Pass the onClose handler to RentalsCardAdd
          />
          </div>
        )}
      </div>
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
        {filteredItems.map((item) => (
          <div key={item.partNumber} className={`px-2 mb-4 w-full md:w-1/2 lg:w-1/3 ${item.isVisible ? '' : 'hidden'}`}>
            <RentalCardEditable {...item} />
          </div>
        ))}
      </div>

    </section>
  );
};

export default RentalsCards;
