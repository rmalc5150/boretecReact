'use client'

import React, { useEffect, useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'


export interface CustomerCard {
  mobilePhone: string
  displayName: string
  familyName: string
  givenName: string
  companyName: string
  primaryEmail: string
  qboID: number
  primaryPhone: string
  billAddressCity: string
  billAddressLine1: string
  billAddressLine2: string
  billAddressState: string
  billAddressPostalCode: string
  country: string
  fullyQualifiedName: string
  shipAddressState: string
  shipAddressCity: string
  shipAddressLine1: string
  shipAddressLine2: string
  shipAddressPostalCode: string
  dateCreated: string
  balance: number
  taxable: string
  customerType: string
  taxResaleNumber: number
  isVisible: boolean
}

interface CustomersProps {
  onRowClick: (customer: CustomerCard) => void; // Add a new prop for row click callback
  isMobile: boolean;
}

const Customers: React.FC<CustomersProps> = ({ onRowClick, isMobile }) => {
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [customers, setCustomers] = useState<CustomerCard[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)



  useEffect(() => {
    fetchCustomers();
  }, []);



  const fetchCustomers = async () => {
    setIsLoading(true);
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_customers_selectAll',
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

        setCustomers(itemsWithVisibility)
        setIsLoading(false)
      }
 
    } catch (error) {
      console.error('Error fetching customers', error);
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
      setCustomers(
        customers.map((item) => ({ ...item, isVisible: true }))
      )
    } else {
      // Otherwise, filter based on the search term
      const searchWords = newSearchTerm.split(/\s+/)
      setCustomers(
        customers.map((item) => {
          const itemText =
            `${item.displayName} ${item.primaryEmail}`.toLowerCase()
          const isVisible = searchWords.every((word) => itemText.includes(word))
          return { ...item, isVisible }
        })
      )
    }
  }

  // Determine the count of visible items
  const visibleItemCount = customers.filter(
    (customer) => customer.isVisible
  ).length
    
  const handleClearSearch = () => {

    setSearchTerm('');
    // Reset all items to be visible when the search is cleared
    setCustomers(customers.map(item => ({ ...item, isVisible: true })));
    
  };

  const visibleCustomers = customers.filter((customer) =>
    customer.isVisible &&
    (customer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     customer.primaryEmail?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

    const handleClose = () => {
      setShowAddCustomer(false);
    };

    const setCustomerFromAdd = (newCustomer: CustomerCard) => {
      const {
        mobilePhone: Mobile,
        givenName: First_Name,
        familyName: Last_Name,
        companyName: Company,
        primaryEmail: Email,
        primaryPhone: Phone,
        billAddressLine1: Address_Line1,
        billAddressLine2: Address_Line2,
        billAddressCity: Address_City,
        billAddressState: Address_State_Code,
        billAddressPostalCode: Address_Zip_Code,
        country: Address_Country,
        shipAddressLine1: Shipping_Address_Line1,
        shipAddressLine2: Shipping_Address_Line2,
        shipAddressCity: Shipping_Address_City,
        shipAddressState: Shipping_Address_State_Code,
        shipAddressPostalCode: Shipping_Address_Zip_Code,
        taxResaleNumber: Tax_Registration_Number,
        customerType: Customer_Type,
      } = newCustomer;
    
      const selectedCustomerObject: CustomerCard = {
        mobilePhone: Mobile,
        displayName: `${First_Name} ${Last_Name}`,
        familyName: Last_Name,
        givenName: First_Name,
        companyName: Company,
        primaryEmail: Email,
        qboID: 0,
        primaryPhone: Phone,
        billAddressCity: Address_City,
        billAddressLine1: Address_Line1,
        billAddressLine2: Address_Line2,
        billAddressState: Address_State_Code,
        billAddressPostalCode: Address_Zip_Code,
        country: Address_Country,
        fullyQualifiedName: Company,
        shipAddressState: Shipping_Address_State_Code,
        shipAddressCity: Shipping_Address_City,
        shipAddressLine1: Shipping_Address_Line1,
        shipAddressLine2: Shipping_Address_Line2,
        shipAddressPostalCode: Shipping_Address_Zip_Code,
        dateCreated: "",
        balance: 0,
        taxable: "Yes",
        customerType: Customer_Type,
        taxResaleNumber: Tax_Registration_Number,
        isVisible: true
      };
    
      setCustomers(prevCustomers => [...prevCustomers, selectedCustomerObject]);
    }
    

  return (
    <section className="text-gray-600">
      <div className="">
      {isLoading && <div className="sm:h-48 md:h-60 flex justify-center items-center animate-pulse">
        <p>Loading...</p>
      </div>}

      <div className="md:flex mx-1 my-2">
      <div className={`md:flex-grow w-full flex justify-between items-end ${isInputFocused ? 'border-gray-500' : 'border-gray-200 hover:border-gray-300'} border bg-white rounded-lg py-1 pl-3`}>
      <input
        type="text"
        id="searchInput"
        className="w-full outline-none focus:outline-none focus:ring-0 placeholder:text-gray-500 placeholder:font-light"
        placeholder="Search customers"
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
      {/*<input onChange={handleSearch} className="flex-grow border border-gray-200 rounded-md px-2 py-1 placeholder:font-light placeholder:text-gray-400 " placeholder='search customers'/>*/}

      </div>
    

      {!isLoading && !showAddCustomer && visibleCustomers.length > 0 && (
        <div className="h-48 md:h-60 overflow-y-auto">
        <table className="w-full leading-normal">
          <thead>
            <tr className="text-center ">
              <th className="font-normal">Company Name</th>
              {!isMobile && <th className="font-normal">Primary Email</th>}
            </tr>
          </thead>
          <tbody>
            {visibleCustomers.map((customer, index) => (
              <tr key={index} onClick={() => onRowClick(customer)} className="cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-gray-500">
                <td className="border-r border-gray-200 px-2 font-light">{customer.displayName}</td>
                {!isMobile && <td className="px-2 font-light">{customer.primaryEmail}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      </div>
 
    </section>
  )
}

export default Customers;
