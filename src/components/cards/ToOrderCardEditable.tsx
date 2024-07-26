'use client'
import React, {
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react'
import AddConfirmationOrder from '../../components/buttons/AddConfirmationOrder'
import IgnoreConfirmationOrder from '../../components/buttons/IgnoreConfirmationOrder'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import Cookies from 'js-cookie'
import CompanyLogoOrder from '../ui/companyLogoOrder'
import CancelReturnConfirmationOrder from '../../components/buttons/CancelReturnConfirmationOrder'
import VendorSearch, { VendorItem } from '../modals/vendorSearch'

interface OrderCardEditableProps {
  vendors: string
  quantity: number
  status: string
  imageUrl: string
  partNumber: string
  internalDescription: string
  dateEdited: string
  dateCreated: string
  partLocation: string
  dateOrdered: string
  dateNeeded: string
  manufacturer: string
  manufactPartNum: string
  vendorUsed: string
  leadTime: number
  cost: number
  origin: string
  PoNumber: string
  paymentMethod: string
  id: number
}

const ToOrderCardEditable: React.FC<OrderCardEditableProps> = (props) => {
  const {
    id,
    partLocation,
    vendorUsed,
    leadTime,
    dateNeeded: initialDateNeeded,
    dateCreated,
    PoNumber,
    paymentMethod,
    dateEdited,
    internalDescription,
    quantity,
    partNumber,
    origin,
    imageUrl,
  } = props
  //const initialVendors: VendorItem[] = JSON.parse(props.vendors)
  const [dateNeeded, setDateNeeded] = useState<Date | null>(
    initialDateNeeded ? new Date(initialDateNeeded) : null
  )
  const [manufacturer, setManufacturer] = useState(props.manufacturer)
  const [manufactPartNum, setManufactPartNum] = useState(props.manufactPartNum)
  const [showAddConfirmation, setShowAddConfirmation] = useState(false)
  const [removeButton, setRemoveButton] = useState(false)
  const [showAddVendorDiv, setShowAddVendorDiv] = useState(false)
  const [isEdited, setIsEdited] = useState(false)
  const [editableVendorIndex, setEditableVendorIndex] = useState<number | null>(
    null
  )
  const [dateOrdered, setDateOrdered] = useState(props.dateOrdered)
  const [paymentOption, setPaymentOption] = useState(
    props.paymentMethod || 'nothingSelected'
  )
  const [hasVendors, SetHasVendors] = useState(false)
  const [showIgnoreConfirmation, setShowIgnoreConfirmation] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [showReturnConfirmation, setShowReturnConfirmation] = useState(false)
  const [showPaymentMethod, SetShowPaymentMethod] = useState(false)
  const [showUpdateVendors, SetShowUpdateVendors] = useState(false)
  const [status, setStatus] = useState(props.status)
  const [vendors, setVendors] = useState<VendorItem[]>(() => {
    try {
      // Attempt to parse the vendors JSON, fallback to an empty array if parsing fails or is not an array
      const parsedVendors = JSON.parse(props.vendors);
      return Array.isArray(parsedVendors) ? parsedVendors : [];
    } catch (error) {
      console.error("Failed to parse vendors from props:", error);
      return [];
    }
  });
  const [cost, setCost] = useState(props.cost)
  const [passedDue, setPassedDue] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null)
  function findLowestCostVendor(vendors: VendorItem[]): VendorItem | null {
    // No need to parse from string, vendors is already an array of Vendor objects
    const selectedVendor = vendors.reduce(
      (lowest: VendorItem | null, vendor: VendorItem) => {
        return !lowest || vendor.vCost < lowest.vCost ? vendor : lowest
      },
      null
    )

    // Return the vendor object directly, no need to stringify
    return selectedVendor
  }

  const removeVendor = (indexToRemove: number) => {
    const updatedVendors = vendors.filter((_, index) => index !== indexToRemove)
    setVendors(updatedVendors)
    // Optionally reset any related states if necessary
    if (selectedVendor && selectedVendor === vendors[indexToRemove]) {
      setSelectedVendor(findLowestCostVendor(updatedVendors))
      setCost(selectedVendor.vCost) // Reset cost or set it to a default/initial value
      if (updatedVendors.length === 0) {
        setStatus('addVendor')
      }
    }
  }

  useEffect(() => {
    //console.log(props.vendors)
    // Function contents moved into useEffect
    if (vendors.length > 0 && !vendorUsed) {
      const selectedVendor = findLowestCostVendor(vendors)
      if (selectedVendor) {
        setSelectedVendor(selectedVendor)
        SetHasVendors(true)
        setCost(selectedVendor.vCost)
        if (paymentOption === 'nothingSelected') {
          setStatus('addPaymentMethod')
        }
      }
    } else if (vendorUsed) {
      //&& leadTime
      //setSelectedVendor to the object with vendorUsed === vName
      const usedVendor = vendors.find(
        (vendor) => vendor.vName === vendorUsed
      )
      setSelectedVendor(usedVendor || null)
      const currentDate = new Date() // Current date and time
      const dateOrderedDate = new Date(dateOrdered) // Assuming dateOrdered is in a format that can be parsed
      const timeDiff = currentDate.getTime() - dateOrderedDate.getTime() // Difference in milliseconds
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24) // Convert milliseconds to days
      //console.log(daysDiff);
      if (daysDiff >= leadTime) {
        setStatus('followUp')
        setPassedDue(daysDiff.toFixed(2))
      }
    } else if (vendors.length === 0) {
      setStatus('addVendor')
    } else {
      setStatus(props.status)
    }
  }, [])

  const nameCheck = () => {
    const email = Cookies.get('email')
    if (email) {
      const extractedUsername = email.split('@')[0].toLowerCase()
      return extractedUsername
    }
  }

  const newTime = () => {
    const dateTimeArray = new Date().toString()
    return dateTimeArray
  }

  /*const updateVendorsArray = () => {
    const parent = document.getElementById(`div-${partNumber + dateCreated}`)
    if (!parent) {
      console.error('Parent element not found')
      return
    }
    if (!parent.getElementsByClassName('vendor')) {
      console.error('vendors not open not found')
      return
    }
    const updatedVendors: VendorItem[] = Array.from(
      parent.getElementsByClassName('vendor')
    ).map((vendorElement) => {
      let vUrl = vendorElement.querySelector('.vUrl')?.textContent?.trim() || ''
      // Check for '@' and prepend 'mailto:', if not present check for absence of '.' and prepend 'tel:'
      if (!vUrl.startsWith('mailto:') && vUrl.includes('@')) {
        vUrl = `mailto:${vUrl}`
      } else if (!vUrl.startsWith('tel:') && !vUrl.includes('.')) {
        // Remove all non-numeric characters for phone numbers
        const numericVUrl = vUrl.replace(/\D/g, '')
        vUrl = `tel:+1${numericVUrl}`
      }

      return {
        vName: vendorElement.querySelector('.vName')?.textContent?.trim() || '',
        vUrl, // vendorElement.querySelector('.vUrl')?.textContent?.trim() || '',
        vPartNumber:
          vendorElement.querySelector('.vPartNumber')?.textContent?.trim() ||
          '',
        vLeadTime: parseInt(
          vendorElement.querySelector('.vLeadTime')?.textContent?.trim() || '0',
          10
        ),
        vCost: parseFloat(
          vendorElement.querySelector('.vCost')?.textContent?.trim() || '0'
        ),
        vPaymentMethod:
          (
            vendorElement.querySelector('.vPaymentMethod') as HTMLSelectElement
          )?.value.trim() || '',
      
      }
    })

    // Assuming setVendors is a state setter function that updates the vendors state
    setVendors(updatedVendors)
    //console.log(updatedVendors);
    return updatedVendors
  }
  const updatedCost = () => {
    const parent = document.getElementById(`div-${partNumber + dateCreated}`)
    if (!parent) {
      console.error('Parent element not found')
      return
    }
    const updatedCost = parseFloat(
      parent.getElementsByClassName('cost')[0]?.textContent || ''
    )
    setCost(updatedCost)
    return updatedCost
  }*/

  const toggleIgnoreConfirmation = () =>
    setShowIgnoreConfirmation(!showIgnoreConfirmation)

  const handleHideIgnoreConfirmation = () => {
    setShowIgnoreConfirmation(false)
  }

  const saveChanges = async () => {
    try {
      //map existing vendors if there are edits.
      //const updatedvendors = updateVendorsArray() //redo with correct vendor list.
      const parent = document.getElementById(`div-${partNumber + dateCreated}`)
      if (!parent) {
        console.error('Parent element not found')
        return
      }
      /*
      if (!parent.getElementsByClassName('vendor').length) {
        console.error('Vendors not found')
        return
      }

      const vendorsElements = Array.from(
        parent.getElementsByClassName('vendor')
      )*/

      for (const vendor of vendors) {
        if (!vendor.vName || !vendor.vUrl || !vendor.vCost || !vendor.vLeadTime) {
          alert('Each vendor must have a name, URL, cost, and lead time.');
          return; // Stop execution if any vendor is missing required fields
        }
      }
      /*const updatedManufacturer = (
        parent.getElementsByClassName('manufacturer')[0] as HTMLInputElement
      )?.value
      const updatedManufactPartNum = (
        parent.getElementsByClassName('manufactPartNum')[0] as HTMLInputElement
      )?.value*/

      const payload = {
        partNumber,
        newContent: {
          manufacturer,
          manufactPartNum,
          vendors,
          dateEdited: newTime(),
          editor: nameCheck(),
        },
      }
      console.log(payload)
      const params: InvokeCommandInput = {
        FunctionName: 'boretec_update_toOrder',
        Payload: JSON.stringify(payload),
      }

      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)

      const applicationResponse = JSON.parse(
        new TextDecoder().decode(response.Payload)
      )
      //console.log(applicationResponse)

      if (applicationResponse.status === 200) {
        //console.log('Update successful.')
      } else if (applicationResponse.status === 500) {
        const responseBody = JSON.parse(applicationResponse.body)
        alert("Item didn't update" + responseBody.error)
        console.error('Update failed.', applicationResponse)
      }
    } catch (error) {
      console.error('Error invoking Lambda function', error)
      alert("Item didn't update" + error)
    }

    setIsEdited(false)
  }

  const markAsOrdered = async () => {
    setStatus('ordered')
    setDateOrdered(new Date().toLocaleDateString())

    try {
      const payload = {
        partNumber,
        cost: selectedVendor?.vCost,
        updatedStatus: 'ordered',
        dateEdited: newTime(),
        editor: nameCheck(),
        vendorUsed: selectedVendor?.vName,
        vendorQboID: selectedVendor?.qboID,
        quantity,
        dateCreated,
        id,
        dateNeeded,
        paymentMethod: paymentOption,
        dateOrdered: new Date(),
        leadTime: selectedVendor?.vLeadTime,
        //PoNumber: new Date(),
      }
      console.log(payload)
      const params: InvokeCommandInput = {
        FunctionName: 'boretec_update_toOrder_Status',
        Payload: JSON.stringify(payload),
      }

      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)

      const applicationResponse = JSON.parse(
        new TextDecoder().decode(response.Payload)
      )
      //console.log(applicationResponse)

      if (applicationResponse.status === 200) {
        console.log('Update successful.')
      } else if (applicationResponse.status === 500) {
        const responseBody = JSON.parse(applicationResponse.body)
        alert("Item didn't update" + responseBody.error)
        console.error('Update failed.', applicationResponse)
      }
    } catch (error) {
      console.error('Error invoking Lambda function', error)
      alert("Item didn't update" + error)
    }
  }

  const toggleShowPaymentMethods = () => {
    if (showPaymentMethod) {
      SetShowPaymentMethod(false)
    } else {
      SetShowPaymentMethod(true)
    }
  }

  const toggleAddConfirmation = () => {
    setShowAddConfirmation(!showAddConfirmation)
  }
  const toggleUpdateVendors = () => {
    if (showUpdateVendors) {
      SetShowUpdateVendors(false)
    } else {
      SetShowUpdateVendors(true)
    }
  }
  const toggleShowAddVendorDiv = () => {
    if (showAddVendorDiv) {
      setShowAddVendorDiv(false)
    } else {
      setShowAddVendorDiv(true)
    }
  }

  const handleHideAddConfirmation = () => {
    setShowAddConfirmation(false)
  }

  const checkPaymentStatus = (value: string) => {
    if (
      vendors.length > 0 &&
      value !== 'nothingSelected' &&
      status !== 'ordered'
    ) {
      setStatus('placeOrder')
    }
  }
  const calculateExpectedDate = (
    dateOrdered: string,
    leadTime: number
  ): string => {
    const date = new Date(dateOrdered)
    date.setDate(date.getDate() + leadTime) // Add lead time in days to the order date
    return date.toString().slice(0, 10) // Format the date back to a string, you could also specify formatting options
  }

  const getStatusContent = () => {
    switch (status) {
      case 'addPaymentMethod':
        return { message: 'Add Payment Method', className: 'bg-cyan-600' }
      case 'addVendor':
        return { message: 'Add Vendor', className: 'bg-cyan-600' }
      case 'placeOrder':
        return { message: 'Place Order', className: 'bg-cyan-600' }
      case 'ordered':
        return {
          message: `Expected: ${calculateExpectedDate(dateOrdered, leadTime)}`,
          className: 'bg-emerald-600',
        }
      case 'followUp':
        return {
          message: `${(parseFloat(passedDue) - 1).toFixed(2)} days late`,
          className: 'bg-rose-500',
        }
      default:
        return { message: 'Status Unknown', className: 'bg-gray-500' }
    }
  }

  const statusContent = getStatusContent()

  const handleVendorChange = <T extends VendorItem, K extends keyof VendorItem>(index: number, key: K, value: T[K]) => {
    setVendors(prevVendors => {
        const newVendors = [...prevVendors];
        const vendor = newVendors[index];
        if (vendor) {
            // Direct assignment with generic handling
            vendor[key] = value;
        }
        //console.log(newVendors);
        return newVendors;
    });
};
  

  const handleAddVendor = (newVendor: VendorItem) => {
    let index
    if (vendors.length === 0) {
      index = 0
      setVendors([newVendor])
      setEditableVendorIndex(index)
      setShowAddVendorDiv(false)
      SetHasVendors(true)
    } else {
      // Check if the newVendor's vName is already in the array
      const isVendorExist = vendors.some(
        (vendor) => vendor.vName === newVendor.vName
      )
      if (!isVendorExist) {
        index = vendors.length
        const updatedVendors = [...vendors, newVendor]
        setVendors(updatedVendors)
        setEditableVendorIndex(index)
        //console.log(updatedVendors)
      } else {
        alert('Vendor already attached to this order.')
      }
    }
  }

  return (
    <div>
      {showAddConfirmation && (
        <AddConfirmationOrder
          partNumber={partNumber}
          dateCreated={dateCreated}
          quantity={quantity}
          cost={cost}
          onHide={handleHideAddConfirmation}
        />
      )}

      {showIgnoreConfirmation && (
        <IgnoreConfirmationOrder
          dateCreated={dateCreated}
          partNumber={partNumber}
          quantity={quantity}
          onHide={handleHideIgnoreConfirmation}
        />
      )}
      {showCancelConfirmation && (
        <CancelReturnConfirmationOrder
          dateCreated={dateCreated}
          updatedStatus="canceled"
          editor={nameCheck()}
          onHide={() => setShowCancelConfirmation(false)}
        />
      )}
      {showReturnConfirmation && (
        <CancelReturnConfirmationOrder
          dateCreated={dateCreated}
          updatedStatus="returned"
          editor={nameCheck()}
          onHide={() => setShowReturnConfirmation(false)}
        />
      )}

      <div
        id={`div-${partNumber + dateCreated}`}
        className={`text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm ${
          showAddConfirmation ||
          showIgnoreConfirmation ||
          showReturnConfirmation ||
          showCancelConfirmation ||
          status === 'added'
            ? 'hidden'
            : ''
        }`}
      >
        <div
          className={`w-full py-1 font-medium text-center text-white ${statusContent.className}`}
        >
          <h2>{statusContent.message}</h2>
        </div>
        {isEdited && (
          <h2 className="w-full bg-blue-100 text-blue-600 py-1 text-center">
            Unsaved Changes
          </h2>
        )}

        <div className="flex mditems-center items-start justify-center md:justify-start m-1">
          <div className="p-1 flex justify-center items-center">
            {selectedVendor?.vUrl && (
              <CompanyLogoOrder
                companyName={selectedVendor?.vUrl.split('/')[2] || ''}
              />
            )}
          </div>

          <div className="md:flex-grow md:grid md:grid-cols-2 md:gap-2 p-1 my-2 md:text-center">
            <div className="">
              <h1 className=" font-bold">
                {selectedVendor?.vName || 'Add a vendor'}
              </h1>
              <p className="">{selectedVendor?.vPartNumber}</p>
            </div>

            <div>
              <p className="">
                <b>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(cost)}
                </b>{' '}
                per item
              </p>
              {selectedVendor?.vLeadTime && (
                <p className="">
                  <b>{selectedVendor?.vLeadTime}</b> day lead time
                </p>
              )}
              {PoNumber && (
                <p className="">
                  <b>PO Number:</b> {PoNumber}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="text-gray-900 flex">
          <img
            src={imageUrl}
            alt={partNumber}
            className="h-20 my-1 mx-2 object-contain rounded-lg"
          />
          <div className="flex-grow flex items-end text-sm">
            <div>
              <p className="font-bold">Quantity to buy: {quantity}</p>
              <p className="">Needed: {dateNeeded?.toString().slice(0, 15)}</p>
              <p className="text-gray-700 mt-2">{internalDescription}</p>

              <a href={`/inventory?${partNumber.toLowerCase()}`}>
                <p className="font-semibold text-gray-700 ">
                  {partNumber} @ {partLocation}
                </p>
              </a>
            </div>
          </div>
        </div>
        <div className={`flex mt-2 justify-between`}>
          <p className="text-xs text-gray-600 font-light px-2">
            Origin: {origin.slice(0, 1).toUpperCase() + origin.slice(1)}
          </p>
          {dateEdited && (
            <p className="text-xs text-gray-600 font-light px-2">
              Edited: {dateEdited.slice(0, 10)}
            </p>
          )}
        </div>

        {status === 'ordered' && (
          <div>
            <div className="grid grid-cols-2 text-gray-700 text-center border-t border-gray-200 font-medium">
              <div
                className="w-full py-1 border-r border-gray-200 cursor-pointer"
                onClick={() => setShowReturnConfirmation(true)}
              >
                <p>Returned</p>
              </div>
              <div
                className="w-full py-1 border-gray-200 cursor-pointer"
                onClick={() => setShowCancelConfirmation(true)}
              >
                Canceled
              </div>
            </div>
          </div>
        )}
        {status === 'followUp' && (
          <div>
            <div className="grid grid-cols-2 text-gray-700 text-center border-t border-gray-200 font-medium">
              <div
                className="w-full py-1 border-r border-gray-200 cursor-pointer"
                onClick={() => setShowReturnConfirmation(true)}
              >
                <p>Returned</p>
              </div>
              <div
                className="w-full py-1 border-gray-200 cursor-pointer"
                onClick={() => setShowCancelConfirmation(true)}
              >
                Canceled
              </div>
            </div>
          </div>
        )}

        {vendors.length > 0 && status !== 'ordered' && status !== 'followUp' && (
          <div>
            <div className="grid grid-cols-2 text-gray-700 text-center border-t border-gray-200 font-medium">
              {selectedVendor?.vUrl && selectedVendor.vUrl.includes('http') ? (
                <a href={selectedVendor?.vUrl} target="_blank">
                  <div className="w-full py-1 border-r border-gray-200 cursor-pointer">
                    Open Tab
                  </div>
                </a>
              ) : (
                <a href={selectedVendor?.vUrl}>
                  <div className="w-full py-1 border-r border-gray-200 cursor-pointer">
                    Email or Call 
                  </div>
                </a>
              )}
              <div
                className="w-full py-1 cursor-pointer"
                onClick={toggleIgnoreConfirmation}
              >
                Ignore
              </div>
              <button
                className="w-full py-1 cursor-pointer border-t border-r border-gray-200"
                onClick={toggleUpdateVendors}
                disabled={isEdited}
              >
                {!showUpdateVendors && <p>Show Vendors</p>}
                {showUpdateVendors && <p>Hide Vendors</p>}
              </button>

              <div
                className="w-full py-1 border-t border-gray-200 cursor-pointer"
                onClick={toggleShowPaymentMethods}
              >
                {paymentOption === 'nothingSelected' && <p>+ Payment method</p>}
                {paymentOption !== 'nothingSelected' && showPaymentMethod && (
                  <p>Hide payment methods</p>
                )}
                {paymentOption !== 'nothingSelected' && !showPaymentMethod && (
                  <p>Show payment methods</p>
                )}
              </div>
              {showUpdateVendors && (
                <div className="col-span-2">
                  <div
                    className="flex justify-center items-center bg-gray-50 px-2 text-gray-600 border-t border-gray-200 py-1"
                    onDoubleClick={() => setIsEdited(true)}
                  >
                    <div>
                      <div className="md:flex">
                        <p className="font-light">Manufacturer:&nbsp;</p>
                        <input
                          type="text"
                          value={manufacturer}
                          disabled={isEdited === false}
                          onChange={(e) => setManufacturer(e.target.value)}
                          className={`manufacturer mb-1 ${
                            isEdited &&
                            'bg-blue-100 border border-blue-300 text-blue-600 rounded-lg px-1'
                          }`}
                        />
                      </div>
                      <div className="md:flex">
                        <p className="font-light">
                          Manufacturer part number:&nbsp;
                        </p>
                        <input
                          type="text"
                          value={manufactPartNum}
                          disabled={!isEdited}
                          onChange={(e) => setManufactPartNum(e.target.value)}
                          className={`manufactPartNum ${
                            isEdited &&
                            'bg-blue-100 border border-blue-300 text-blue-600 rounded-lg px-1'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  {vendors.length !== 0 && (
                    <p className="text-center w-full italic text-xs bg-gray-50 text-gray-500 font-light border-b border-gray-200 py-1">
                      Click to select. Double click to edit.
                    </p>
                  )}
                  <div className="w-full vendorParent bg-gray-50">
                    {vendors.map((vendor, index) => (
                      <div
                        id={`div-${partNumber + dateCreated}`}
                        key={index}
                        className="vendor"
                      >
                        <div
                          className={`p-2 border-b border-gray-200 cursor-pointer ${
                            vendor.vName === selectedVendor?.vName
                              ? 'bg-white'
                              : 'opacity-70'
                          }`}
                          onDoubleClick={() => setEditableVendorIndex(index)}
                          onClick={() => {
                            setSelectedVendor(vendor)
                            setPaymentOption('nothingSelected')
                            setStatus('addPaymentMethod')
                            setCost(vendor.vCost)
                          }}
                        >
                          <div className="grid grid-cols-3 gap-1">
                            <div className="flex justify-center items-center">
                              <CompanyLogoOrder
                                companyName={vendor.vUrl?.split('/')[2] || ''}
                              />
                            </div>
                            <div className="flex justify-start text-left items-center font-light text-sm col-span-2">
                              <div
                                className={`w-full ${
                                  editableVendorIndex === index
                                    ? 'space-y-1'
                                    : ''
                                }`}
                              >
                                <h3 className="font-semibold">
                                  {vendor.vName}
                                </h3>
                                {editableVendorIndex === index && (
                                  <p>Link, email or phone:</p>
                                )}
                                {editableVendorIndex === index && (
                                  <input
                                    type="tet"
                                    value={vendor.vUrl}
                                    onChange={(e) => {
                                      handleVendorChange(
                                        index,
                                        'vUrl',
                                        e.target.value
                                      ); setIsEdited(true)
                                    }
                                    }
                                    className="bg-blue-100 text-blue-600 border-blue-300 border px-1 rounded-lg w-full"
                                  />
                                )}
                                {editableVendorIndex === index && (
                                  <p>Vendor&apos;s part number:</p>
                                )}
                                {editableVendorIndex === index ? (
                                  <input
                                    type="text"
                                    value={vendor.vPartNumber}
                                    onChange={(e) => {
                                      handleVendorChange(
                                        index,
                                        'vPartNumber',
                                        e.target.value
                                      ); setIsEdited(true)
                                    }
                                    }
                                    className="bg-blue-100 text-blue-600 border-blue-300 border px-1 rounded-lg w-full"
                                  />
                                ) : (
                                  <p>{vendor?.vPartNumber}</p>
                                )}
                                <div className="flex pt-1">
                                  <p>Cost: $</p>
                                  {editableVendorIndex === index ? (
                                    <input
                                    type="number"
                                      value={vendor.vCost}
                                      onChange={(e) => {
                                        handleVendorChange(
                                          index,
                                          'vCost',
                                          parseFloat(e.target.value)
                                        ); setIsEdited(true)
                                      }
                                      }
                                      className="bg-blue-100 text-blue-600 border-blue-300 border px-1 rounded-lg flex-grow"
                                    />
                                  ) : (
                                    <p>{vendor?.vCost}</p>
                                  )}
                                </div>
                                <div className="flex pt-1">
                                  <p className="pr-1">Lead time:</p>
                                  {editableVendorIndex === index ? (
                                    <input
                                    type="number"
                                      value={vendor.vLeadTime}
                                      onChange={(e) => {
                                        handleVendorChange(
                                          index,
                                          'vLeadTime',
                                          parseInt(e.target.value)
                                        ); setIsEdited(true)
                                      }
                                      }
                                      className="bg-blue-100 text-blue-600 border-blue-300 border px-1 rounded-lg flex-grow"
                                    />
                                  ) : (
                                    <p>{vendor?.vLeadTime}</p>
                                  )}
                                  <p className="px-1">days</p>
                                </div>

                                {editableVendorIndex === index && (
                                  <div>
                                    <p>Preferred payment method:</p>
                                    <select
                                      className="vPaymentMethod bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600"
                                      value={vendor.vPaymentMethod}
                                      onChange={(e) =>{
                                        handleVendorChange(
                                          index,
                                          'vPaymentMethod',
                                          e.target.value
                                        ); setIsEdited(true)
                                      }
                                      }
                                    >
                                      <option value="Credit Card">
                                        Credit Card
                                      </option>
                                      <option value="Account">Account</option>
                                      <option value="Cash or Check">
                                        Cash or Check
                                      </option>
                                      <option value="ACH or Wire">
                                        ACH or Wire
                                      </option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {editableVendorIndex === index && !removeButton && (
                          <div>
                            {!isEdited && (
                              <button
                                onClick={() => {
                                  setEditableVendorIndex(null)
                                }}
                                className="w-full bg-purple-600 text-white text-center py-px"
                              >
                                Exit without saving
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setRemoveButton(true)
                              }}
                              className="w-full bg-rose-600 text-white text-center py-px"
                            >
                              Remove Vendor
                            </button>
                          </div>
                        )}
                        {editableVendorIndex === index && removeButton && (
                          <p className="w-full text-center py-1 font-light">
                            Do you really want to remove {vendor.vName}?
                          </p>
                        )}
                        {editableVendorIndex === index && removeButton && (
                          <div className="grid grid-cols-2 border-t border-b border-gray-200">
                            <button
                              className="py-px"
                              onClick={() => setRemoveButton(false)}
                            >
                              No
                            </button>
                            <button
                              className="bg-rose-600 text-white py-px"
                              onClick={() => {
                                setIsEdited(true)
                                setRemoveButton(false)
                                setEditableVendorIndex(null)
                                removeVendor(index)
                              }}
                            >
                              Yes
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      className="py-1 bg-white w-full"
                      onClick={() => toggleShowAddVendorDiv()}
                    >
                      {showAddVendorDiv
                        ? 'Hide Vendor list'
                        : 'Show Vendor list'}
                    </button>
                    {showAddVendorDiv && (
                      <p className="text-xs border-t border-gray-200 font-light text-gray-500 italic py-1">
                        Click to attach a Vendor to this part number.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {showPaymentMethod && (
              <div className="w-full py-1 border-t border-gray-200 flex justify-center items-center">
                <div>
                  <p className="px-2 text-gray-600 font-light">
                    Preferred payment method:{' '}
                    {selectedVendor?.vPaymentMethod
                      ? `${selectedVendor.vPaymentMethod}`
                      : 'Not set'}
                  </p>
                  <select
                    className="vPaymentMethod text-gray-600 border border-gray-200 rounded-md px-2 py-1 my-2"
                    value={paymentOption}
                    onChange={(e) => {
                      setPaymentOption(e.target.value)
                      checkPaymentStatus(e.target.value)
                    }}
                  >
                    <option value="nothingSelected">
                      Please select an option
                    </option>
                    <option value="CC-Amex">CC Amazon Amex</option>
                    <option value="CC-5941">CC Sam 5941</option>
                    <option value="CC-4904">CC Jose 4904</option>
                    <option value="CC-5966">CC Bill 5966</option>
                    <option value="CC-3833">CC Rhonda 3833</option>
                    <option value="CC-9804">CC Vitaliy 9804</option>
                    <option value="account">Account</option>
                    <option value="check">Check</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
        {vendors.length === 0 && (
          <div>
            <div className="grid grid-cols-2">
              <div
                className="w-full py-1 text-gray-700 text-center border-t border-r border-gray-200 font-medium cursor-pointer"
                onClick={() => {
                  toggleShowAddVendorDiv()
                  SetShowUpdateVendors(true)
                }}
              >
                <p>+ Vendor</p>
              </div>
              <div
                className="w-full py-1 text-gray-700 text-center border-t border-gray-200 font-medium cursor-pointer"
                onClick={toggleIgnoreConfirmation}
              >
                Ignore
              </div>
            </div>
          </div>
        )}
        {showUpdateVendors && showAddVendorDiv && (
          <div className="border-t border-gray-200">
            <VendorSearch handleAddVendor={handleAddVendor} />
            <div className="text-center bg-gray-50 text-gray-600 space-y-2 py-4">
              <p className="font-light px-2">
                If you can&apos;t find a Vendor on the list, with a chatGPT, or
                Google&apos;s reverse image search, try emailing
              </p>
              <p>
                <a href="mailto:dave@boretec.com">Dave Gasmovic</a>
              </p>
              <p>
                <a href="mailto:pheath@vermeer.com">Phillip at McL</a>
              </p>
              <p>
                <a href="mailto:lsims@carolinabelting.com, shall@carolinabelting.com">
                  Lemar at Carolina Belting
                </a>
              </p>
            </div>
          </div>
        )}

        {isEdited && (
          <div>
            <div
              className="bg-purple-600 text-white text-center py-1 cursor-pointer"
              onClick={() => {
                setIsEdited(false)
                setEditableVendorIndex(null)
              }}
            >
              Discard Changes
            </div>
            <div
              className="bg-blue-600 text-white text-center py-1 cursor-pointer"
              onClick={() => {
                saveChanges()
                setShowAddVendorDiv(false)
                setEditableVendorIndex(null)
              }}
            >
              Save changes
            </div>
          </div>
        )}
        {status !== 'ordered' && status !== 'followUp' && !isEdited && (
          <button
            className={`w-full px-3 py-1 font-medium text-center rounded-b-lg bg-black text-white ${
              paymentOption === 'nothingSelected' && 'opacity-60'
            }`}
            onClick={markAsOrdered}
            disabled={paymentOption === 'nothingSelected'}
          >
            Mark as Ordered
          </button>
        )}
        {status === 'ordered' && !isEdited && (
          <div
            className="w-full px-3 py-1 font-medium text-center rounded-b-lg bg-black text-white cursor-pointer"
            onClick={() => {
              toggleAddConfirmation()
            }}
          >
            Add to inventory
          </div>
        )}
        {status === 'followUp' && !isEdited && (
          <div
            className="w-full px-3 py-1 font-medium text-center rounded-b-lg bg-black text-white cursor-pointer"
            onClick={() => {
              toggleAddConfirmation()
            }}
          >
            Add to inventory
          </div>
        )}
      </div>
    </div>
  )
}

export default ToOrderCardEditable
