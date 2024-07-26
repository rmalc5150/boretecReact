import React, { useState, useEffect, useRef } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import InventorySearch, { InventoryItem } from '../modals/inventorySearch'
import CustomerSearch, { CustomerCard } from '../modals/customersSearch'
import Cookies from 'js-cookie'

interface EstimateCardAddProps {
  onClose: ()=> void,

}

const EstimateCardAdd: React.FC<EstimateCardAddProps> = ({onClose}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCard | null>(
    null
  )
  const [expirationDate, setExpirationDate] = useState<Date>(
    new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000)
  )
  const [message, setMessage] = useState<string>('')
  const [emails, setEmails] = useState<string[]>([])
  const [discount, setDiscount] = useState(0)
  const [emailInputValue, setEmailInputValue] = useState('')
  const [showItemsHeader, setShowItemsHeader] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(true)
  const [showAddItems, setShowAddItems] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null);
  const [newItem, setNewItem] = useState({
    shippingCost: 0,
    discount: 0,
    shippingMethod: '',
    weight: '',
    total: '',
    additionalEmails: '',

    message: '',
  })

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  },[items, message, selectedCustomer, emails]);

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

  const handleChange = (field: string, value: string) => {
    setNewItem({ ...newItem, [field]: value })
  }

  const convertDateToString = () => {
    const date = new Date().toISOString();
    const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    const randomNum = Math.floor(Math.random() * 10);
    let modifiedDate = date.replace("T", randomChar).replace("Z", "-").replace(/:/g, randomChar);

    modifiedDate = modifiedDate.split('').map(char => {
        if (!isNaN(parseFloat(char)) && char !== '-') { // Check if character is a number and not the dash added at the end
            // Convert numbers 0-9 to letters a-j
            return String.fromCharCode(97 + parseInt(char));
        }
        return char;
    }).join('');

    // Append the random character to the end of the modified date string
    modifiedDate = randomChar + modifiedDate.replace(/-/g, randomNum.toString()).replace(".", (randomNum+1).toString());

    return modifiedDate;
}

