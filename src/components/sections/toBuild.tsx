'use client'

import React, { useEffect, useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import Cookies from 'js-cookie'
import ToBuildCardEditable from '../../components/cards/ToBuildCardEditable'
import ToBuildSelectAll from '../../components/forms/ToBuildSelectAll'
import { InventoryItem } from '../modals/inventorySearchBreakdown'

function useAdminCheck() {
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      const email = Cookies.get('email')
      if (email) {
        const extractedUsername = email.split('@')[0].toLowerCase()
        setAdmin(
          [
            'bill',
            'randall',
            'rhonda',
            'dave',
            'chad',
            'vitaliy',
            'sam',
          ].includes(extractedUsername)
        )
      }
    }

    checkAdminStatus()
  }, [])

  return admin
}

interface ToBuildItem {
  partNumber: string
  quantity: number
  docFileName: string
  status: string
  images: string
  location: string
  dueDate: string
  dateCreated: string
  partsUrl: string
  assignedTo: string
  internalDescription: string
  origin: string
  missing: string
  items: string
  itemsAddedToLists: string
  vendor: string
  externalVendor: boolean
  buildNumber: number
}

const ToBuild = () => {
  const [toBuildItems, setToBuildItems] = useState<ToBuildItem[]>([])
  const [waitingForCards, setWaitingForCards] = useState(true)
  const [showAllOrders, setShowAllOrders] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [searchDescription, setSearchDescription] = useState('')
  const admin = useAdminCheck()
  const [allItems, setAllItems] = useState<InventoryItem[]>([])

  useEffect(() => {
    fetchToBuildItems()
    inventoryItems()
  }, [])

  const fetchToBuildItems = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_select_all_toBuild',
      Payload: JSON.stringify({}),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      if (payloadObject.length >= 0) {
        setWaitingForCards(false)
      }
      //console.log(payloadObject);
      setToBuildItems(payloadObject)
    } catch (error) {
      console.error('Error fetching inventory items', error)
    }
  }

  const filteredItems = toBuildItems.filter((item) =>
    (
      item.assignedTo?.toLowerCase() +
      item.partNumber?.toLowerCase() +
      item.internalDescription?.toLowerCase()
    ).includes(searchTerm.toLowerCase())
  )

  const inventoryItems = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_search_for_breakdown_inventory_search',
      Payload: JSON.stringify({}),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)

      setAllItems(payloadObject) // Assuming the payload contains the array of items
    } catch (error) {
      console.error('Error fetching inventory items', error)
    }
  }

  const handleInputFocus = () => {
    setIsInputFocused(true)
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
  }
  // Determine the count of visible items
  const visibleItemCount = filteredItems.length

  return (
    <section className="mt-5">
      <div className={`${admin ? 'flex justify-end' : ''}`}>

        {admin && (
          <button
            className="text-xs font-light text-gray-600 mb-1 mx-2"
            onClick={() => setShowAllOrders(!showAllOrders)}
          >
            {showAllOrders ? 'Hide All' : 'Show All'}
          </button>
        )}
      </div>
      {admin && showAllOrders && (
        <div className="my-2">
          <ToBuildSelectAll />
        </div>
      )}

      <div
        className={`md:flex-grow mb-2 flex justify-between items-end ${
          isInputFocused
            ? 'border-gray-500'
            : 'border-gray-200 hover:border-gray-300'
        } border bg-white rounded-lg py-1 pl-3`}
      >
        <input
          type="text"
          id="searchInput"
          className="w-full outline-none focus:outline-none focus:ring-0 placeholder:text-gray-500 placeholder:font-light"
          placeholder="Search Builds"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
      {!waitingForCards && toBuildItems.length === 0 && (
        <div className="h-48 flex justify-center items-center">
          <p className="w-full p-2 text-center font-light">No Builds.</p>
        </div>
      )}
      {waitingForCards && (
        <div className="w-full py-10 flex justify-center items-center font-light">
          <p className="animate-pulse">Loading...</p>
        </div>
      )}
      <div className="flex flex-wrap">
        {filteredItems.map((item) => (
          <div
            key={item.dateCreated}
            className={`p-1 mb-4 w-full md:w-1/2 lg:w-1/3`}
          >
            <ToBuildCardEditable {...item} allItems={allItems} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default ToBuild
