import React, { useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import { CustomerCard } from '../modals/customersSearch'

interface CustomerCardAddProps {
  onClose: () => void // Define the type of the onClose prop
  sendCustomerToParent: (newCustomer: CustomerCard) => void
}

const CustomerCardAdd: React.FC<CustomerCardAddProps> = ({ onClose }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [added, setAdded] = useState(false)
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    First_Name: '',
    Last_Name: '',
    Company: '',
    Email: '',
    Phone: '',
    Mobile: '',
    Address_Line1: '',
    Address_Line2: '',
    Address_City: '',
    Address_State_Code: '',
    Address_Zip_Code: '',
    Address_Country: '',
    Shipping_Address_Line1: '',
    Shipping_Address_Line2: '',
    Shipping_Address_City: '',
    Shipping_Address_State_Code: '',
    Shipping_Address_Zip_Code: '',
    Tax_Registration_Number: '',
    Customer_Type: '',
    Term: 1,
  })

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    setShippingSameAsBilling(value === 'yes')

    if (value === 'yes') {
      setNewCustomer((prevState) => ({
        ...prevState,
        Shipping_Address_Line1: prevState.Address_Line1,
        Shipping_Address_Line2: prevState.Address_Line2,
        Shipping_Address_City: prevState.Address_City,
        Shipping_Address_State_Code: prevState.Address_State_Code,
        Shipping_Address_Zip_Code: prevState.Address_Zip_Code,
      }))
    }
  }

  const handleChange = (field: string, value: string) => {
    setNewCustomer({ ...newCustomer, [field]: value })
  }

  const handleSave = async () => {
    // Check if all fields are filled
    const {
      Tax_Registration_Number,
      Customer_Type,
      Term,
      Mobile,
      Address_Line2,
      Shipping_Address_Line2,
      ...restOfCustomer
    } = newCustomer

    // Check if all fields, except `Tax_Registration_Number`, are filled
    const allFieldsFilled = Object.values(restOfCustomer).every(
      (value) => value.trim() !== ''
    )

    if (!allFieldsFilled) {
      alert('You must fill in all blue fields to save.')
      return // Exit the function early if not all fields are filled
    }

    setIsSaving(true)

    // If Tax_Registration_Number is present, add Customer_Type to the payload
    if (
      newCustomer.Tax_Registration_Number &&
      newCustomer.Tax_Registration_Number.trim() !== ''
    ) {
      newCustomer.Customer_Type = '3200000000000211064'
      newCustomer.Term = 3
    } else {
      newCustomer.Customer_Type = '3200000000000225696'
      newCustomer.Term = 1
    }

    //console.log(newCustomer)
    const params = {
      FunctionName: 'boretec_send_new_customer_2_quickbooks',
      Payload: JSON.stringify(newCustomer),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      //console.log('Lambda response:', response);

      // Parse the Payload to get the application-level response
      const applicationResponse = JSON.parse(
        new TextDecoder().decode(response.Payload)
      )
      //console.log('Application response:', applicationResponse);
      const responseBody = JSON.parse(applicationResponse.body)
      //console.log(responseBody);
      if (applicationResponse.statusCode === 200) {
        setIsSaving(false)
        setAdded(true)
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        alert('Failed to add the item: ' + responseBody.error)
        setIsSaving(false)
      }
    } catch (error) {
      alert('Failed to add the item. ' + error)
      console.error('Error invoking Lambda function:', error)
    }
  }

  return (
    <div>
      {isSaving && (
        <div className="bg-indigo-700 text-white flex justify-center items-center h-96">
          <p className="animate-pulse">Adding Customer...</p>
        </div>
      )}
      {added && (
        <div className="bg-indigo-700 text-white flex justify-center items-center h-96">
          <p>Added</p>
        </div>
      )}
      {!isSaving && (
        <div className="bg-white lg:text-sm mb-5 h-screen overflow-y-auto">
          <h1 className="text-2xl text-center w-full font-bold px-4 py-2 text-white bg-gray-900">
            New Customer
          </h1>
          {/* beginning of required div*/}
          <div className="px-4 py-2">
            <div className="mb-4">
              <p>First Name:</p>
              <input
                type="text"
                value={newCustomer.First_Name}
                onChange={(e) => handleChange('First_Name', e.target.value)}
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.First_Name
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Last Name:</p>
              <input
                type="text"
                value={newCustomer.Last_Name}
                onChange={(e) => handleChange('Last_Name', e.target.value)}
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Last_Name
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>
                Company Name: (This will be used as Display Name in QuickBooks)
              </p>
              <input
                type="text"
                value={newCustomer.Company}
                onChange={(e) => handleChange('Company', e.target.value)}
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Company
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Email:</p>
              <input
                type="text"
                value={newCustomer.Email}
                onChange={(e) => handleChange('Email', e.target.value)}
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Email
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Phone:</p>
              <input
                type="text"
                value={newCustomer.Phone}
                onChange={(e) => handleChange('Phone', e.target.value)}
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Phone
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Mobile:</p>
              <input
                type="text"
                value={newCustomer.Mobile}
                onChange={(e) => handleChange('Mobile', e.target.value)}
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Mobile
                    ? 'text-white bg-gray-600'
                    : 'text-gray-700 bg-gray-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Billing Address Line1:</p>
              <input
                type="text"
                value={newCustomer.Address_Line1}
                onChange={(e) => handleChange('Address_Line1', e.target.value)}
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Address_Line1
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Billing Address Line2:</p>
              <input
                type="text"
                value={newCustomer.Address_Line2}
                onChange={(e) => handleChange('Address_Line2', e.target.value)}
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Address_Line2
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Billing Address City:</p>
              <input
                type="text"
                value={newCustomer.Address_City}
                onChange={(e) => handleChange('Address_City', e.target.value)}
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Address_City
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Billing Address State:</p>
              <input
                type="text"
                value={newCustomer.Address_State_Code}
                onChange={(e) =>
                  handleChange('Address_State_Code', e.target.value)
                }
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Address_State_Code
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Billing Address Zip Code:</p>
              <input
                type="text"
                value={newCustomer.Address_Zip_Code}
                onChange={(e) =>
                  handleChange('Address_Zip_Code', e.target.value)
                }
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Address_Zip_Code
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Country:</p>
              <input
                type="text"
                value={newCustomer.Address_Country}
                onChange={(e) =>
                  handleChange('Address_Country', e.target.value)
                }
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Address_Country
                    ? 'text-white bg-blue-600'
                    : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>
            <div className="mb-4">
              <p>Is the shipping address the same as the billing address?</p>
              <select
                value={shippingSameAsBilling ? 'yes' : 'no'}
                onChange={handleAddressChange}
                className="border border-gray-600 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none bg-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            {!shippingSameAsBilling && <div>
            <div className="mb-4">
              <p>Shipping Address Line1:</p>
              <input
                type="text"
                value={newCustomer.Shipping_Address_Line1}
                onChange={(e) =>
                  handleChange('Shipping_Address_Line1', e.target.value)
                }
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Shipping_Address_Line1
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Shipping Address Line2:</p>
              <input
                type="text"
                value={newCustomer.Shipping_Address_Line2}
                onChange={(e) =>
                  handleChange('Shipping_Address_Line2', e.target.value)
                }
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Shipping_Address_Line2
                  ? 'text-white bg-gray-600'
                  : 'text-gray-700 bg-gray-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Shipping Address City:</p>
              <input
                type="text"
                value={newCustomer.Shipping_Address_City}
                onChange={(e) =>
                  handleChange('Shipping_Address_City', e.target.value)
                }
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Shipping_Address_City
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Shipping Address State:</p>
              <input
                type="text"
                value={newCustomer.Shipping_Address_State_Code}
                onChange={(e) =>
                  handleChange('Shipping_Address_State_Code', e.target.value)
                }
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Shipping_Address_State_Code
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>

            <div className="mb-4">
              <p>Shipping Address Zip Code:</p>
              <input
                type="text"
                value={newCustomer.Shipping_Address_Zip_Code}
                onChange={(e) =>
                  handleChange('Shipping_Address_Zip_Code', e.target.value)
                }
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Shipping_Address_Zip_Code
                  ? 'text-white bg-blue-600'
                  : 'text-gray-700 bg-blue-50'
                }`}
              />
            </div>
            </div>}

            <div className="mb-4">
              <p>Tax Registration Number :</p>
              <input
                type="text"
                value={newCustomer.Tax_Registration_Number}
                onChange={(e) =>
                  handleChange('Tax_Registration_Number', e.target.value)
                }
                className={`appearance-none border border-gray-600 rounded w-full py-2 px-3 leading-tight placeholder-gray-500 focus:outline-gray-600 ${
                  newCustomer.Tax_Registration_Number
                    ? 'text-white bg-gray-600'
                    : 'text-gray-700 bg-gray-50'
                }`}
              />
            </div>
          </div>

          {/* Buttons for Save and Close */}
          <div className="flex justify-end grid grid-cols-2 text-center">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-2"
              onClick={onClose}
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className={`bg-gray-700 hover:bg-gray-800 text-white font-bold py-2`}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerCardAdd
