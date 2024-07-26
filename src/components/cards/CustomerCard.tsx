'use client'

import React, { useEffect, useState } from 'react'
import CompanyLogo from '../ui/companyLogo'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import InvoiceSearch from '../buttons/InvoiceSearch'
import EstimateSearch from '../buttons/EstimateSearch'
import ShipmentSearch from '../buttons/shipmentSearch'
import Cookies from 'js-cookie'

//db fields
export interface customerCards {
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
  notes: string
  taxable: string
  customerType: string
  equipment: Equipment[]
  taxResaleNumber: string
  isVisible: boolean
}

// Define a type for individual machines
interface Equipment {
  id: number
  name: string
  checked: boolean
  type: string
}

// Update the CustomerCard function to accept customerCards props
const CustomerCard: React.FC<customerCards> = (props) => {
  const {
    displayName,
    qboID,
    fullyQualifiedName,
    dateCreated,
    equipment,
    balance,
    notes,
    taxable,
  } = props

  const [givenName, setGivenName] = useState(props.givenName)
  const [familyName, setFamilyName] = useState(props.familyName)
  const [companyName, setCompanyName] = useState(props.companyName)
  const [primaryEmail, setPrimaryEmail] = useState(props.primaryEmail)
  const [mobilePhone, setMobilePhone] = useState(props.mobilePhone)
  const [primaryPhone, setPrimaryPhone] = useState(props.primaryPhone)
  const [billAddressLine1, setBillAddressLine1] = useState(
    props.billAddressLine1
  )
  const [billAddressLine2, setBillAddressLine2] = useState(
    props.billAddressLine2
  )
  const [billAddressCity, setBillAddressCity] = useState(props.billAddressCity)
  const [billAddressState, setBillAddressState] = useState(
    props.billAddressState
  )
  const [billAddressPostalCode, setBillAddressPostalCode] = useState(
    props.billAddressPostalCode
  )
  const [country, setCountry] = useState(props.country)
  const [shipAddressLine1, setShipAddressLine1] = useState(
    props.shipAddressLine1
  )
  const [shipAddressLine2, setShipAddressLine2] = useState(
    props.shipAddressLine2
  )
  const [shipAddressCity, setShipAddressCity] = useState(props.shipAddressCity)
  const [shipAddressState, setShipAddressState] = useState(
    props.shipAddressState
  )
  const [shipAddressPostalCode, setShipAddressPostalCode] = useState(
    props.shipAddressPostalCode
  )
  const [customerType, setCustomerType] = useState(props.customerType)
  const [taxResaleNumber, setTaxResaleNumber] = useState(props.taxResaleNumber)
  const [companyUrl, setCompanyUrl] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [unsavedNotes, setUnsavedNotes] = useState(false)
  const [updatedNotes, setNotes] = useState(notes)
  const [showEquipment, setShowEquipment] = useState(false)
  const [showShipments, setShowShipments] = useState(false)
  const [showInvoices, setShowInvoices] = useState(false)
  const [showEstimates, setShowEstimates] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [unsavedEquipment, setUnsavedEquipment] = useState(false)
  const [textareaValue, setTextareaValue] = useState<string>('')
  const today = new Date().toString().slice(0, 15)
  // At the beginning of your component, check and parse if necessary
  const parsedEquipment =
    typeof equipment === 'string' ? JSON.parse(equipment) : equipment

  const nameCheck = () => {
    const email = Cookies.get('email')
    if (email) {
      const extractedUsername = email.split('@')[0].toLowerCase()
      return extractedUsername
    }
  }
  const name = nameCheck()
  const formatPhoneNumber = (phoneNumberString:string) => {
    // Ensure that the input is a string
    if (phoneNumberString){
    const cleanPhoneNumber = phoneNumberString.replace(/\D/g, '');;

    // Check if the phone number has the expected 10 digits
    if (cleanPhoneNumber.length === 10) {
        // Use template literals and slicing to format
        return `(${cleanPhoneNumber.slice(0, 3)}) ${cleanPhoneNumber.slice(3, 6)}-${cleanPhoneNumber.slice(6)}`;
    } else {
        // Return original or a message if it's not 10 digits
        return 'Invalid number; must be 10 digits';
    }
  }
}

  const findEquipmentCheckedState = (id: number): boolean => {
    if (parsedEquipment) {
      // Find the equipment item by id
      const item = parsedEquipment.find((equip: Equipment) => equip.id === id)
      // Return the checked state if found, otherwise false
      return item ? item.checked : false
    } else {
      return false
    }
  }
  const [updatedEquipment, setEquipment] = useState<Equipment[]>([
    {
      id: 1,
      name: `McL 10H`,
      type: 'machines',
      checked: findEquipmentCheckedState(1),
    } as Equipment,
    {
      id: 2,
      name: `McL 20 & 20B`,
      type: 'machines',
      checked: findEquipmentCheckedState(2),
    } as Equipment,
    {
      id: 3,
      name: `McL 24B & C`,
      type: 'machines',
      checked: findEquipmentCheckedState(3),
    } as Equipment,
    {
      id: 4,
      name: `McL 36/42B & C`,
      type: 'machines',
      checked: findEquipmentCheckedState(4),
    } as Equipment,
    {
      id: 5,
      name: `McL 48 CBM`,
      type: 'machines',
      checked: findEquipmentCheckedState(5),
    } as Equipment,
    {
      id: 6,
      name: `McL 54/60`,
      type: 'machines',
      checked: findEquipmentCheckedState(6),
    } as Equipment,
    {
      id: 7,
      name: `McL Workhorse`,
      type: 'machines',
      checked: findEquipmentCheckedState(7),
    } as Equipment,
    {
      id: 8,
      name: `12"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(8),
    } as Equipment,
    {
      id: 9,
      name: `16"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(9),
    } as Equipment,
    {
      id: 10,
      name: `18"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(10),
    } as Equipment,
    {
      id: 11,
      name: `20"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(11),
    } as Equipment,
    {
      id: 12,
      name: `24"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(12),
    } as Equipment,
    {
      id: 13,
      name: `30"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(13),
    } as Equipment,
    {
      id: 14,
      name: `36"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(14),
    } as Equipment,
    {
      id: 15,
      name: `42"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(15),
    } as Equipment,
    {
      id: 16,
      name: `48"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(16),
    } as Equipment,
    {
      id: 17,
      name: `54"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(17),
    } as Equipment,
    {
      id: 18,
      name: `60"`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(18),
    } as Equipment,
    {
      id: 19,
      name: `RUSH`,
      type: 'steeringHeads',
      checked: findEquipmentCheckedState(19),
    } as Equipment,
    {
      id: 20,
      name: `Combo`,
      type: 'cuttingHeads',
      checked: findEquipmentCheckedState(20),
    } as Equipment,
    {
      id: 21,
      name: `Rock`,
      type: 'cuttingHeads',
      checked: findEquipmentCheckedState(21),
    } as Equipment,
    {
      id: 22,
      name: `XTRM`,
      type: 'cuttingHeads',
      checked: findEquipmentCheckedState(22),
    } as Equipment,
    {
      id: 23,
      name: `Roller`,
      type: 'cuttingHeads',
      checked: findEquipmentCheckedState(23),
    } as Equipment,
    {
      id: 24,
      name: `Disc`,
      type: 'cuttingHeads',
      checked: findEquipmentCheckedState(24),
    } as Equipment,
    {
      id: 25,
      name: `Combo`,
      type: 'otsCuttingHeads',
      checked: findEquipmentCheckedState(25),
    } as Equipment,
    {
      id: 26,
      name: `Rock`,
      type: 'otsCuttingHeads',
      checked: findEquipmentCheckedState(26),
    } as Equipment,
    {
      id: 27,
      name: `XTRM`,
      type: 'otsCuttingHeads',
      checked: findEquipmentCheckedState(27),
    } as Equipment,
    {
      id: 28,
      name: `Roller`,
      type: 'otsCuttingHeads',
      checked: findEquipmentCheckedState(28),
    } as Equipment,
    {
      id: 29,
      name: `Disc`,
      type: 'otsCuttingHeads',
      checked: findEquipmentCheckedState(29),
    } as Equipment,
    {
      id: 30,
      name: `54"`,
      type: 'tbms',
      checked: findEquipmentCheckedState(30),
    } as Equipment,
    {
      id: 31,
      name: `60"`,
      type: 'tbms',
      checked: findEquipmentCheckedState(31),
    } as Equipment,
    {
      id: 32,
      name: `66"`,
      type: 'tbms',
      checked: findEquipmentCheckedState(32),
    } as Equipment,
    {
      id: 33,
      name: `72"`,
      type: 'tbms',
      checked: findEquipmentCheckedState(33),
    } as Equipment,
    {
      id: 34,
      name: `84"`,
      type: 'tbms',
      checked: findEquipmentCheckedState(34),
    } as Equipment,
  ])

  //setEquipment(maps all checkboxes and save checked status)
  const handleCheckboxChange = (
    id: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUnsavedEquipment(true)
    const newChecked = event.target.checked // Correctly extract the 'checked' state
    setEquipment((prevEquipment) =>
      prevEquipment.map((item) =>
        item.id === id ? { ...item, checked: newChecked } : item
      )
    )
  }

  //render checkboxes by type
  const renderEquipmentByType = (type: string) => {
    return updatedEquipment
      .filter((item) => item.type === type)
      .map((item) => (
        <div className="pl-2" key={item.id}>
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(event) => handleCheckboxChange(item.id, event)} // Pass the event here
            className="mx-1 accent-black"
          />
          {item.name}
        </div>
      ))
  }

  const saveEquipment = async () => {
    //console.log(updatedEquipment);
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_save_equipment',
      Payload: JSON.stringify({ updatedEquipment, displayName }),
    }
    //console.log(params);

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)

      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject);
      if (payloadObject.status != 200) {
        setUnsavedEquipment(true)
        alert(`The changes weren't saved: ${payloadObject}`)
      }
    } catch (error) {
      console.error('Error fetching inventory items', error)
    }
  }

  //function to save changes in details
  //send to QBO

  //function to fetch invoices

  //function to fetch estimates

  //function to fetch shipments

  // Function to check the email and set the company URL
  const checkAndSetCompanyUrl = (primaryEmail: string) => {
    // List of common free email providers' domains
    const freeEmailProviders: string[] = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'aol.com',
      'msn.com',
    ]

    // Extract the domain from the email
    let emailDomain = primaryEmail.split('@')[1]
    if (emailDomain.includes(',')) {
      emailDomain = emailDomain.split(',')[0]
    }

    // Check if the email domain is not in the list of free email providers
    if (!freeEmailProviders.includes(emailDomain)) {
      // The email is not from a free provider, so set the company URL
      setCompanyUrl(emailDomain)
    } else {
      // Optionally, handle the case where it's a free email provider
      //console.log('The provided email is from a free email provider.');
    }
  }

  useEffect(() => {
    //function to set companyUrl
    if (primaryEmail) {
      checkAndSetCompanyUrl(primaryEmail)
    }
    // Function to detect if the device is mobile
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    }
    // Set isOpen to true if isMobile returns true
    setIsMobile(isMobile())
  }, [])

  const sendToRds = async (scrapedNotes: string) => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_save_notes',
      Payload: JSON.stringify({ scrapedNotes, displayName }),
    }
    //console.log(params);

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)

      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject);
      if (payloadObject.status != 200) {
        setUnsavedNotes(true)
      }
    } catch (error) {
      console.error('Error fetching inventory items', error)
    }
  }

  const saveNotes = () => {
    const parent = document.getElementById(`${displayName.replace(/ /g, '-')}`)
    // Find the p tag with className 'date'
    const dateElement = parent?.querySelector('p.date')
    // Find the textarea
    const textAreaElement = parent?.querySelector(
      'textarea.notes'
    ) as HTMLTextAreaElement

    if (dateElement && textAreaElement) {
      // Extract text content
      const dateText = dateElement.textContent || ''
      const notesText = textAreaElement.value

      let scrapedNotes = ''
      // Append the concatenated text as a new paragraph to the notes variable
      if (updatedNotes) {
        scrapedNotes = `${updatedNotes}\n${dateText} ${notesText}`
      } else {
        scrapedNotes = `${dateText} ${notesText}`
      }
      // Update the notes state
      setNotes(scrapedNotes)
      setUnsavedNotes(false)
      setTextareaValue('')
      sendToRds(scrapedNotes)
    }
  }

  /*const extractInnerText = (selector: string): string => {
    const parent = document.getElementById(`${displayName.replace(/ /g, '-')}`)
    const element = parent?.querySelector(selector) as HTMLElement
    return element ? element.innerText : ''
  }*/

  const saveDetails = async () => {
    /*const details = {
      givenName: extractInnerText('.givenName'),
      familyName: extractInnerText('.familyName'),
      companyName: extractInnerText('.companyName'),
      primaryEmail: extractInnerText('.primaryEmail'),
      mobilePhone: extractInnerText('.mobilePhone'),
      primaryPhone: extractInnerText('.primaryPhone'),
      billAddressLine1: extractInnerText('.billAddressLine1'),
      billAddressLine2: extractInnerText('.billAddressLine2'),
      billAddressCity: extractInnerText('.billAddressCity'),
      billAddressState: extractInnerText('.billAddressState'),
      billAddressPostalCode: extractInnerText('.billAddressPostalCode'),
      country: extractInnerText('.country'),
      shipAddressCompanyName: extractInnerText('.shipAddressCompanyName'),
      shipAddressLine1: extractInnerText('.shipAddressLine1'),
      shipAddressLine2: extractInnerText('.shipAddressLine2'),
      shipAddressCity: extractInnerText('.shipAddressCity'),
      shipAddressState: extractInnerText('.shipAddressState'),
      shipAddressPostalCode: extractInnerText('.shipAddressPostalCode'),
      customerType: (document.querySelector(
        '.customerType'
      ) as HTMLSelectElement)
        ? (document.querySelector('.customerType') as HTMLSelectElement).value
        : '', // For select elements
      taxResaleNumber:
        customerType === 'Reseller' ? extractInnerText('.taxResaleNumber') : '',
    }*/

    const payload = {
      displayName,
      givenName,
      familyName,
      companyName,
      primaryEmail,
      mobilePhone,
      primaryPhone,
      billAddressLine1,
      billAddressLine2,
      billAddressCity,
      billAddressState,
      billAddressPostalCode,
      country,
      shipAddressLine1,
      shipAddressLine2,
      shipAddressCity,
      shipAddressState,
      shipAddressPostalCode,
      customerType,
      taxResaleNumber,
    }
    console.log(payload)
    const paramsRds = {
      FunctionName: 'boretec_update_customer_rds_only',
      Payload: JSON.stringify({ payload: payload }),
    }
    //console.log(paramsRds)
    /*const params = {
      FunctionName: 'boretec_send_customer_Update_2_QBO',
      Payload: JSON.stringify({ details, displayName }),
    }*/
    //console.log(params)

    try {
      //const command = new InvokeCommand(params)
      const commandRds = new InvokeCommand(paramsRds)
      //const response = await lambdaClient.send(command)
      const responseRds = await lambdaClient.send(commandRds)
      //const payloadString = new TextDecoder().decode(response.Payload)
      const payloadStringRds = new TextDecoder().decode(responseRds.Payload)
      //const payloadObject = JSON.parse(payloadString)
      const payloadObjectRds = JSON.parse(payloadStringRds)

      console.log(`rds: ${payloadStringRds}`)
      if (payloadObjectRds.statusCode === 200) {
        setUnsavedChanges(false)
        setIsEditing(false)
      } else {
        // Handle success case
        setUnsavedChanges(true) // Assuming you have a state to track unsaved changes
        alert(`The changes weren't saved.`)
      }
    } catch (error) {
      console.error('Error saving details', error)
    }
  }

  return (
    <div
      id={displayName.replace(/ /g, '-')}
      className={`bg-white my-4 rounded-lg overflow-hidden`}
    >
      {balance > 0 ? (
        <div className="bg-rose-600 text-white text-center p-1">
          <p className="">
            $
            {new Intl.NumberFormat('en-US', {
              style: 'decimal',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(balance)}{' '}
            balance
          </p>
        </div>
      ) : (
        <div className="bg-emerald-600 text-white text-center p-1">
          <p className="">
            {balance
              ? `$${balance.toFixed(2)} balance`
              : 'No outstanding balance'}
          </p>
        </div>
      )}
      <div className="border-r border-l border-gray-200">
      <div className="grid grid-cols-3 p-1">
        <div className="flex items-top">
          <a href={`https://${companyUrl}`} target="_blank">
            <CompanyLogo companyName={companyUrl} />
          </a>
        </div>
        <div>
          <div className="">
            <p className="w-full text-center font-medium text-lg">
              {displayName}
            </p>
          </div>
          <div className="">
            <p className="w-full text-center">
              {givenName} {familyName}
            </p>
          </div>
        </div>
        <div className="text-right font-medium">
          {companyName && <p className="">{companyName}</p>}
          <p className="text-gray-600 text-sm font-light">
            {taxResaleNumber ? 'Reseller' : 'Direct'}
          </p>
        </div>
      </div>
      <div className="text-center text-gray-700 py-1">
        <div className="">
          <div className="md:flex md:justify-center md:space-x-2">
            {!isMobile && <p>{formatPhoneNumber(primaryPhone)}</p>}
            {!isMobile && <p>{primaryEmail}</p>}
          </div>
          <div className="md:flex md:justify-center md:space-x-2">
            <p>{billAddressLine1}</p>
            <p>{billAddressLine2}</p>
            <p>
              {billAddressCity}
              <span>{billAddressCity ? ', ' : ' '}</span>
              {billAddressState}
            </p>

            <p>{billAddressPostalCode}</p>
            <p>{country}</p>
          </div>
        </div>
      </div>

      <div className="border-t bg-gray-50 border-gray-300">
        {!showEquipment && (
          <div
            onClick={() => setShowEquipment(true)}
            className="text-center py-1 cursor-pointer"
          >
            Equipment
          </div>
        )}
        {showEquipment && (
          <div
            onClick={() => setShowEquipment(false)}
            className="text-center py-1 cursor-pointer"
          >
            Hide Equipment
          </div>
        )}
        {showEquipment && (
          <div>
            <div className="checkBoxes grid sm:grid-cols-2 md:grid-cols-5 bg-white border-t border-gray-300 py-2">
              <div className="flex justify-center">
                <div className="">
                  <p className="font-medium">Machines</p>
                  {renderEquipmentByType('machines')}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="">
                  <p className="font-medium">OTS Steering Heads</p>
                  {renderEquipmentByType('steeringHeads')}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="">
                  <p className="font-medium">OTS Cutting Heads</p>
                  {renderEquipmentByType('otsCuttingHeads')}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="">
                  <p className="font-medium">Cutting Heads</p>
                  {renderEquipmentByType('cuttingHeads')}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="">
                  <p className="font-medium">TBMs</p>
                  {renderEquipmentByType('tbms')}
                </div>
              </div>
            </div>

            {unsavedEquipment && (
              <div
                className="bg-blue-700 text-white text-center cursor-pointer py-1"
                onClick={() => {
                  setUnsavedEquipment(false)
                  saveEquipment()
                }}
              >
                Save Changes
              </div>
            )}
          </div>
        )}
      </div>
      <div className="md:grid md:grid-cols-2 sm:grid-cols-1 text-gray-900 text-center bg-gray-50">
        <div className="border-t md:border-r bg-gray-50 border-gray-300">
          {!showNotes && (
            <div
              onClick={() => setShowNotes(true)}
              className="text-center py-1 cursor-pointer"
            >
              Notes
            </div>
          )}
          {showNotes && (
            <div
              onClick={() => setShowNotes(false)}
              className="text-center py-1 cursor-pointer"
            >
              Hide Notes
            </div>
          )}
        </div>
        <div className="border-t bg-gray-50 border-gray-300">
          {!showDetails && (
            <div
              onClick={() => setShowDetails(true)}
              className="text-center py-1 cursor-pointer"
            >
              Details
            </div>
          )}
          {showDetails && (
            <div
              onClick={() => setShowDetails(false)}
              className="text-center py-1 cursor-pointer"
            >
              Hide Details
            </div>
          )}
        </div>
      </div>
      {showNotes && (
        <div className="border-t border-gray-300">
          <div className="px-1 whitespace-pre-wrap text-sm">{updatedNotes}</div>
          <div className="updatedNotes">
            <p className="date text-sm px-1">
              {today}{' '}
              {name
                ? `(${name.slice(0, 1).toUpperCase() + name.slice(1)})`
                : ''}
              :
            </p>
            <textarea
              className="notes text-gray-600 bg-white font-light h-full w-full px-1"
              contentEditable="true"
              value={textareaValue}
              onChange={(e) => {
                setTextareaValue(e.target.value)
                setUnsavedNotes(true)
              }}
              placeholder="new note..."
            ></textarea>
          </div>
        </div>
      )}
      {showDetails && (
        <div
          className="border-t border-gray-300 grid md:grid-cols-2 lg:grid-cols-4 gap-1 p-2"
          onDoubleClick={() => setIsEditing(true)}
        >
          <div>
            <p className="font-medium">Contact details:</p>

            {isEditing ? (
              <div>
                <p>First Name:</p>
                <input
                  value={givenName}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setGivenName(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            ) : (
              <p>
                {givenName} {familyName}
              </p>
            )}

            {isEditing && (
              <div>
                <p>Last Name:</p>
                <input
                  value={familyName}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setFamilyName(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            )}

            {isEditing ? (
              <div>
                <p>Company Name:</p>
                <input
                  value={companyName}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setCompanyName(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            ) : (
              <p>{companyName}</p>
            )}

            {isEditing ? (
              <div>
                <p>Primary Email:</p>
                <input
                  value={primaryEmail}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setPrimaryEmail(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            ) : (
              <p>{primaryEmail}</p>
            )}

            {isEditing ? (
              <div>
                <p>Mobile Phone:</p>
                <input
                  value={mobilePhone}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setMobilePhone(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            ) : (
              <div>{mobilePhone && <p>Mobile: {formatPhoneNumber(mobilePhone)}</p>}</div>
            )}

            {isEditing ? (
              <div>
                <p>Primary Phone:</p>
                <input
                  value={primaryPhone}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setPrimaryPhone(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            ) : (
              <div>{primaryPhone && <p>Primary: {formatPhoneNumber(primaryPhone)}</p>}</div>
            )}
          </div>
          <div>
            <div>
              <p className="font-medium">Billing Address:</p>

              {isEditing && (
                <div>
                  <p>Line 1:</p>
                  <input
                    value={billAddressLine1}
                    onChange={(e) => {
                      setUnsavedChanges(true)
                      setBillAddressLine1(e.target.value)
                    }}
                    className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                  />

                  <p>Line 2:</p>
                  <input
                    value={billAddressLine2}
                    onChange={(e) => {
                      setUnsavedChanges(true)
                      setBillAddressLine2(e.target.value)
                    }}
                    className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                  />

                  <p>City:</p>
                  <input
                    value={billAddressCity}
                    onChange={(e) => {
                      setUnsavedChanges(true)
                      setBillAddressCity(e.target.value)
                    }}
                    className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                  />

                  <p>State:</p>
                  <input
                    value={billAddressState}
                    onChange={(e) => {
                      setUnsavedChanges(true)
                      setBillAddressState(e.target.value)
                    }}
                    className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                  />

                  <p>Postal/Zip Code:</p>
                  <input
                    value={billAddressPostalCode}
                    onChange={(e) => {
                      setUnsavedChanges(true)
                      setBillAddressPostalCode(e.target.value)
                    }}
                    className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                  />

                  <p>Country:</p>
                  <input
                    value={country}
                    onChange={(e) => {
                      setUnsavedChanges(true)
                      setCountry(e.target.value)
                    }}
                    className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                  />
                </div>
              )}

              {!isEditing && (
                <div>
                  <p>{billAddressLine1}</p>
                  {billAddressLine2 && <p>{billAddressLine2}</p>}
                  <p>
                    {billAddressCity}{billAddressCity && ","} {billAddressState}{' '}
                    {billAddressPostalCode}
                  </p>
                  <p>{country}</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="font-medium">Shipping Address:</p>
            {!isEditing && (
              <div>
                <p>{shipAddressLine1}</p>
                {shipAddressLine2 && <p>{shipAddressLine2}</p>}
                <p>
                  {shipAddressCity}{shipAddressCity && ","} {shipAddressState} {shipAddressPostalCode}
                </p>
              </div>
            )}
            {isEditing && (
              <div>
                <p>Line 1:</p>
                <input
                  value={shipAddressLine1}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setShipAddressLine1(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            )}

            {isEditing && (
              <div>
                <p>Line 2:</p>
                <input
                  value={shipAddressLine2}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setShipAddressLine2(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            )}

            {isEditing && (
              <div>
                <p>City:</p>
                <input
                  value={shipAddressCity}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setShipAddressCity(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            )}

            {isEditing && (
              <div>
                <p>State:</p>
                <input
                  value={shipAddressState}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setShipAddressState(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            )}

            {isEditing && (
              <div>
                <p>Postal/Zip Code:</p>
                <input
                  value={shipAddressPostalCode}
                  onChange={(e) => {
                    setUnsavedChanges(true)
                    setShipAddressPostalCode(e.target.value)
                  }}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">Customer Type:</p>
            <select
              defaultValue={customerType}
              onChange={(e) => {
                setCustomerType(e.target.value)
                setUnsavedChanges(true)
                setIsEditing(true)
              }}
              className={`customerType ${
                isEditing
                  ? 'bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 flex-grow'
                  : ''
              }`}
            >
              <option value="Direct">Direct</option>
              <option value="Reseller">Reseller</option>
            </select>

            {customerType === 'Reseller' && (
              <div>
                {isEditing ? (
                  <div>
                    <p>Tax Resale Number:</p>
                    <input
                      value={taxResaleNumber}
                      onChange={(e) => {
                        setUnsavedChanges(true)
                        setTaxResaleNumber(e.target.value)
                      }}
                      className="bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 w-full"
                    />
                  </div>
                ) : (
                  <p>{taxResaleNumber}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {isEditing && (
        <div
          className="bg-purple-700 text-white text-center cursor-pointer py-1"
          onClick={() => {
            setUnsavedChanges(false)
            setIsEditing(false)
          }}
        >
          Exit without saving
        </div>
      )}
      {unsavedChanges && (
        <div
          className="bg-blue-700 text-white text-center cursor-pointer py-1"
          onClick={() => {
            saveDetails()
          }}
        >
          Save Changes
        </div>
      )}
      {unsavedNotes && (
        <div
          className="bg-purple-700 text-white text-center cursor-pointer py-1"
          onClick={() => {
            setUnsavedNotes(false); setTextareaValue('')
          }}
        >
          Discard Notes
        </div>
      )}
      {unsavedNotes && (
        <div
          className="bg-blue-700 text-white text-center cursor-pointer py-1"
          onClick={() => saveNotes()}
        >
          Save Notes
        </div>
      )}
      <div className="md:grid md:grid-cols-3 sm:grid-cols-1 text-gray-900 text-center bg-gray-50">
        <div className="border-t md:border-r border-gray-300 bg-gray-50 py-1">
          {!showShipments && (
            <div
              onClick={() => setShowShipments(true)}
              className="text-center cursor-pointer"
            >
              Shipments
            </div>
          )}
          {showShipments && (
            <div
              onClick={() => setShowShipments(false)}
              className="text-center cursor-pointer"
            >
              Hide Shipments
            </div>
          )}
        </div>
        <div className="md:border-r border-t border-gray-300 py-1">
          {!showInvoices && (
            <div
              onClick={() => setShowInvoices(true)}
              className="text-center cursor-pointer"
            >
              Past Invoices
            </div>
          )}
          {showInvoices && (
            <div
              onClick={() => setShowInvoices(false)}
              className="text-center cursor-pointer"
            >
              Hide Invoices
            </div>
          )}
        </div>
        <div className="border-t border-gray-300 py-1">
          {!showEstimates && (
            <div
              onClick={() => setShowEstimates(true)}
              className="text-center cursor-pointer"
            >
              Past Estimates
            </div>
          )}
          {showEstimates && (
            <div
              onClick={() => setShowEstimates(false)}
              className="text-center cursor-pointer"
            >
              Hide Estimates
            </div>
          )}
        </div>
      </div>
      {showShipments && <ShipmentSearch companyName={displayName} />}
      {showEstimates && <EstimateSearch displayName={displayName} />}
      {showInvoices && <InvoiceSearch displayName={displayName} />}
      </div>
      <div className="md:grid md:grid-cols-3 sm:grid-cols-1 text-white text-center bg-gray-900">
        {primaryEmail ? (
          <a href={`mailto:${primaryEmail}`} style={{ textDecoration: 'none' }}>
            <div className="md:border-r border-b md:border-b-0 border-gray-50 py-1">
              Email
            </div>
          </a>
        ) : (
          <div className="md:border-r border-b md:border-b-0 border-gray-50 py-1">
            No email on file
          </div>
        )}

        {mobilePhone ? (
          <a href={`sms:${mobilePhone}`} style={{ textDecoration: 'none' }}>
            <div className="md:border-r border-b md:border-b-0 border-gray-50 py-1">
              Text
            </div>
          </a>
        ) : (
          <div className="md:border-r border-b md:border-b-0 border-gray-50 py-1">
            No mobile phone on file
          </div>
        )}

        {primaryPhone ? (
          <a href={`tel:${primaryPhone}`} style={{ textDecoration: 'none' }}>
            <div className="py-1">Call</div>
          </a>
        ) : (
          <div className="py-1">No phone on file</div>
        )}
      </div>
    </div>
  )
}
export default CustomerCard
