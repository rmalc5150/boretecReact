'use client'

import React, { useEffect, useState, useRef } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import PartCard from '../../components/cards/PartCard'
import Cookies from 'js-cookie'
import { CustomerCard } from '../modals/customersSearch'
import { useRouter } from "next/router";
//import { url } from 'inspector'

interface InventoryItem {
  partNumber: string
  description: string
  quantity: string
  location: string
  cost: string
  retailPrice: string
  weight: string
  leadTime: string
  docFileName: string
  images: string
  upsell: string
  type: string
  parts: string
  vendors: string
  manufacturer: string
  manufactPartNum: string
  parLevel: string
  partsUrl: string
  isVisible: boolean
  partsInStock: string
  name: string
  category: string
}

const NumberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

interface EstimateItem {
  partNumber: string
  retailPrice: number // Assuming this is correctly a number
  image: string
  name: string
  qboID: number
  quantity: number // Ensure this field is managed as part of the state
}

const PartsCards = () => {
  /*const initialEstimateItems = Cookies.get('estimateItems') 
  ? JSON.parse(Cookies.get('estimateItems')!) // Use the non-null assertion operator (!) since we've already checked it exists
  : [];*/
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(false)
  const [filterCategory, setFilterCategory] = useState('All')
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [returningCustomer, setReturningCustomer] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customersLoading, setCustomersLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [requestingEstimate, setRequestingEstimate] = useState(false)
  const [showCustomerInfo, setShowCustomerInfo] = useState(false)
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([])
  const [customers, setCustomers] = useState<CustomerCard[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [searchField, setCustomerSearchField] = useState<
    'primaryPhone' | 'primaryEmail'
  >('primaryPhone')
  const [searchValue, setCustomerSearchValue] = useState<string>('')
  const [searchedCustomer, setSearchResult] = useState<CustomerCard | null>(
    null
  )
  const [isMobile, setIsMobile] = useState(false)
  const [numberOfCustomerSearches, setNumberOfCustomerSearches] = useState(0)
  const router = useRouter();
  const [selectValue, setSelectValue] = useState('')
  const [newCustomer, setNewCustomer] = useState({
    mobilePhone: '',
    displayName: '',
    familyName: '',
    givenName: '',
    companyName: '',
    primaryEmail: '',
    qboID: 0,
    primaryPhone: '',
    billAddressCity: '',
    billAddressLine1: '',
    billAddressLine2: '',
    billAddressState: '',
    billAddressPostalCode: '',
    country: '',
    fullyQualifiedName: '',
    shipAddressState: '',
    shipAddressCity: '',
    shipAddressLine1: '',
    shipAddressLine2: '',
    shipAddressPostalCode: '',
    dateCreated: '',
    balance: 0,
    taxable: '',
    customerType: '',
    taxResaleNumber: null,
    isVisible: true,
  })

  useEffect(() => {
    // Function to detect if the device is mobile
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    }
    // Set isOpen to true if isMobile returns true
    setIsMobile(isMobile())
  }, [])

  const handleCustomerSearch = () => {
    let processedSearchValue = searchValue.trim() // Trim whitespace

    if (searchField === 'primaryPhone') {
      // Sanitize input for phone search to remove non-digit characters
      processedSearchValue = processedSearchValue.replace(/\D/g, '')
    } else if (searchField === 'primaryEmail') {
      // Convert email search to lowercase
      processedSearchValue = processedSearchValue.toLowerCase()
    }

    const foundCustomer = customers.find((customer) => {
      if (searchField && customer[searchField]) {
        let customerValue = customer[searchField]
        if (searchField === 'primaryPhone') {
          // Sanitize stored phone values before comparison
          customerValue = customerValue.replace(/\D/g, '')
        } else if (searchField === 'primaryEmail') {
          // Ensure email comparison is case-insensitive
          customerValue = customerValue.toLowerCase()
        }
        return customerValue === processedSearchValue
      }
      return false
    })

    if (!foundCustomer) {
      setNumberOfCustomerSearches(numberOfCustomerSearches + 1)
    }
    //console.log(numberOfCustomerSearches);

    setSearchResult(foundCustomer || null)
  }

  useEffect(() => {
    // Load estimateItems from cookies after the component mounts
    const cookieValue = Cookies.get('estimateItems')
    if (cookieValue) {
      const itemsFromCookie = JSON.parse(cookieValue)
      // Update the state with the value from the cookie
      setEstimateItems(itemsFromCookie)
    }
  }, [])

  useEffect(() => {
    // Update the cookie only when estimateItems changes AND is not empty
    if (estimateItems.length > 0) {
      Cookies.set('estimateItems', JSON.stringify(estimateItems))
    }
    // Optionally, handle the scroll position update here as well
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    //console.log(estimateItems);
  }, [estimateItems]) // Depend on estimateItems to trigger this effect

  const handleClearSearch = () => {
    setSearchTerm('')
    // Reset all items to be visible when the search is cleared
    setInventoryItems(
      inventoryItems.map((item) => ({ ...item, isVisible: true }))
    )
  }

  const addToEstimate = (
    partNumber: string,
    retailPrice: number,
    image: string,
    name: string,
    qboID: number
  ) => {
    const existingItemIndex = estimateItems.findIndex(
      (item) => item.partNumber === partNumber
    )

    if (existingItemIndex >= 0) {
      const updatedItems = estimateItems.map((item, idx) =>
        idx === existingItemIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
      setEstimateItems(updatedItems)
    } else {
      const newEstimateItem = {
        partNumber,
        retailPrice,
        image,
        name,
        quantity: 1,
        qboID
      }
      setEstimateItems((prevItems) => [...prevItems, newEstimateItem])
    }
  }

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const updatedItems = estimateItems.map((item, idx) =>
      idx === index ? { ...item, quantity: newQuantity } : item
    )
    setEstimateItems(updatedItems)
  }

  const removeEstimateItem = (index: number) => {
    const updatedItems = estimateItems.filter((_, idx) => idx !== index)
    setEstimateItems(updatedItems)
  }

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  const fetchInventoryItems = async () => {
    setIsLoading(true)
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_select_parts',
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

        setInventoryItems(itemsWithVisibility)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error fetching inventory items', error)
      setIsLoading(false)
    }
  }

  const fetchCustomers = async () => {
    setCustomersLoading(true)
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_customers_selectAll',
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
          isVisible: false, // Set isVisible to true for all items initially
        }))

        setCustomers(itemsWithVisibility)
        setCustomersLoading(false)
      }
    } catch (error) {
      console.error('Error fetching inventory items', error)
      setCustomersLoading(true)
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
      setInventoryItems(
        inventoryItems.map((item) => ({ ...item, isVisible: true }))
      )
    } else {
      // Otherwise, filter based on the search term
      const searchWords = newSearchTerm.split(/\s+/)
      setInventoryItems(
        inventoryItems.map((item) => {
          const itemText =
            `${item.name} ${item.partNumber}`.toLowerCase()
          const isVisible = searchWords.every((word) => itemText.includes(word))
          return { ...item, isVisible }
        })
      )
    }
  }

  //sum esstimateItems
  const totalPrice = estimateItems.reduce(
    (acc, item) => acc + item.quantity * item.retailPrice,
    0
  )
  // Format totalPrice with comma separators for thousands
  const formattedTotalPrice = totalPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const filteredItems = inventoryItems.filter(
    (item) => filterCategory === 'All' || item.category === filterCategory
  )

  // Determine the count of visible items
  const visibleItemCount = filteredItems.filter((item) => item.isVisible).length

  const fetchItemQboID = async (partNumber:string) => {
    const payload = {
      partNumber
    };
  //console.log(payload);
    const params = {
      FunctionName: 'boretec_fetch_item_qboID', //change to qbo lambda.
      Payload: JSON.stringify(payload),
    };
  
    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      const applicationResponse = JSON.parse(new TextDecoder().decode(response.Payload));
      //const responseBody = JSON.parse(applicationResponse.body);
      //console.log(applicationResponse);
      return applicationResponse.length > 0 ? parseInt(applicationResponse[0].qboID, 10) : null;
    } catch (error) {
      console.error('Failed to fetch QuickBooks item ID: ', error);
      return null; // Return null on error to handle gracefully
    }
  };

  useEffect(() => {
    const fullUrl = window.location.href

    if (fullUrl.includes('?') && visibleItemCount > 1) {
      const urlItems = fullUrl.split('?')
      let imageUrl = 'https://boretec.com/images/image-coming-soon.png'
      let qboID: number | null = 0;
      if (urlItems[3] !== 'undefined') {
        imageUrl = urlItems[3]
      }

      // Assuming the URL is correctly structured and all values are present
      const partNumber = urlItems[1]
      if (urlItems[6] && parseInt(urlItems[6]) !== 0){
        qboID = parseInt(urlItems[6]);
      } 
      
      const name = urlItems[5]
        .replace(/%20/g, ' ')
        .replace(/%27/g, "'")
        .replace(/%22/g, '"')
        .replace(/%2F/g, "/")

      
      const partToAdd: EstimateItem = {
        partNumber: partNumber,
        retailPrice: parseFloat(urlItems[2]), // Convert string to number
        image: imageUrl,
        quantity: 1,
        name: name,
        qboID
      }

      setEstimateItems((prevItems) => {
        // Check if the part already exists in the array
        const existingItemIndex = prevItems.findIndex(
          (item) => item.partNumber === partNumber
        )

        if (existingItemIndex !== -1) {
          // If found, create a new array with the updated item
          return prevItems.map((item, index) => {
            if (index === existingItemIndex) {
              return { ...item, quantity: item.quantity + 1 }
            }
            return item
          })
        } else {
          // If not found, add the new item to the array
          return [...prevItems, partToAdd]
        }
      })

      router.push('/parts')
    }
  }, [visibleItemCount])

  const convertDateToString = () => {
    const date = new Date().toISOString()
    const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26))
    const randomNum = Math.floor(Math.random() * 10)
    let modifiedDate = date
      .replace('T', randomChar)
      .replace('Z', '-')
      .replace(/:/g, randomChar)

    modifiedDate = modifiedDate
      .split('')
      .map((char) => {
        if (!isNaN(parseFloat(char)) && char !== '-') {
          // Check if character is a number and not the dash added at the end
          // Convert numbers 0-9 to letters a-j
          return String.fromCharCode(97 + parseInt(char))
        }
        return char
      })
      .join('')

    // Append the random character to the end of the modified date string
    modifiedDate =
      randomChar +
      modifiedDate
        .replace(/-/g, randomNum.toString())
        .replace('.', (randomNum + 1).toString())

    return modifiedDate
  }

  const calculateTax = () => {
    let tax
    if (searchedCustomer?.customerType === 'Reseller') {
      tax = 0
    } else if (searchedCustomer?.shipAddressState.toLowerCase() === 'sc') {
      tax = totalPrice * 0.07
    } else if (
      searchedCustomer?.shipAddressState.toLowerCase() === 'south carolina'
    ) {
      tax = totalPrice * 0.07
    } else {
      tax = 0
    }

    return tax
  }
  const addSevenDays = () => {
    var currentDate = new Date() // Get the current date and time
    currentDate.setDate(currentDate.getDate() + 7) // Add 7 days to the current date
    return currentDate // Return the new date
  }

  function isValidEmail(primaryEmail:string) {
    // Regular expression for basic email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(primaryEmail);
  }
  

  const handleSend = async () => {
    if (returningCustomer === 'no') {
      //console.log(newCustomer);
      const {
        taxResaleNumber,
        customerType,
        mobilePhone,
        billAddressLine2,
        shipAddressLine2,
        primaryEmail,
dateCreated,
displayName,
taxable,
fullyQualifiedName,
qboID,
        ...restOfCustomer
      } = newCustomer

      // Check if all fields, except the variables above are filled in.
      const allFieldsFilled = Object.values(restOfCustomer).every(
        (value) => value.toString().trim() !== ''
      )
      //console.log(allFieldsFilled);
      if (!allFieldsFilled) {
        alert('You must fill in all of the gray fields.')
        return // Exit the function early if not all fields are filled
      }
      if (!isValidEmail(primaryEmail)) {
        alert('Please provide a valid email.')
        return // Exit the function early if not a valid email.
      }
    }
    const urlKey = convertDateToString()
    setIsSending(true)
    let selectedCustomer
    if (returningCustomer === 'no') {
      selectedCustomer = newCustomer;
      let custType;
      if (newCustomer.taxResaleNumber) {
        custType= '3200000000000225696';
      } else {
        custType = '3200000000000211064';
      }

      const newCust = {
        First_Name: newCustomer.givenName,
        Last_Name: newCustomer.familyName,
        Company: newCustomer.companyName,
        Email: newCustomer.primaryEmail,
        Phone: newCustomer.primaryPhone,
        Mobile: newCustomer.mobilePhone,
        Address_Line1: newCustomer.billAddressLine1,
        Address_Line2: newCustomer.billAddressLine2 || null,
        Address_City: newCustomer.billAddressCity,
        Address_State_Code: newCustomer.billAddressState,
        Address_Zip_Code: newCustomer.billAddressPostalCode,
        Address_Country: newCustomer.country,
        Shipping_Address_Line1: newCustomer.shipAddressLine1,
        Shipping_Address_Line2: newCustomer.shipAddressLine2,
        Shipping_Address_City: newCustomer.shipAddressCity,
        Shipping_Address_State_Code: newCustomer.shipAddressState,
        Shipping_Address_Zip_Code: newCustomer.shipAddressPostalCode,
        Tax_Registration_Number: newCustomer.taxResaleNumber,
        Customer_Type: custType,
        Term: 1,
      };

      const paramsNewCust = {
        FunctionName: 'boretec_send_new_customer_2_quickbooks',
        Payload: JSON.stringify(newCust),
      }
  
      try {
        const command = new InvokeCommand(paramsNewCust)
        
        const response = await lambdaClient.send(command)
       
  
        // Parse the Payload to get the application-level response
        const applicationResponse = JSON.parse(
          new TextDecoder().decode(response.Payload)
        )

        console.log('Application response:', applicationResponse)
        const responseBody = JSON.parse(applicationResponse.body)
     
  
        if (
          applicationResponse.statusCode !== 200 
        ) {
          alert(
            `Unfortunately, looks like something went wrong. Try again or contact us at (864) 708-1250.`

        )} 
      } catch (error) {
        alert('Failed to add or send the estimate. ' + error)
        console.error('Error invoking Lambda function:', error)
        setIsSending(false)
      }

    } else if (returningCustomer === 'yes') {
      selectedCustomer = searchedCustomer
    }


    const payload = {
      items: estimateItems,
      selectedCustomer,
      tax: calculateTax(),
      subtotal: totalPrice,
      discount: 0,
      message: '',
      emails: [],
      expirationDate: addSevenDays(),
      urlKey: urlKey,
      dateCreated: new Date(),
      origin: 'boretec.com',
    }

    console.log(payload)

    const params = {
      FunctionName: 'boretec_insert_estimate',
      Payload: JSON.stringify(payload),
    }

    const paramsEmail = {
      FunctionName: 'boretec_send_estimate_email',
      Payload: JSON.stringify(payload),
    }

    try {
      const command = new InvokeCommand(params)
      const commandEmail = new InvokeCommand(paramsEmail)

      const response = await lambdaClient.send(command)
      const responseEmail = await lambdaClient.send(commandEmail)
      //console.log('Lambda response:', response);

      // Parse the Payload to get the application-level response
      const applicationResponse = JSON.parse(
        new TextDecoder().decode(response.Payload)
      )
      const applicationResponseEmail = JSON.parse(
        new TextDecoder().decode(responseEmail.Payload)
      )
      console.log('Application response:', applicationResponse)
      const responseBody = JSON.parse(applicationResponse.body)
      const responseBodyEmail = JSON.parse(applicationResponseEmail.body)

      if (
        applicationResponse.statusCode === 200 &&
        applicationResponseEmail.statusCode === 200
      ) {
        alert(
          `Thanks for requesting and estimate. You'll recieve an email shortly, and we'll call or email to follow up. Looking forward to talking.`
        )
        setRequestingEstimate(false)
        setEstimateItems([])
        setNumberOfCustomerSearches(0)
        setSearchResult(null)
      } else {
        setIsSending(false)
        alert('Failed to send the estimate')
      }
    } catch (error) {
      alert('Failed to add or send the estimate. ' + error)
      console.error('Error invoking Lambda function:', error)
      setIsSending(false)
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isShippingSameAsBilling = e.target.value === 'true'
    setShippingSameAsBilling(isShippingSameAsBilling)

    if (isShippingSameAsBilling) {
      setNewCustomer((prevState) => ({
        ...prevState,
        shipAddressLine1: prevState.billAddressLine1,
        shipAddressLine2: prevState.billAddressLine2,
        shipAddressCity: prevState.billAddressCity,
        shipAddressState: prevState.billAddressState,
        shipAddressPostalCode: prevState.billAddressPostalCode,
      }))
    }
  }

  const handleChange = (field: string, value: string) => {
    setNewCustomer({ ...newCustomer, [field]: value })
    if (shippingSameAsBilling) {
      setNewCustomer((prevState) => ({
        ...prevState,
        shipAddressLine1: prevState.billAddressLine1,
        shipAddressLine2: prevState.billAddressLine2,
        shipAddressCity: prevState.billAddressCity,
        shipAddressState: prevState.billAddressState,
        shipAddressPostalCode: prevState.billAddressPostalCode,
      }))
    }
  }

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterCategory(event.target.value)
  }

  const formatNumber = (number: number): string =>
    NumberFormatter.format(number)

  return (
    <section className="mt-5">
      <div
        className={`bg-gray-100 py-1 overflow-y-auto ${
          requestingEstimate ? '' : 'sticky top-0 max-h-[50vh]'
        }`}
        ref={scrollRef}
      >
        {estimateItems.length > 0 && (
          <div>
            <div className="my-5 bg-white border border-gray-300 rounded-lg overflow-hidden lg:text-sm">
              <div className="text-black text-center text-xl font-medium py-1">
                <p>Estimate</p>
              </div>
              <table className="min-w-full leading-normal text-center">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    {!isMobile && <th className="p1-5 py-3"></th>}
                    <th className="px-1 py-3">Quantity</th>
                    {!isMobile && <th className="px-1 py-3">Part Number</th>}
                    <th className="px-1 py-3">Description</th>

                    <th className="px-1 py-3">Price</th>
                    {!isMobile && <th className="px-1 py-3"></th>}
                  </tr>
                </thead>
                <tbody>
                  {estimateItems.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b border-gray-200"
                    >
                      {!isMobile && (
                        <td className="px-5 py-2 text-sm">
                          <img src={item.image} className="h-8" alt="Part" />
                        </td>
                      )}
                      <td className="px-5 py-2 text-sm">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              index,
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="text-center w-12 rounded-sm bg-gray-100"
                          min="1"
                        />
                      </td>
                      {!isMobile && (
                        <td className="px-5 py-2 text-sm">{item.partNumber}</td>
                      )}
                      <td className="px-5 py-2 text-sm">{item.name}</td>
                      <td className="px-5 py-2 text-sm">
                        ${formatNumber(item.quantity * item.retailPrice)}
                      </td>
                      {!isMobile && (
                        <td className="px-5 py-2 text-sm">
                          <button
                            onClick={() => removeEstimateItem(index)}
                            className="bg-gray-500 text-white p-1 rounded hover:bg-black"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right p-2">
                {searchedCustomer && totalPrice && calculateTax() > 0 && (
                  <p>Tax: ${calculateTax()}</p>
                )}
                <p className="font-bold">Total: ${formattedTotalPrice}</p>
              </div>
              {!showCustomerInfo && (
                <div
                  className="bg-gray-900 text-white text-center font-medium py-2 cursor-pointer"
                  onClick={() => {
                    setShowCustomerInfo(true)
                    setRequestingEstimate(true)
                  }}
                >
                  <p>Request Estimate</p>
                </div>
              )}
              {requestingEstimate && (
                <div className="">
                  <p
                    className={`bg-gray-100 text-gray-600 text-center py-1 border-t border-b border-gray-200`}
                  >
                    Your information
                  </p>
                </div>
              )}
              {showCustomerInfo && (
                <div className="w-full">
                  {!isMobile &&
                    !searchedCustomer &&
                    returningCustomer !== 'no' && (
                      <div className="grid md:grid-cols-3 gap-2 m-4">
                        <div>
                          <p className="font-medium m-1">Contact details:</p>
                          <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                          <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                          <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                        </div>

                        <div>
                          <p className="font-medium m-1">Billing Address:</p>
                          <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                          <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                          <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                        </div>

                        <div>
                          <p className="font-medium m-1">Shipping Address:</p>
                          <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                          <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                          <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                        </div>
                      </div>
                    )}
                  <div className="">
                    {returningCustomer === '' && (
                      <div className="w-full">
                        <div className="flex justify-between">
                          <button
                            onClick={() => {
                              setReturningCustomer('yes')
                              fetchCustomers()
                            }}
                            className="bg-gray-800 text-white py-2 px-2 w-full font-medium hover:bg-black"
                          >
                            I&apos;m a returning customer
                          </button>
                          <button
                            onClick={() => setReturningCustomer('no')}
                            className="bg-gray-600 text-white py-2 px-2 w-full font-medium hover:bg-black"
                          >
                            I&apos;m a new customer
                          </button>
                        </div>
                      </div>
                    )}
                    {returningCustomer === 'yes' && (
                      <div className="w-full">
                        {customersLoading && (
                          <div className="flex justify-center items-center my-5">
                            <p className="animate-pulse">Loading...</p>
                          </div>
                        )}
                        {searchedCustomer && (
                          <div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1 px-4 py-2">
                              <div>
                                <p className="font-semibold">
                                  Contact details:
                                </p>
                                <div className="flex space-x-1">
                                  <p>{searchedCustomer.givenName}</p>

                                  <p>{searchedCustomer.familyName}</p>
                                </div>

                                <p>{searchedCustomer.companyName}</p>

                                <p>{searchedCustomer.primaryEmail}</p>

                                <div className="flex space-x-1">
                                  <p className="font-medium">M:</p>
                                  <p>{searchedCustomer.mobilePhone}</p>
                                </div>

                                <div className="flex space-x-1">
                                  <p className="font-medium">P:</p>
                                  <p>{searchedCustomer.primaryPhone}</p>
                                </div>
                              </div>

                              <div>
                                <p className="font-semibold">
                                  Billing Address:
                                </p>
                                <p>{searchedCustomer.billAddressLine1}</p>
                                <p>{searchedCustomer.billAddressLine2}</p>
                                <p>{searchedCustomer.billAddressCity}</p>
                                <p>{searchedCustomer.billAddressState}</p>
                                <p>{searchedCustomer.billAddressPostalCode}</p>
                                <p>{searchedCustomer.country}</p>
                              </div>

                              <div>
                                <p className="font-semibold">
                                  Shipping Address:
                                </p>
                                <p>{searchedCustomer.shipAddressLine1}</p>
                                <p>{searchedCustomer.shipAddressLine2}</p>
                                <p>{searchedCustomer.shipAddressCity}</p>
                                <p>{searchedCustomer.shipAddressState}</p>
                                <p>{searchedCustomer.shipAddressPostalCode}</p>
                              </div>

                              <div>
                                <p className="font-semibold">Customer Type:</p>
                                <p>
                                  {searchedCustomer.customerType ===
                                    '3200000000000225696' ||
                                  searchedCustomer.customerType === null
                                    ? 'Direct'
                                    : 'Reseller'}
                                </p>

                                {searchedCustomer.customerType !==
                                  '3200000000000225696' &&
                                  searchedCustomer.customerType !== null && (
                                    <div className="mt-2">
                                      <p className="font-medium">
                                        Tax Resale Number:
                                      </p>
                                      <p>{searchedCustomer.taxResaleNumber}</p>
                                    </div>
                                  )}
                              </div>
                            </div>

                            <div className="flex justify-between">
                              <button
                                onClick={() => {
                                  setSearchResult(null)
                                  setShowCustomerInfo(true)
                                }}
                                className="bg-gray-600 text-white py-2 px-2 w-full font-medium hover:bg-gray-700"
                              >
                                Back
                              </button>
                              <button
                                onClick={() => {
                                  handleSend()
                                }}
                                className="bg-gray-800 text-white py-2 px-2 w-full font-medium hover:bg-black"
                              >
                                {isSending ? (
                                  <p className="animate-pulse">Sending...</p>
                                ) : (
                                  <p>Send Estimate</p>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {!searchedCustomer && customers.length > 0 && (
                          <div className="my-5">
                            <div className="flex justify-center items-center">
                              <div className="flex">
                                <div className="">
                                  <select
                                    id="searchField"
                                    value={searchField}
                                    onChange={(e) =>
                                      setCustomerSearchField(
                                        e.target.value as
                                          | 'primaryPhone'
                                          | 'primaryEmail'
                                      )
                                    }
                                  >
                                    <option value="primaryPhone">
                                      Search with Phone
                                    </option>
                                    <option value="primaryEmail">
                                      Search with Email
                                    </option>
                                  </select>
                                </div>
                              </div>
                              {/*<div>
                                <input
                                  id="searchValue"
                                  type="text"
                                  value={searchValue}
                                  className="border border-gray-300 py-1 px-2 rounded-md mx-2"
                                  onChange={(e) =>
                                    setCustomerSearchValue(e.target.value)
                                  }
                                />
                              </div>*/}
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault() // Prevent the default form submission
                                  handleCustomerSearch() // Call the same function as the button’s onClick
                                }}
                              >
                                <input
                                  id="searchValue"
                                  type="text"
                                  value={searchValue}
                                  className="border border-gray-300 py-1 px-2 rounded-md mx-2"
                                  onChange={(e) =>
                                    setCustomerSearchValue(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault() // Prevent the default action to avoid form submission redundancies
                                      handleCustomerSearch()
                                    }
                                  }}
                                />
                                <button
                                  type="submit" // Make the button of type submit to trigger form submission
                                  className="bg-gray-800 hover:bg-black text-white py-1 px-2 rounded-md mx-2"
                                >
                                  Search
                                </button>
                              </form>
                            </div>

                            {!searchedCustomer &&
                              numberOfCustomerSearches >= 1 && (
                                <div>
                                  <div className="flex items-center justify-center">
                                    <div>
                                      <p className="my-5">
                                        We can&apos;t seem to find you. Try again?
                                      </p>
                                      <button className="text-gray-700 border border-gray-700 py-1 px-2 rounded-md w-full" onClick={()=>{setReturningCustomer('no')}}>
                                        Start as a new Customer
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-xs text-center px-2 mt-5 text-gray-400 italic">
                                    <p>
                                      After 10 unsuccessful searches, you&apos;ll be
                                      redirected to start as a new customer.
                                    </p>
                                    <p>
                                      Number of Search attempts:{' '}
                                      {numberOfCustomerSearches}.
                                    </p>
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    )}
                    {returningCustomer === 'no' && (
                      <div>
                        <div className="px-4 py-2 grid md:grid-cols-3 gap-2">
                          <div>
                            <div className="mb-4">
                              <p>First Name:</p>
                              <input
                                type="text"
                                value={newCustomer.givenName}
                                onChange={(e) =>
                                  handleChange('givenName', e.target.value)
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.givenName
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Last Name:</p>
                              <input
                                type="text"
                                value={newCustomer.familyName}
                                onChange={(e) =>
                                  handleChange('familyName', e.target.value)
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.familyName
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Company Name:</p>
                              <input
                                type="text"
                                value={newCustomer.companyName}
                                onChange={(e) =>
                                  handleChange('companyName', e.target.value)
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.companyName
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Email:</p>
                              <input
                                type="text"
                                value={newCustomer.primaryEmail}
                                onChange={(e) =>
                                  handleChange('primaryEmail', e.target.value)
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.primaryEmail
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Phone:</p>
                              <input
                                type="text"
                                value={newCustomer.primaryPhone}
                                onChange={(e) =>
                                  handleChange('primaryPhone', e.target.value)
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.primaryPhone
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Mobile:</p>
                              <input
                                type="text"
                                value={newCustomer.mobilePhone}
                                onChange={(e) =>
                                  handleChange('mobilePhone', e.target.value)
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.mobilePhone
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700'
                                }`}
                              />
                            </div>
                            <div className="mb-4">
                              <p>Tax Registration Number:</p>
                              <input
                                type="text"
                                value={newCustomer.taxResaleNumber || ""}
                                placeholder='Resellers only'
                                onChange={(e) =>
                                  handleChange(
                                    'taxResaleNumber',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.taxResaleNumber
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700'
                                }`}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-4">
                              <p>Billing Address Line1:</p>
                              <input
                                type="text"
                                value={newCustomer.billAddressLine1}
                                onChange={(e) =>
                                  handleChange(
                                    'billAddressLine1',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.billAddressLine1
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Billing Address Line2:</p>
                              <input
                                type="text"
                                value={newCustomer.billAddressLine2}
                                onChange={(e) =>
                                  handleChange(
                                    'billAddressLine2',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.billAddressLine2
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Billing Address City:</p>
                              <input
                                type="text"
                                value={newCustomer.billAddressCity}
                                onChange={(e) =>
                                  handleChange(
                                    'billAddressCity',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.billAddressCity
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Billing Address State:</p>
                              <input
                                type="text"
                                value={newCustomer.billAddressState}
                                onChange={(e) =>
                                  handleChange(
                                    'billAddressState',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.billAddressState
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Billing Address Zip Code:</p>
                              <input
                                type="text"
                                value={newCustomer.billAddressPostalCode}
                                onChange={(e) =>
                                  handleChange(
                                    'billAddressPostalCode',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.billAddressPostalCode
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Country:</p>
                              <input
                                type="text"
                                value={newCustomer.country}
                                onChange={(e) =>
                                  handleChange('country', e.target.value)
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.country
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>
                            <div className="mb-4">
                              <p>
                                Is the shipping address the same as the billing
                                address?
                              </p>
                              <select
                                value={shippingSameAsBilling.toString()}
                                onChange={handleAddressChange}
                                className="border border-gray-600 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none bg-white"
                              >
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <div className="mb-4">
                              <p>Shipping Address Line1:</p>
                              <input
                                type="text"
                                value={newCustomer.shipAddressLine1}
                                onChange={(e) =>
                                  handleChange(
                                    'shipAddressLine1',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.shipAddressLine1
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Shipping Address Line2:</p>
                              <input
                                type="text"
                                value={newCustomer.shipAddressLine2}
                                onChange={(e) =>
                                  handleChange(
                                    'shipAddressLine2',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.shipAddressLine2
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Shipping Address City:</p>
                              <input
                                type="text"
                                value={newCustomer.shipAddressCity}
                                onChange={(e) =>
                                  handleChange(
                                    'shipAddressCity',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.shipAddressCity
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Shipping Address State:</p>
                              <input
                                type="text"
                                value={newCustomer.shipAddressState}
                                onChange={(e) =>
                                  handleChange(
                                    'shipAddressState',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.shipAddressState
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>

                            <div className="mb-4">
                              <p>Shipping Address Zip Code:</p>
                              <input
                                type="text"
                                value={newCustomer.shipAddressPostalCode}
                                onChange={(e) =>
                                  handleChange(
                                    'shipAddressPostalCode',
                                    e.target.value
                                  )
                                }
                                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                                  newCustomer.shipAddressPostalCode
                                    ? 'text-white bg-gray-600'
                                    : 'text-gray-700 bg-gray-100'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <button
                            onClick={() => {
                              setSearchResult(null)
                              setShowCustomerInfo(true)
                              setReturningCustomer('')
                            }}
                            className="bg-gray-600 text-white py-2 px-2 w-full font-medium hover:bg-gray-700"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => {
                              handleSend()
                            }}
                            className="bg-gray-800 text-white py-2 px-2 w-full font-medium hover:bg-black"
                          >
                            {isSending ? (
                              <p className="animate-pulse">Sending...</p>
                            ) : (
                              <p>Send Estimate</p>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            
            </div>
          </div>
        )}
        <h1 className="text-2xl font-medium tracking-tight text-center mb-5">
          Search Our Inventory
        </h1>
        <div className="mt-4 flex flex-col md:flex-row w-full space-y-2 md:space-y-0 md:space-x-2 items-center">
          <div
            className={`md:flex-grow w-full flex justify-between items-end ${
              isInputFocused ? 'border-gray-500' : 'border-gray-200'
            } border bg-white rounded-lg py-1 pl-3`}
          >
            <input
              type="text"
              id="searchInput"
              className="w-full outline-none focus:outline-none focus:ring-0"
              placeholder="Search by part number or description..."
              value={searchTerm} // Ensure this correctly references the state
              onChange={handleSearch}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="pr-2 border-r border-400 text-xs text-bottom text-gray-400 hover:text-gray-600"
                type="button"
              >
                clear {/* This is a Unicode 'X' character: &#x2715; */}
              </button>
            )}
            <div className="whitespace-nowrap text-bottom text-right text-xs text-gray-400 ml-2 pr-1">
              {visibleItemCount} item(s)
            </div>
          </div>
        </div>
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
          <option value="Part">Parts</option>
          <option value="Steering Head">Steering Heads</option>
          <option value="Steering Station">Steering Stations</option>
          <option value="Steering System">Steering Systems</option>
        </select>
      </div>
      <div className="flex flex-wrap -mx-2 my-4">
        {isLoading && (
          <div className="flex w-full justify-center items-center">
            <div>
              <p className="text-center">Loading...</p>
              <div className="animate-bounce mt-4">
                <svg
                  version="1.0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 1428 1428"
                >
                  <path d="M707.4 208.8c-5.9 2.1-394 222.4-403 228.7-7.1 5.1-11.2 10.6-13.1 17.7-1 4.3-1.3 29.1-1.3 132.9v127.6l-11.7 4.1c-6.5 2.3-71.6 24.6-144.7 49.7C60.5 794.5.6 815.1.5 815.2c-.2.3 54.6 281.1 54.9 281.5 0 0 67.8-16.2 150.6-36.2l150.5-36.4 2.7 3.2c1.4 1.8 6.2 7.8 10.5 13.4 46.3 59.9 105.7 109.2 167.1 138.9 41.7 20.1 80.9 31.7 128.7 38.1 16.6 2.2 74.7 2.5 89.5.5 32.6-4.5 59.7-10.7 86.5-19.9 126-43.3 230.7-143.1 273.6-261l3.4-9.3 51.5-16.9c42.2-13.9 257.1-84.4 257.7-84.6.3 0-44.4-292.6-44.8-292.9-.3-.3-199.1 37.5-241.1 45.8l-2.7.5-.4-62.2c-.2-44.2-.7-63.2-1.5-65.8-1.8-5.4-5.2-10-10.2-13.7-4.3-3.2-384.6-219.8-398.2-226.8-8.3-4.3-14.5-5.1-21.4-2.6zM917.1 346c105.9 60.2 193.6 110.3 195 111.3l2.4 1.7.3 69.2.3 69.1-3.8-.7c-2.1-.3-5.9-.6-8.5-.6h-4.8V470.5L906.7 361.7C801.4 301.9 714.7 253 713.9 253c-.8 0-86.7 48.5-190.9 107.8L333.5 468.5l-.3 137.7-.2 137.6-8.3 2.8c-4.5 1.5-8.8 2.9-9.4 3.2-1 .3-1.3-28.9-1.3-144.1V461.1l3.8-3.1c2-1.7 41.7-24.8 88.2-51.2 46.5-26.4 135.1-76.8 196.9-111.9L715.3 231l4.6 2.7c2.5 1.5 91.3 52 197.2 112.3zm370.5 267.1c14.2 2.6 23.7 10.4 30.8 25.2 3.8 8 8.1 22 9.9 32.2l.6 3.1-25.7 4.7c-26.9 4.9-27.1 4.9-27.2.1 0-1.1-1.2-4.5-2.7-7.5-4.9-9.5-12.3-11.6-30.6-8.4-15.3 2.7-23.8 6.9-27.4 13.9-2.6 4.8-1.9 15.7 2.2 38.2 5 27.3 8.4 42.2 10.5 46.4 5.6 10.8 15.3 13.2 36.3 8.9 18.8-3.8 23.7-8 23.7-20.3 0-3.9-.4-8.8-.9-10.9-.5-2-.8-3.7-.7-3.7 0 0 11.7-2.2 25.9-4.8 17.3-3.3 26-4.5 26.3-3.8 1.2 3.6 4.4 25.9 4.4 31-.1 20.8-11.3 37.7-31.2 47-12.4 5.9-31.6 10.3-60.6 14-34 4.4-51.7-1.3-65-20.7-8-11.5-11.3-22.8-19.3-65.6-8.9-47.8-9.1-61.9-.8-78.4 9-17.8 28.6-28.2 68-36.1 24.7-5 42.6-6.5 53.5-4.5zm-164.1 48.2c2.1 11.4 3.6 20.9 3.4 21.1-.2.2-19.5 3.8-42.9 8.1s-42.6 8-42.8 8.1c-.2.1 1.1 8.2 2.9 18.1l3.3 17.9 23.5-4.4c13-2.4 31.4-5.8 40.9-7.6 9.4-1.8 17.2-2.9 17.2-2.5 0 .4 1.4 7.9 3 16.7 1.7 8.9 3 16.7 3 17.4 0 1-10.3 3.3-39.7 8.7-21.9 4-40.1 7.6-40.4 8-.5.5 1 10.1 5.6 34.7l.5 3 41.8-7.7c22.9-4.3 42.8-7.9 44.2-8.1 2.4-.3 2.5-.1 6.2 19.7 2 11 3.6 20.4 3.4 20.9-.2.9-137.6 26.9-138.4 26.2-.5-.6-36.2-193-35.8-193.4.2-.1 30.7-5.9 67.7-12.8 37.1-6.8 67.9-12.6 68.4-12.8.6-.2 1-.3 1.1-.2.1 0 1.8 9.4 3.9 20.9zm-155 30.4c4.1 21.9 4.1 22.2 2.1 22.6-1.2.3-12.7 2.4-25.7 4.8-19.5 3.5-23.6 4.6-23.3 5.8 1.2 5 27.3 147.5 27.1 147.6-.6.4-50.2 9.3-50.5 9-.2-.1-6.4-33.3-13.9-73.6-7.5-40.4-13.9-73.7-14.2-74.1-.4-.4-10.1 1-21.6 3.2-11.6 2.1-22.3 4-24 4.2l-3 .3-4.1-22c-2.2-12.1-4-22.1-3.8-22.3.4-.6 147.8-28 149.4-27.8 1.1.1 2.5 5.7 5.5 22.3zm-171 29.6c2.1 11.4 3.6 20.9 3.4 21.1-.2.2-19.5 3.8-42.9 8.1s-42.6 8-42.8 8.1c-.2.1 1.1 8.2 2.9 18.1l3.3 17.9 23.5-4.4c13-2.4 31.4-5.8 40.9-7.6 9.4-1.8 17.2-2.9 17.2-2.5 0 .4 1.4 7.9 3 16.7 1.7 8.9 3 16.7 3 17.4 0 1-10.3 3.3-39.7 8.7-21.9 4-40.1 7.6-40.4 8-.5.5 1 10.1 5.6 34.7l.5 3 41.8-7.7c22.9-4.3 42.8-7.9 44.2-8.1 2.4-.3 2.5-.1 6.2 19.7 2 11 3.6 20.4 3.4 20.9-.2.9-137.6 26.9-138.4 26.2-.5-.6-36.2-193-35.8-193.4.2-.1 30.7-5.9 67.7-12.8 37.1-6.8 67.9-12.6 68.4-12.8.6-.2 1-.3 1.1-.2.1 0 1.8 9.4 3.9 20.9zm-188.4 23.6c11.3 4.3 19.8 14.7 24.8 30.5 4.1 13 7.4 32.4 7.5 44.1.1 9-.2 10.6-2.7 15.7-3.6 7.4-10.2 13.7-18.8 18.3-3.8 2-6.9 4-6.9 4.6 0 .5 3.3.9 7.4.9 14.4 0 24.7 6.1 29.9 17.7 2.2 5 8.8 36 9.9 46.7l.3 3-25 4.7c-13.7 2.6-25.1 4.5-25.3 4.4-.1-.1-1.6-7.4-3.2-16.1-3.6-19.4-5-23.3-10-27.8-5.9-5.3-9.3-5.4-32.6-1.1-10.9 2-20.8 3.9-22 4.1-2 .5-1.9.9 2.8 26.2 2.6 14.1 4.6 25.7 4.4 25.9-.8.8-49.7 9.5-50.3 9-.6-.6-36.4-192.9-36-193.3.2-.1 13.9-2.7 78.2-14.5 38.2-7.1 54.8-7.8 67.6-3zm-201.9 34.6c10.5 2.8 16.7 6.4 24.9 14.5 5.7 5.6 8.5 9.4 11.2 15 4.9 10.3 6.8 17.6 13.8 55 8.9 47.3 9.1 59.8.9 76.7-3.9 7.9-10.4 15.1-18.9 20.7-17.8 11.9-55.2 20.9-86.6 21.1-13 0-16-.3-22.5-2.4-13-4-20.5-9-27.7-18.6-9.5-12.4-11.9-20.2-20.4-65.5-9-47.4-9.1-59.8-.7-76.9 4-8.3 13.4-17.7 22.9-23 12.8-7.1 39.8-14.7 60.9-17 5.2-.6 11.1-1.3 13-1.5 6.6-.8 22.9.3 29.2 1.9zm-180.1 35.6c7.5 3.5 13 8.6 16.7 15.6 8.6 16.4 11.8 43.5 6.5 55.3-2.6 5.8-9 12.1-15.3 15-2.8 1.3-5 2.7-5 3 0 .4 3.7 1 8.3 1.2 20.5 1.1 28.9 12 33.6 43.5 4.8 31.6-5.3 47-36.4 55.7-9.8 2.8-117.5 23-118.2 22.2-.6-.5-36.4-192.9-36-193.2.2-.3 97-18.3 108.7-20.3 3-.5 11.4-.9 18.5-.8 11.7.2 13.6.5 18.6 2.8zm877.9 80.7c0 .5-1.6 6-3.6 12.3-40.2 127.8-138.6 228.6-263.4 269.9-24.2 8-52.6 14.2-81 17.7-20.2 2.4-66.4 2.4-87.5-.1-90.9-10.7-172.2-49.5-237.8-113.5-15-14.6-34.1-36.7-46.3-53.7l-5.4-7.6 6.7-5.4c3.8-2.9 7.3-5.3 7.9-5.4.7 0 1.9 1.1 2.8 2.5.9 1.4 8.5 10.8 16.8 20.8 17 20.5 43.1 47.1 58.8 59.9 59.2 48.1 126.3 76.2 203 84.9 17.2 2 62.9 1.7 81-.5 96-11.6 179.4-55.2 243.3-127 34.2-38.4 59.6-82.1 77.1-132.6l6.1-17.5 9.5-2.6c10.8-3 12-3.2 12-2.1z" />
                  <path d="M547.5 793.1c-8.2 1.6-17.3 3.4-20.1 3.9l-5 1.1 4.7 25.6c2.7 14 5 25.7 5.1 25.9.5.4 41.5-7.3 45.6-8.7 11.3-3.7 12.9-8.4 9.3-28-2.2-12-3.9-16.4-7.6-19.9-3.9-3.6-13.1-3.6-32 .1zM363 825.5c-21.1 3.6-29.9 7.8-32.9 15.8-2.2 5.8-1.2 17.9 3.9 45.2 2.7 14.7 5.8 29.5 7 32.9 2.4 7.2 7 13.3 11.6 15.2 6.1 2.6 21.1 1.3 38.4-3.1 9-2.3 14.1-5.5 17-10.6 3.7-6.6 3.1-15.3-2.9-47.2-2.8-14.7-5.6-28.7-6.2-31-2.3-8.8-7.3-15.4-13.2-17.6-3.7-1.4-13.2-1.2-22.7.4zM163.3 861.3c-12.2 2.3-22.4 4.5-22.8 4.8-.4.5 5.2 33.7 5.9 34.5 0 .1 10.2-1.7 22.6-4.1 25.4-4.8 30.3-6.6 32.6-12.2 1.7-4 1.3-10.6-1.2-18.4-3.2-9.9-6.7-10.4-37.1-4.6zM176.3 932.3c-12.2 2.3-22.4 4.4-22.7 4.7-.4.5 6.1 38.1 6.7 38.6.1.1 10.4-1.7 23-4.1 24.5-4.7 30.7-6.8 33.8-11.9 3.8-6.3 1.4-22.8-4.2-28.2-4.4-4.2-10.4-4.1-36.6.9z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {filteredItems.map((item) => (
          <div
            key={item.partNumber}
            className={`px-2 mb-4 w-full md:w-1/3 ${
              item.isVisible ? '' : 'hidden'
            }`}
          >
            <PartCard qboID={0} {...item} onAddToEstimate={addToEstimate} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default PartsCards
