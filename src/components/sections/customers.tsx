
import React, { useEffect, useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import CustomerCard from '../cards/CustomerCard'
import AddCustomerSection from '../cards/AddCustomerSection'
import { customerCards } from '../cards/CustomerCard'


const Customers: React.FC<{ searchedTerm: string }> = ({ searchedTerm }) => {
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [customers, setCustomers] = useState<customerCards[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [urlSearch, setUrlSearch] = useState('')
  //console.log(searchedTerm);

  useEffect(() => {
    fetchCustomers();
    const initialSearch = searchedTerm;
    setUrlSearch(initialSearch);
  }, []);

  //console.log(urlSearch);

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
        //console.log(itemsWithVisibility);
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

  const handleSearch = (newSearchTerm: string) => {
    const lowerCaseSearchTerm = newSearchTerm.toLowerCase();
    setSearchTerm(lowerCaseSearchTerm);

    if (!lowerCaseSearchTerm.trim()) {
      // If the search term is empty, set all items to visible
      setCustomers(customers.map((item) => ({ ...item, isVisible: true })));
    } else {
      // Otherwise, filter based on the search term
      const searchWords = lowerCaseSearchTerm.split(/\s+/);
      setCustomers(customers.map((item) => {
        const itemText = `${item.displayName} ${item.primaryPhone} ${item.familyName} ${item.givenName}`.toLowerCase();
        const isVisible = searchWords.every((word) => itemText.includes(word));
        return { ...item, isVisible };
      }));
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrlSearch('');
    setSearchTerm(event.target.value);
    handleSearch(event.target.value);
    
  };

  // Determine the count of visible items
  const visibleItemCount = customers.filter(
    (customer) => customer.isVisible
  ).length
    
  const handleClearSearch = () => {

    setSearchTerm('');
    // Reset all items to be visible when the search is cleared
    setCustomers(customers.map(item => ({ ...item, isVisible: true })));
    
  };

  useEffect(() => {
    if (urlSearch) {
      setSearchTerm(urlSearch)
      handleSearch(searchedTerm)
    } 
  }, [visibleItemCount]);

  

  
  


    const handleClose = () => {
      setShowAddCustomer(false);
    };

    const setCustomerFromAdd = (newCustomer: customerCards) => {
  
          setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
    }

  return (
    <section className="">
      <div className="">
      <div className="md:flex mt-2 items-center mb-5">
      <div className={`flex-grow w-full flex justify-between items-end ${isInputFocused ? 'border-gray-500' : 'border-gray-200 hover:border-gray-300'} border bg-white rounded-lg py-1 pl-3`}>
      <input
        type="text"
        id="searchInput"
        className="w-full outline-none focus:outline-none focus:ring-0 placeholder:text-gray-500 placeholder:font-light"
        placeholder="Search customers"
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
      {/*<input onChange={handleSearch} className="flex-grow border border-gray-200 rounded-md px-2 py-1 placeholder:font-light placeholder:text-gray-400 " placeholder='search customers'/>*/}
      <div className="">
        <button className="md:mx-1 md:w-auto w-full whitespace-nowrap text-center" onClick={()=>setShowAddCustomer(true)}>+ Customer</button>
      </div>
      </div>
      {showAddCustomer && <AddCustomerSection onClose={handleClose} sendCustomerToParent={setCustomerFromAdd}/>}
      {isLoading && (
          <div className="flex w-full justify-center items-center">
            <div>
        <p className="text-center animate-pulse">Loading...</p>


            </div>
            </div>
        )}
      {customers.map((customer, index) => (
        <div key={index} className={`${
          customer.isVisible ? '' : 'hidden'
        }`}>
          <CustomerCard
            mobilePhone={customer.mobilePhone}
            isVisible={customer.isVisible}
            displayName={customer.displayName}
            familyName={customer.familyName}
            givenName={customer.givenName}
            companyName={customer.companyName}
            primaryEmail={customer.primaryEmail}
            qboID={customer.qboID}
            primaryPhone={customer.primaryPhone}
            billAddressCity={customer.billAddressCity}
            billAddressLine1={customer.billAddressLine1}
            billAddressLine2={customer.billAddressLine2}
            billAddressState={customer.billAddressState}
            billAddressPostalCode={customer.billAddressPostalCode}
            country={customer.country}
            fullyQualifiedName={customer.fullyQualifiedName}
            shipAddressState={customer.shipAddressState}
            shipAddressCity={customer.shipAddressCity}
            shipAddressLine1={customer.shipAddressLine1}
            shipAddressLine2={customer.shipAddressLine2}
            shipAddressPostalCode={customer.shipAddressPostalCode}
            dateCreated={customer.dateCreated}
            balance={customer.balance}
            notes={customer.notes}
            taxable={customer.taxable}
            customerType={customer.customerType}
            equipment={customer.equipment}
            taxResaleNumber={customer.taxResaleNumber}
          />
          </div>
        ))}
      </div>
 
    </section>
  )
}

export default Customers;
