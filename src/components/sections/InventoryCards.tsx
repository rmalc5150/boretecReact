'use client';

import React, { useEffect, useState, useMemo } from 'react';
import InventoryCardEditable from '../../components/cards/InventoryCardEditable';
import InventoryCardAdd from '../../components/cards/InventoryCardAdd';
import { useRouter } from "next/router";
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';
import Cookies from 'js-cookie'

interface InventoryItem {
  partNumber: string;
  description: string;
  quantity: number;
  location: string;
  cost: number;
  retailPrice: number;
  weight: number;
  leadTime: number;
  docFileName: string;
  images: string;
  upsell: string;
  type: string;
  parts: string;
  vendors: string;
  manufacturer: string;
  manufactPartNum: string;
  parLevel: number;
  partsUrl: string;
  isVisible: boolean;
  partsInStock: string;
  name: string;
  items: string;
  editor: string;
  editDateTime: string;
  publicFacing: string;
  category: string;
  dynamicPricing: string;
  uploadedFiles: { name: string; url: string }[];
  allItems: InventoryItem[];
  quantityNeeded: number;
  breakdownInProgress: boolean;
  rAndD: boolean;
  royalties: boolean;
  searchableText: string;
  measurements: string;
}

const InventoryCards = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showInventoryCardAdd, setShowInventoryCardAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [status, setStatus] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState('All');
  const [user, setUser] = useState('');



  useEffect(() => {
    fetchInventoryItems();
    const checkEmail = async () => {
      const email = Cookies.get('email');
      if (email) {
        const userName = email.split('@')[0];
        setUser(userName);
      } 
    };
checkEmail()
  }, []);

  const fetchInventoryItems = async () => {
    const params = {
      FunctionName: 'boretec_inventory_select_all',
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
          isVisible: true, // Set isVisible to true for all items initially
          searchableText: `${item.partNumber} ${item.description}`.toLowerCase(),
        }));
        setInventoryItems(itemsWithVisibility);
      }
    } catch (error) {
      console.error('Error fetching inventory items', error);
      setStatus("Something went wrong. Refresh the page.");
    }
  };

  const handleCloseInventoryCardAdd = () => {
    setShowInventoryCardAdd(false);
  };

  const handleAddItem = (newItem: InventoryItem) => {
    setInventoryItems((prevItems) => [...prevItems, newItem]);
    handleCloseInventoryCardAdd();
  };

  const handleShowInventoryCardAdd = () => {
    setShowInventoryCardAdd(true);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setInventoryItems(inventoryItems.map(item => ({ ...item, isVisible: true })));
  };

  const handleSearch = (search: string) => {
    const newSearchTerm = search.toLowerCase().trim();
    if (!newSearchTerm) {
      setInventoryItems(inventoryItems.map(item => ({ ...item, isVisible: true })));
      return;
    }
    setInventoryItems(inventoryItems.map(item => {
      const isVisible = item.searchableText.includes(newSearchTerm);
      return { ...item, isVisible };
    }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    handleSearch(event.target.value);
  };

  const filteredItems = useMemo(() =>
    inventoryItems.filter(
      (item) => filterCategory === 'All' || item.category === filterCategory
    ), [inventoryItems, filterCategory]);

  const visibleItems = useMemo(() => filteredItems.filter(item => item.isVisible), [filteredItems]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(event.target.value);
  };

  const visibleItemCount = visibleItems.length;

  useEffect(() => {
    const fullUrl = window.location.href;
    const partToSearch = fullUrl.includes('?') && fullUrl.split('?')[1];
    if (partToSearch ) {
      setSearchTerm(partToSearch);
    }

    if (partToSearch && searchTerm === partToSearch) {
      
    
      handleSearch(partToSearch);
      if (visibleItemCount < inventoryItems.length) {
      router.push('/inventory');
      }
    }
  }, [visibleItems]);

  return (
    <section className="mt-5">
      <div className={`sticky top-0 bg-opacity-95 py-1 ${user === "bill" ? 'bg-gray-300' : 'bg-gray-100'}`}>
        <div className="mt-2 my-2 flex flex-col md:flex-row w-full space-y-2 md:space-y-0 md:space-x-2 items-center">
          <div className="w-full md:w-fit flex">
            <div className="bg-white w-full md:w-fit py-1 border px-2 border-gray-200 rounded-lg">
              <select
                value={filterCategory}
                onChange={handleCategoryChange}
                className="w-full md:w-fit focus:outline-none bg-white focus:border-gray-500 appearance-none"
              >
                <option value="All">All</option>
                <option value="Auger">Augers</option>
                <option value="Boring Machine">Boring Machines</option>
                <option value="Cutting Head">Cutting Heads</option>
                <option value="Part">Parts</option>
                <option value="Steering Head">Steering Heads</option>
                <option value="Steering Station">Steering Stations</option>
                <option value="Steering System">Steering Systems</option>
                <option value="Raw Material">Raw Materials</option>
              </select>
            </div>
            <button id="show-InventoryCardAdd" className="md:hidden flex whitespace-nowrap text-gray-900 py-1 px-3" onClick={handleShowInventoryCardAdd}>
              + Item
            </button>
          </div>
          <div className={`md:flex-grow w-full flex justify-between items-end ${isInputFocused ? 'border-gray-500' : 'border-gray-200 hover:border-gray-300'} border bg-white rounded-lg py-1 pl-3`}>
            <input
              type="text"
              id="searchInput"
              className="w-full outline-none focus:outline-none w-full focus:ring-0 placeholder:text-gray-500 placeholder:font-light"
              placeholder="Search inventory"
              value={searchTerm}
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
                clear
              </button>
            )}
            <div className="whitespace-nowrap text-bottom text-right text-xs text-gray-500 font-light ml-2 pr-1">
              {visibleItemCount} item(s)
            </div>
          </div>
          <button id="show-InventoryCardAdd" className="md:flex hidden whitespace-nowrap text-gray-900 py-1 px-3" onClick={handleShowInventoryCardAdd}>
            + Item
          </button>
        </div>
      </div>
      <div id="InventoryCardAdd-div" className="mt-2">
        {showInventoryCardAdd && (
          <InventoryCardAdd
            onSave={handleAddItem}
            onClose={handleCloseInventoryCardAdd}
          />
        )}
      </div>
      {status === "loading" && (
        <div className="px-2 text-md font-thin h-screen flex justify-center pt-5">
                  <div className="text-center">
            <p className="font-bold">Double Click to edit.</p>
            <p className="font-bold">Tap the image to enlarge.</p>
            <p className="animate-pulse">Loading...</p>
          </div>
        </div>
      )}
      <div id="inventoryCards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 my-2">
        {visibleItems.map((item) => (
          <div key={item.partNumber} className="w-full">
            <InventoryCardEditable {...item} allItems={inventoryItems} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default InventoryCards;