const nameCheck = () => {
  const email = Cookies.get('email')
  if (email) {
    const extractedUsername = email.split('@')[0].toLowerCase()
    return extractedUsername
  }
}
  const handleSend = async () => {
    const urlKey = convertDateToString();
    setIsSaving(true);
    const payload = {
      items,
      selectedCustomer,
      tax: calculateTax(),
      subtotal: calculateSubTotal(),
      discount,
      message,
      emails, 
      expirationDate,
      urlKey: urlKey,
      dateCreated: new Date(),
      origin: nameCheck()
    };

    //console.log(payload);
    
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
     // console.log('Application response:', applicationResponse);
      const responseBody = JSON.parse(applicationResponse.body)
      const responseBodyEmail = JSON.parse(applicationResponseEmail.body)

      if (applicationResponse.statusCode === 200 && applicationResponseEmail.statusCode === 200 ) {
        //console.log('Item added successfully.');
        onClose();
      } else {
        setIsSaving(false);
        alert('Failed to add the item: ' + responseBody + responseBodyEmail)
      }
    } catch (error) {
      alert('Failed to add or send the estimate. ' + error)
      console.error('Error invoking Lambda function:', error)
    }
  }

  const handleCustomerClick = (customer: CustomerCard) => {
    setSelectedCustomer(customer)
    const keysToCheck: (keyof CustomerCard)[] = [
      'displayName',
      'familyName',
      'givenName',
      'companyName',
      'primaryEmail',
      'primaryPhone',
      'billAddressCity',
      'billAddressLine1',

      'billAddressState',
      'billAddressPostalCode',
      'country',
      'shipAddressState',
      'shipAddressCity',
      'shipAddressLine1',

      'shipAddressPostalCode',
    ]

    // Check each key for the customer
    for (const key of keysToCheck) {
      // If the key is not present, or is null, or is an empty string, set isEditing to true
      if (customer[key] === null || customer[key] === '') {
        setIsEditing(true)
        return // Exit the function early since we've found a field that meets the criteria
      }
    }

    //setShowAddCustomer(false)
    //setShowAddItems(true)
    //setShowItemsHeader(true)
    //console.log('Clicked customer:', customer);
  }

  const changeCustomer = () => {
    setIsEditing(true)
  }

  const handleInventoryClick = (items: InventoryItem[]) => {
    // Create a new array that includes all existing items plus the new item

    // Update the state with the new array
    setItems(items)
    setShowAddItems(false)
    setShowPreview(true)
    //console.log(items);

    // Optionally, log the updated items array to the console
    //console.log(items)
  }

  const removeItem = (itemToRemove: InventoryItem) => {
    // Create a new array excluding the item to remove
    const updatedItems = items.filter(
      (item) => item.partNumber !== itemToRemove.partNumber
    )

    // Update the state with the new array
    setItems(updatedItems)
  }

  const handleItemsChange = (index: number, quantity: string) => {
    const newInventory = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, quantity: parseInt(quantity, 10) || 0 }
      }
      return item
    })

    setItems(newInventory)
  }

  const invokeLambdaFunction = async (selectedCustomer: any) => {
    const {isVisible, ...otherFields} = selectedCustomer
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_update_customer_rds_only',
      Payload: JSON.stringify({payload: otherFields}),
    }
    //console.log(JSON.stringify({payload: selectedCustomer}));
    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject);
      return payloadObject
    } catch (error) {
      throw new Error('Error invoking Lambda function')
    }
  }

  const invokeLambdaFunctionQBO = async (payload: any) => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_send_customer_Update_2_QBO',
      Payload: JSON.stringify(payload),
    }
    //console.log(payload);
    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject);
      return payloadObject
    } catch (error) {
      throw new Error('Error invoking Lambda function')
    }
  }

  const saveCustomerDetails = async () => {
    if (
      selectedCustomer?.customerType === '' ||
      selectedCustomer?.customerType === null
    ) {
      setSelectedCustomer({
        ...selectedCustomer,
        customerType: 'Direct',
      })
    }

    const keysToCheck: (keyof CustomerCard)[] = [
      'familyName',
      'givenName',
      'companyName',
      'primaryEmail',
      'primaryPhone',
      'billAddressCity',
      'billAddressLine1',
      'billAddressState',
      'billAddressPostalCode',
      'country',
      'shipAddressState',
      'shipAddressCity',
      'shipAddressLine1',
      'shipAddressPostalCode',
    ]
    if (
      selectedCustomer?.customerType === 'Reseller' &&
      (selectedCustomer.taxResaleNumber === 0 ||
        selectedCustomer.taxResaleNumber === null)
    ) {
      alert('All resellers must have a Tax Resale Number.')
      return
    }
    // Check each key for the customer
    for (const key of keysToCheck) {
      // If the key is not present, or is null, or is an empty string, set isEditing to true
      if (
        !selectedCustomer ||
        selectedCustomer[key] === null ||
        selectedCustomer[key] === ''
      ) {
        alert('All blue fields must be filled in.')
        return // Exit the function early since we've found a field that meets the criteria
      }
    }

    setIsSaving(true)

    /*const date = new Date();
  const payload = {
    "familyName": selectedCustomer?.familyName,
    "givenName": selectedCustomer?.givenName,
    "primaryEmail": selectedCustomer?.primaryEmail,
    "mobilePhone": selectedCustomer?.mobilePhone || "",
    "companyName": selectedCustomer?.companyName,
    "billAddressLine1": selectedCustomer?.billAddressLine1,
    "billAddressLine2": selectedCustomer?.billAddressLine2 || "",
    "primaryPhone": selectedCustomer?.primaryPhone,
    "billAddressCity": selectedCustomer?.billAddressCity,
    "billAddressState": selectedCustomer?.billAddressState,
    "billAddressPostalCode": selectedCustomer?.billAddressPostalCode,
    "country": selectedCustomer?.country,
    "shipAddressCity": selectedCustomer?.shipAddressCity,
    "shipAddressLine1": selectedCustomer?.shipAddressLine1,
    "shipAddressLine2": selectedCustomer?.shipAddressLine2 || "",
    "shipAddressPostalCode": selectedCustomer?.shipAddressPostalCode,
    "updated": date
  };*/
   // console.log(selectedCustomer);
    try {
      const response = await invokeLambdaFunction(selectedCustomer)
      const responseQBO = await invokeLambdaFunctionQBO(selectedCustomer)
      if (response.statusCode === 200 && responseQBO.statusCode === 200) {
        setIsSaving(false)
        setShowAddCustomer(false)
        setShowAddItems(true)
        setShowItemsHeader(true)
        setIsEditing(false)
      } else {
        alert(
          `There was a problem saving: RDS: ${response} QBO: ${responseQBO}`
        )
      }
    } catch (error) {
      console.error('Error invoking Lambda function', error)
      setIsSaving(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInputValue(event.target.value)
  }

  const handleAddEmail = () => {
    if (emailInputValue.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(emailInputValue.trim())) {
        setEmails([...emails, emailInputValue.trim()])
        setEmailInputValue('')
      } else {
        // Handle invalid email format
        alert('Please enter a valid email address.')
      }
    }
  }

  const handleExpirationChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const days = parseInt(event.target.value)
    if (!isNaN(days)) {
      const currentDate = new Date()
      const expirationDate = new Date(
        currentDate.getTime() + days * 24 * 60 * 60 * 1000
      )
      setExpirationDate(expirationDate)
    }
  }

  const calculateSubTotal = () => {
    return items.reduce((total, item) => {
      return total + item.quantity * item.retailPrice
    }, 0)
  }

  const calculateTax = () => {
    let tax
    if (selectedCustomer?.customerType === 'Reseller') {
      tax = 0
    } else if (selectedCustomer?.shipAddressState.toLowerCase() === 'sc') {
      tax = (calculateSubTotal() - discount) * 0.07
    } else if (
      selectedCustomer?.shipAddressState.toLowerCase() === 'south carolina'
    ) {
      tax = (calculateSubTotal() - discount) * 0.07
    } else {
      tax = 0
    }

    return tax
  }

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    setDiscount(isNaN(value) ? 0 : value)
  }

  const copyBillingAddress = () => {
    setSelectedCustomer((prevState) => {
      // Provide a fallback empty string for properties that are potentially undefined but are expected to be strings
      if (prevState) {
        return {
          ...prevState,
          shipAddressLine1: prevState.billAddressLine1 ?? '',
          shipAddressLine2: prevState.billAddressLine2 ?? '',
          shipAddressCity: prevState.billAddressCity ?? '',
          shipAddressState: prevState.billAddressState ?? '',
          shipAddressPostalCode: prevState.billAddressPostalCode ?? '',
          // Make sure to provide appropriate fallbacks for all other properties that could be undefined
        };
      }
      return prevState; // Return prevState directly if it's null
    });
  };
  

  return (
    <div className="bg-white lg:text-sm">
      <div className="grid md:grid-cols-3">
        <button
          className="text-lg text-center font-medium px-4 py-1 text-white bg-blue-500"
          onClick={() => {
            setShowAddCustomer(true)
            setShowAddItems(false)
            setShowPreview(false)
            setShowPreview(false)
          }}
        >
          Customer Info
        </button>

        <button
          className={`text-lg text-center font-medium px-4 py-1 text-white bg-blue-600 ${
            !showItemsHeader ? 'opacity-20' : ''
          }`}
          disabled={!showItemsHeader}
          onClick={() => {
            setShowAddCustomer(false)
            setShowAddItems(true)
            setShowPreview(false)
            setShowPreview(false)
            setIsEditing(false)
          }}
        >
          Add Items
        </button>

        <button
          className={`text-lg text-center font-medium px-4 py-1 text-white bg-blue-700 ${
            !showPreview ? 'opacity-20' : ''
          }`}
          disabled={!showPreview}
        >
          Preview
        </button>
      </div>
      {/* beginning of input div*/}
      <div className="">
        {!selectedCustomer && showAddCustomer && (
          <div className="">
            {!isMobile && <div className="grid md:grid-cols-3 gap-1 my-1">
              <div>
                <p className="font-medium m-1">Contact details:</p>
                <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
                <div className="bg-gray-100 rounded-lg py-3 m-1 animate-pulse"></div>
 
                <p className="font-medium m-1">Customer Type:</p>
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
            </div>}
            <div className="p-1 text-gray-700 text-sm italic flex justify-center items-center text-gray-600 bg-gray-200 w-full border-t border-b border-gray-300">
              <p className="">Select a customer.</p>
            </div>
            <div className="bg-gray-100 py-1">
              <CustomerSearch
                onRowClick={handleCustomerClick}
                isMobile={isMobile}
              />
            </div>
          </div>
        )}
        {selectedCustomer && (
          <div>
            {isEditing && (
              <div className="p-1 text-gray-700 text-sm italic flex justify-center items-center text-gray-600 bg-gray-200 w-full border-t border-b border-gray-300">
                <p className="">Fill in the blue fields.</p>
              </div>
            )}
            <div className="border-t border-gray-300 grid md:grid-cols-3 gap-1 p-2">
              <div>
                <p className="font-medium">Contact details:</p>
                <div>
                  {isEditing ? (
                    <div>
                      <p>First Name:</p>
                      <input
                        id="givenName"
                        type="text"
                        value={selectedCustomer.givenName || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            givenName: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>Last Name:</p>
                      <input
                        id="familyName"
                        type="text"
                        value={selectedCustomer.familyName || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            familyName: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>Company Name:</p>
                      <input
                        id="companyName"
                        type="text"
                        value={selectedCustomer.companyName || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            companyName: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>Primary Email:</p>
                      <input
                        id="primaryEmail"
                        type="email"
                        value={selectedCustomer.primaryEmail || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            primaryEmail: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>Mobile Phone:</p>
                      <input
                        id="mobilePhone"
                        type="tel"
                        value={selectedCustomer.mobilePhone || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            mobilePhone: e.target.value,
                          })
                        }
                        className="focus:outline-blue-600 rounded-md px-2 py-1 border border-gray-600 w-full"
                      />
                      <p>Primary Phone:</p>
                      <input
                        id="primaryPhone"
                        type="tel"
                        value={selectedCustomer.primaryPhone || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            primaryPhone: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex space-x-2">
                        <p>{selectedCustomer.givenName}</p>
                        <p>{selectedCustomer.familyName}</p>
                      </div>
                      <p>{selectedCustomer.companyName}</p>
                      <p>{selectedCustomer.primaryEmail}</p>
                      <p>Phone: {selectedCustomer.primaryPhone}</p>
                      {selectedCustomer.mobilePhone && (
                        <p>Mobile: {selectedCustomer.mobilePhone}</p>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <p className="font-medium mt-2">Customer Type:</p>
                  {isEditing ? (
                    <select
                      defaultValue={selectedCustomer.customerType || ''}
                      onChange={(e) =>
                        setSelectedCustomer({
                          ...selectedCustomer,
                          customerType: e.target.value,
                        })
                      }
                      className={`customerType ${
                        isEditing
                          ? 'bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 flex-grow'
                          : ''
                      }`}
                    >
                      <option value="Direct">Direct</option>
                      <option value="Reseller">Reseller</option>
                    </select>
                  ) : (
                    <p>{selectedCustomer.customerType}</p>
                  )}
                  {selectedCustomer.customerType === 'Reseller' && (
                    <div>
                      <p className="font-medium">Tax Resale Number:</p>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={selectedCustomer.taxResaleNumber || ''}
                          onChange={(e) =>
                            setSelectedCustomer({
                              ...selectedCustomer,
                              taxResaleNumber: parseInt(e.target.value) || 0,
                            })
                          }
                          className={`taxResaleNumber ${
                            isEditing
                              ? 'bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 flex-grow'
                              : ''
                          }`}
                        />
                      ) : (
                        <p>{selectedCustomer.taxResaleNumber}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium">Billing Address:</p>
                <div>
                  {isEditing ? (
                    <>
                      <p>Line 1:</p>
                      <input
                        id="billAddressLine1"
                        type="text"
                        value={selectedCustomer.billAddressLine1 || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            billAddressLine1: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>Line 2:</p>
                      <input
                        id="billAddressLine2"
                        type="text"
                        value={selectedCustomer.billAddressLine2 || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            billAddressLine2: e.target.value,
                          })
                        }
                        className="focus:outline-blue-600 rounded-md px-2 py-1 border border-gray-600 w-full"
                      />
                      <p>City:</p>
                      <input
                        id="billAddressCity"
                        type="text"
                        value={selectedCustomer.billAddressCity || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            billAddressCity: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>State:</p>
                      <input
                        id="billAddressState"
                        type="text"
                        value={selectedCustomer.billAddressState || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            billAddressState: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>Postal/Zip Code:</p>
                      <input
                        id="billAddressPostalCode"
                        type="text"
                        value={selectedCustomer.billAddressPostalCode || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            billAddressPostalCode: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>Country:</p>
                      <input
                        id="country"
                        type="text"
                        value={selectedCustomer.country || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            country: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                    </>
                  ) : (
                    <>
                      <p>{selectedCustomer.billAddressLine1}</p>
                      <p>{selectedCustomer.billAddressLine2}</p>
                      <p>{selectedCustomer.billAddressCity}</p>
                      <p>{selectedCustomer.billAddressState}</p>
                      <p>{selectedCustomer.billAddressPostalCode}</p>
                      <p>{selectedCustomer.country}</p>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium">Shipping Address:</p>
                <div>
                
                  {isEditing ? (
                    <div>
                      <p>Line 1:</p>
                      <input
                        id="shipAddressLine1"
                        type="text"
                        value={selectedCustomer.shipAddressLine1 || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            shipAddressLine1: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>Line 2:</p>
                      <input
                        id="shipAddressLine2"
                        type="text"
                        value={selectedCustomer.shipAddressLine2 || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            shipAddressLine2: e.target.value,
                          })
                        }
                        className="focus:outline-blue-600 rounded-md px-2 py-1 border border-gray-600 w-full"
                      />
                      <p>City:</p>
                      <input
                        id="shipAddressCity"
                        type="text"
                        value={selectedCustomer.shipAddressCity || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            shipAddressCity: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>State:</p>
                      <input
                        id="shipAddressState"
                        type="text"
                        value={selectedCustomer.shipAddressState || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            shipAddressState: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                      <p>Postal/Zip Code:</p>
                      <input
                        id="shipAddressPostalCode"
                        type="text"
                        value={selectedCustomer.shipAddressPostalCode || ''}
                        onChange={(e) =>
                          setSelectedCustomer({
                            ...selectedCustomer,
                            shipAddressPostalCode: e.target.value,
                          })
                        }
                        className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                      />
                    <button className="border rounded-md border-gray-600 py-1 px-2 mt-5 w-full" onClick={copyBillingAddress}>Copy Billing Address</button>
                    </div>
                  ) : (
                    <>
                      <p>{selectedCustomer.shipAddressLine1}</p>
                      <p>{selectedCustomer.shipAddressLine2}</p>
                      <p>{selectedCustomer.shipAddressCity}</p>
                      <p>{selectedCustomer.shipAddressState}</p>
                      <p>{selectedCustomer.shipAddressPostalCode}</p>
                    </>
                  )}
                </div>
             
              </div>
            </div>
            {isEditing && (
              <button
                onClick={() => saveCustomerDetails()}
                className="bg-black text-white py-1 w-full px-2"
              >
                {isSaving ? (
                  <p className="animate-pulse">Saving...</p>
                ) : (
                  <p>Save and Continue</p>
                )}
              </button>
            )}
          </div>
        )}
        {!isEditing && selectedCustomer && showAddCustomer && (
          <div className="grid md:grid-cols-2">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="bg-gray-600 text-white py-1 px-2"
            >
              New Customer
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gray-700 text-white py-1 px-2"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setShowAddCustomer(false)
                setShowAddItems(true)
                setShowItemsHeader(true)
              }}
              className="bg-gray-800 text-white py-2 px-2 border-t border-white hover:bg-black col-span-2"
            >
              Add Items
            </button>
          </div>
        )}

        {items.length > 0 && !showAddItems && (
          <div>
            <div className="bg-gray-100 text-gray-600 text-center px-2 py-1 w-full">
              Requested Items
            </div>
            <div className="overflow-y-auto bg-white">
              <table className="leading-normal w-full text-center">
                <thead>
                  <tr className="text-center">
                    <th className="w-20">Quantity</th>
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
                          onChange={(e) =>
                            handleItemsChange(index, e.target.value)
                          }
                          className={`mx-1 cursor-pointer appearance-none w-20 px-1 py-1 text-center leading-tight`}
                        />
                      </td>
                      {!isMobile && (
                        <td className="px-1 w-20">
                          {item.images !==
                            'https://boretec.com/images/image-coming-soon.png' && (
                            <img
                              className="rounded-md h-12"
                              src={item.images}
                            />
                          )}
                        </td>
                      )}
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
                      {!isMobile && (
                        <td className="px-1">
                          $
                          {new Intl.NumberFormat('en-US', {
                            style: 'decimal',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.retailPrice * item.quantity)}
                        </td>
                      )}
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
          </div>
        )}

        {/*selectedCustomer && showAddCustomer && (
          <div className="grid grid-cols-2">
            <button
              className="w-full bg-gray-500 text-white py-1 px-2 text-center"
              onClick={() => setSelectedCustomer(null)}
            >
              Change Customer
            </button>
            <button
              className="w-full bg-gray-600 text-white py-1 px-2 text-center"
              onClick={() => {
                setShowAddCustomer(false)
                setShowAddItems(true)
              }}
            >
              Add Items
            </button>
          </div>
            )*/}

        {showAddItems && (
          <div className="">
            <div className="bg-gray-100">
              <InventorySearch
                handleAddItems={handleInventoryClick}
                itemsProp={items}
                
                isMobile={isMobile}
              />
            </div>
          </div>
        )}
      </div>
      {/* end of input div*/}
      {/* beginning of preview*/}
      {showPreview && (
        <div>
          <div className="px-4 py-2 grid md:grid-cols-2">
            <div>
              <div className="mt-2">
                {expirationDate && (
                  <p className="">
                    Expiration Date: {expirationDate.toDateString()}
                  </p>
                )}
                <label htmlFor="expiration" className=" mt-1 mr-2">
                  Expires in:
                </label>
                <select
                  id="expiration"
                  onChange={handleExpirationChange}
                  className="border border-gray-300 rounded-lg px-2 py-1"
                >
                  <option value="5">5 days</option>
                  <option value="15">15 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
              <div className="mt-2">
                <label htmlFor="discount" className="mr-2">
                  Apply a discount of
                </label>
                <input
                  type="number"
                  id="discount"
                  value={discount}
                  onChange={handleDiscountChange}
                  className="border border-gray-300 rounded-lg px-3 py-1 w-20"
                />
                %
              </div>
            </div>
            <div className="text-right">
              <div className="my-2">
                Subtotal: $
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(calculateSubTotal())}
              </div>

              <div className="mt-2">
                <p>
                  Discount: -$
                  {new Intl.NumberFormat('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format((calculateSubTotal() * discount) / 100)}
                </p>
              </div>
              <div className="mt-2">
                <p>
                  Tax: $
                  {new Intl.NumberFormat('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(calculateTax())}
                </p>
              </div>
              <div className="mt-2 font-bold">
                <p>
                  Total Cost: $ $
                  {new Intl.NumberFormat('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    calculateSubTotal() -
                      (calculateSubTotal() * discount) / 100 +
                      calculateTax()
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="m-2">
            <p>Message:</p>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-1"
            ></textarea>
          </div>
          <div className="m-2">
            <p>Additional emails:</p>
            <div className="flex flex-wrap">
              {emails.map((email, index) => (
                <div key={index} className="bg-gray-300 rounded-lg m-1 p-2">
                  {email}
                </div>
              ))}
            </div>
            <div className="flex items-center mt-2">
              <input
                type="email"
                value={emailInputValue}
                onChange={handleInputChange}
                placeholder="Add another email address to the estimate..."
                className="border border-gray-300 rounded-lg px-3 py-1 mr-2 flex-grow"
              />
              <button
                onClick={handleAddEmail}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 py-1 px-4 rounded-lg"
              >
                Add Email
              </button>
            </div>
          </div>
          {/* Buttons for Save and Close */}
          <div className="text-center">
            <button
              
              onClick={handleSend}
              className={`bg-gray-800 w-full hover:bg-black text-white font-bold py-2`}
            >
              {isSaving ? "Sending..." : "Save and Send"}
            </button>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

export default EstimateCardAdd
