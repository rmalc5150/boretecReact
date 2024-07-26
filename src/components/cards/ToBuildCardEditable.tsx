'use client'
import React, { useCallback, useState, useEffect, useRef } from 'react'
import AddConfirmationBuild from '../../components/buttons/AddConfirmationBuild'
import Add2InvoiceConfirmationBuild from '../../components/buttons/Add2InvoiceConfirmationBuild'
import IgnoreConfirmationBuild from '../../components/buttons/IgnoreConfirmationBuild'
import PdfViewer from '../modals/PdfViewer'
import PdfUpload from '../modals/PdfUploadBuild'
import DatePicker from 'react-datepicker'
import InventorySearchBreakdown, {
  InventoryItem,
} from '../modals/inventorySearchBreakdown'
import 'react-datepicker/dist/react-datepicker.css'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import Cookies from 'js-cookie'
import AddToToOrderList from '../buttons/AddToToOrderListMissing'
import AddToToBuildList from '../buttons/AddToToBuildListMissing'
import VendorSearch, {VendorItem} from '../modals/vendorSearch'

interface ToBuildCardEditableProps {
  assignedTo: string
  origin: string
  docFileName: string
  partNumber: string
  quantity: number
  status: string
  location: string
  images: string
  dueDate: string
  partsUrl: string
  dateCreated: string
  internalDescription: string
  missing: string
  allItems: InventoryItem[]
  items: string
  itemsAddedToLists: string
  externalVendor: boolean
  vendor: string
  buildNumber: number
}

interface AddToListState {
  [partNumber: string]: boolean
}

interface ItemAddedToList {
  date: Date
  name: string
  partNumber: string
  quantity: number
}

const ToBuildCardEditable: React.FC<ToBuildCardEditableProps> = (props) => {
  const {
    origin,
    partNumber,
    buildNumber,
    quantity,
    images,
    location,
    allItems,
    internalDescription,
    dueDate: initialDueDate,
    dateCreated,
  } = props
  const [breakdownCost, setBreakdownCost] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showAddToToBuildList, setShowAddToToBuildList] = useState(false)
  const [showAddToToOrderList, setShowAddToToOrderList] = useState(false)
  const [showEditBreakdown, setShowEditBreakdown] = useState(false)
  const [showAddConfirmation, setShowAddConfirmation] = useState(false)
  const [showVendorSearch, setShowVendorSearch] = useState(false)
  const [showAdd2InvoiceConfirmation, setShowAdd2InvoiceConfirmation] =
    useState(false)
  const [showIgnoreConfirmation, setShowIgnoreConfirmation] = useState(false)
  const [showPdfUpload, setPdfUpload] = useState(false)
  const [isEdited, setIsEdited] = useState(false)
  
  function safelyParseJSON(jsonString: string) {
    try {
      const parsed = JSON.parse(jsonString);
      // Additional checks can be added here to validate the JSON structure
      return parsed;
    } catch (e) {
      // Handle parsing error
      //console.error("Failed to parse JSON:", e);
      return null;  // or return an empty array [], or any other default value
    }
  }
  const [vendor, setVendor] = useState<VendorItem[]>(safelyParseJSON(props.vendor) || [])
  const [vendorChanged, setVendorChanged] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>(
    safelyParseJSON(props.items) || []
  )
  const [itemsAddedToLists, setItemsAddedToLists] = useState<ItemAddedToList[]>(
    JSON.parse(props.itemsAddedToLists) || []
  )
  const [dueDate, setDueDate] = useState<Date | null>(
    initialDueDate ? new Date(initialDueDate) : null
  )
  const [assignedTo, setAssignedTo] = useState(props.assignedTo || "")
  const [status, setStatus] = useState(props.status)
  const [docFileName, setDocFileName] = useState(props.docFileName)
  const [missing, setMissing] = useState(props.missing || '')
  const [showAddToToOrderListByPart, setShowAddToToOrderListByPart] =
    useState<AddToListState>({})
  const [showAddToToBuildListByPart, setShowAddToToBuildListByPart] =
    useState<AddToListState>({})

  // Handler to toggle the state for a specific row
  const toggleAddToToOrderListForPart = (partNumber: string) => {
    setShowAddToToOrderListByPart((prevState) => ({
      ...prevState,
      [partNumber]: !prevState[partNumber],
    }))
  }
  const [externalVendor, setExternalVendor] = useState(props.externalVendor);

  const handleVendorToggle = () => {
    setExternalVendor(!externalVendor);
    setIsEdited(true);
    

    //console.log(breakdownInProgress);
  };

  const toggleAddToToBuildListForPart = (partNumber: string) => {
    setShowAddToToBuildListByPart((prevState) => ({
      ...prevState,
      [partNumber]: !prevState[partNumber],
    }))
  }
  const componentRef = useRef<HTMLDivElement>(null) // Adding a ref to the component


  const scrollUp = () => {
    if (componentRef.current) {
      const scrollY =
        componentRef.current.getBoundingClientRect().top + window.scrollY - 80 // 80px above
      window.scrollTo({ top: scrollY, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (items ) {
      let totalCost = 0;
      for (const item of items) {
        // Ensure 'cost' is a number before adding it to totalCost
        const cost = Number(item.cost);
        const quantityNeeded = Number(item.quantityNeeded);
        totalCost += cost*quantityNeeded;
      }
      //console.log(totalCost);
      setBreakdownCost(totalCost);
      
  
    }
  }, [items]);

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

  const togglePdfUpload = () => setPdfUpload(!showPdfUpload)

  const toggleIgnoreConfirmation = () =>
    setShowIgnoreConfirmation(!showIgnoreConfirmation)

  const handleEdit = () => {
    if (!isEdited) {
      setIsEdited(true)
    }
  }

  useEffect(() => {
    
    //const assigned = handleAssignedTo()
    if (assignedTo !== ''){
      setStatus('progress')
    } 
    if (vendor.length > 0) {
      setStatus('vendor')
      
    }
  }, [assignedTo, vendor]);


  const saveChanges = async () => {

    if (vendorChanged){
      
      console.log(origin);

      const payload = {
        partNumber,
        vendor,
        origin: nameCheck(),
        quantity
      }
      //console.log(payload)
      const params: InvokeCommandInput = {
        FunctionName: 'boretec_create_PO_in_qbo_webhook',
        Payload: JSON.stringify(payload),
      }
  
      try {
        const command = new InvokeCommand(params)
        const response = await lambdaClient.send(command)
  
        const result = JSON.parse(
          new TextDecoder('utf-8').decode(response.Payload as Uint8Array)
        )
        //console.log(result)

      } catch (error) {
        console.error('Error calling Lambda function', error)
        alert('Something went wrong')
      }

    }

    const payload = {
      dateCreated,
      vendorChanged,
      partNumber,
      newContent: {
        dateEdited: newTime(),
        assignedTo,
        dueDate,
        status,
        editor: nameCheck(),
        items,
        vendor,
        missing,
        itemsAddedToLists,
      },
    }
    //console.log(payload)
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_update_toBuild',
      Payload: JSON.stringify(payload),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)

      const result = JSON.parse(
        new TextDecoder('utf-8').decode(response.Payload as Uint8Array)
      )
      //console.log(result)
      // Check if the Lambda function returned status 200
      if (result.status >= 200) {
        setIsEdited(false)

        // Here you can update state or perform actions based on successful Lambda execution
      } else {
        // If status is not 200 or 'success', show an error and revert state
        alert(`Something went wrong: ${result.error}`)
      }
    } catch (error) {
      console.error('Error calling Lambda function', error)
      alert('Something went wrong')
    }
  }

  const handleHideAddConfirmation = () => {
    setShowAddConfirmation(false)
  }

  const handleHideIgnoreConfirmation = () => {
    setShowIgnoreConfirmation(false)
  }

  const handleHidePdfUpload = useCallback((fileName: string) => {
    setDocFileName(fileName) // Use the setter function to update docFileName
    setPdfUpload(false)
  }, [])

  const getStatusContent = () => {
    switch (status) {
      case 'vendor':
        return { message: 'At', className: 'bg-teal-600' }
      case 'assign':
        return { message: 'Assign', className: 'bg-cyan-600' }
      case 'progress':
        return { message: 'In Progress', className: 'bg-emerald-600' }

      default:
        return { message: 'Status Unknown', className: 'bg-gray-500' }
    }
  }

  const statusContent = getStatusContent()

  const handleDateChange = (date: Date | null) => {
    setDueDate(date)
    handleEdit() // Trigger handleEdit() after date selection
  }

  /*const handleAssignedTo = () => {
    const parent = document.getElementById(`${`div-${dateCreated}`}`)
    const span = parent?.getElementsByClassName('assignedTo')[0]
    const textContent = span?.textContent || ''
    setAssignedTo(textContent)
    return textContent
  }*/



  const handleInventoryClick = (items: InventoryItem[]) => {
    // Create a new array that includes all existing items plus the new item

    // Update the state with the new array
    setItems(items)
    //setShowBreakdown(false)
    setShowEditBreakdown(false)
    setIsEdited(true)
    scrollUp()
    //console.log(items);

    // Optionally, log the updated items array to the console
    //console.log(items)
  }

  useEffect(() => {
    
    let updatedMissing = missing
    let partNumbersInItems = new Set(items.map((item) => item.partNumber))

    // Process each partNumber currently in the missing list
    updatedMissing = updatedMissing
      .split(',')
      .filter((partNumber) => {
        // Check if partNumber is still in items
        return partNumbersInItems.has(partNumber)
      })
      .join(',')

    // Add missing part numbers if needed
    items.forEach((item) => {
      const foundItem = allItems.find(
        (allItem) => allItem.partNumber === item.partNumber
      )
      const isCurrentlyMissing = updatedMissing
        .split(',')
        .includes(item.partNumber)

      if (foundItem) {

        if (!foundItem.quantity || foundItem.quantity < item.quantityNeeded) {
          if (!isCurrentlyMissing) {
            updatedMissing = updatedMissing
              ? `${updatedMissing},${item.partNumber}`
              : item.partNumber
          }
        } else {
          if (isCurrentlyMissing) {
            updatedMissing = updatedMissing
              .split(',')
              .filter((part) => part !== item.partNumber)
              .join(',')
          }
        }
      } /*else {
        if (!isCurrentlyMissing) {
          updatedMissing = updatedMissing
            ? `${updatedMissing},${item.partNumber}`
            : item.partNumber
        }
      }*/
    })

    // Update the state only if necessary to avoid unnecessary re-renders
    if (updatedMissing !== missing) {
      setMissing(updatedMissing)
    }
    //console.log(updatedMissing);
  }, [items, isEdited, allItems])

  const handleUpdateFromListButtons = (data: {
    date: Date
    name: string
    partNumber: string
    quantity: number
  }) => {
    const updatedItems = [...itemsAddedToLists, data]
    setItemsAddedToLists(updatedItems) // Update the items state
    setIsEdited(true) // Mark the form as edited
    //console.log(updatedItems) // Log the updated items to the console
  }

  const onClose = () => {
    setShowBreakdown(false)
    setShowEditBreakdown(false)
    scrollUp()
    if (items.length > 0) {
      setItems([])
      setIsEdited(true)
    }
  }

  const handleAddVendor = (newVendor: VendorItem) => {
    //console.log(newVendor);
    //console.log(vendor[0]);
    if (vendor.length === 0){
      setVendorChanged (true)
      //console.log('vendorChanged = true first vendor');
    }
    if (vendor.length > 0 && vendor[0].vName !== newVendor.vName){
      setVendorChanged (true)
      //console.log('vendorChanged = true');
    }
    setVendor([newVendor]); // Assuming you want to replace the current vendors
    setShowVendorSearch(false)
    setIsEdited(true)

}


  return (
    <div ref={componentRef}>
      {showAddConfirmation && (
        <AddConfirmationBuild
          partNumber={partNumber}
          quantity={quantity}
          dateCreated={dateCreated}
          items={items}
          cost={breakdownCost}
          onHide={handleHideAddConfirmation}
        />
      )}

      {showAdd2InvoiceConfirmation && (
        <Add2InvoiceConfirmationBuild
          partNumber={partNumber}
          invoiceNumber={origin}
          onHide={() => setShowAdd2InvoiceConfirmation(false)}
        />
      )}
      {showIgnoreConfirmation && (
        <IgnoreConfirmationBuild
          dateCreated={dateCreated}
          partNumber={partNumber}
          quantity={quantity}
          onHide={handleHideIgnoreConfirmation}
        />
      )}
      {showPdfUpload && (
        <PdfUpload
          partNumber={partNumber}
          onHide={(fileName) => handleHidePdfUpload(fileName)}
        />
      )}

      <div
        id={`div-${dateCreated}`}
        className={`text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm ${
          showIgnoreConfirmation ||
          showAddConfirmation ||
          showPdfUpload ||
          showAdd2InvoiceConfirmation
            ? 'hidden'
            : ''
        }`}
      >
        {isEdited && (
          <div
            className={`w-full py-1 font-medium text-center text-white bg-blue-600 border-b border-white`}
          >
            <h2>Unsaved Changes</h2>
          </div>
        )}
        {missing && missing !== '' && (
          <div
            className={`w-full py-1 font-medium text-center text-white bg-violet-600 border-b border-white`}
          >
            <h2>Waiting for Parts</h2>
          </div>
        )}
        <div
          className={`w-full py-1 font-medium text-center text-white ${statusContent.className}`}
        >
          <h2>{statusContent.message} {vendor.length > 0 && <span>{vendor[0].vName}</span>} - Build #{buildNumber}</h2>
        </div>

        <div className="flex">
          {images ? (<img
            src={images}
            alt={partNumber}
            className="w-32 md:rounded-br-lg object-contain"
          />) : (
            <img
            src='https://boretec.com/images/image-coming-soon.png'
            alt={partNumber}
            className="w-32 md:rounded-br-lg object-contain"
          />
          )}

          <div className="flex-grow flex justify-start items-center px-2">
            <div>
              <div className="my-2 font-bold tracking-tight text-gray-900">
                <p className="">Quantity to build: {quantity}</p>
              </div>

              <p className="">{internalDescription}</p>
              <a href={`/inventory?${partNumber.toLowerCase()}`}>
                <p className="font-semibold my-1">
                  {partNumber} @ {location}
                </p>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 mt-5">
          <div className="p-2 text-gray-700 text-center border-r border-gray-200">
            <div>
              <b>Due Date</b>
            </div>
            <div className="mt-1">
              <DatePicker
                selected={dueDate}
                onChange={handleDateChange}
                dateFormat="MM-dd-yy" // Customize the date format
                className={`text-center w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 ${
                  dueDate === null ? 'bg-gray-100' : ''
                }`} // Apply Tailwind or custom styling here
                wrapperClassName="date-picker" // Wrapper class for additional styling
                popperPlacement="top-end" // Customize the popper placement
              />
            </div>
          </div>
          <div className="text-gray-700 text-center border-r border-gray-200">
           
            <div className="pt-2 px-2">
            <div>
              <b>Assigned to</b>
            </div>
            {vendor.length > 0 ? (
              <p>{vendor.length > 0 ? vendor[0].vName : "Select a Vendor"}</p>
            )
            : (
            <input
              className={`w-full text-center rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-center ${
                assignedTo ? '' : 'bg-gray-100'
              } mt-1`}
              onChange={(e) => {
                setAssignedTo(e.target.value) // Additional operations upon changing the value
              }}
            value={assignedTo}
        
            />)}
            </div>
   
        {assignedTo === "" && <div className={`font-light text-xs text-center py-1`}>{vendor.length > 0 ? <p onClick={()=>setShowVendorSearch(true)}>Change Vendor</p> : <p onClick={()=>{handleVendorToggle(); setShowVendorSearch(!showVendorSearch)}}>{showVendorSearch ? "Hide Vendors" : "Assign a Vendor?"}</p>}</div>}
      

          
          </div>
          <div className="p-2 text-gray-700 text-center">
            <div>
              <b>Origin</b>
            </div>
            <p className="mt-1">
              {origin.slice(0, 1).toUpperCase() + origin.slice(1)}
            </p>
          </div>
        </div>
        {showVendorSearch && (<div className="border-t border-gray-200">
        <VendorSearch handleAddVendor={handleAddVendor}/>
      </div>
      )}

        <div className="grid grid-cols-3 text-gray-700 text-center border-t border-gray-200 font-medium">
          {items.length > 0 ? (
            <div
              className="w-full py-1 border-r border-gray-200"
              onClick={() => {
                setShowBreakdown(!showBreakdown)
              }}
            >
              {!showBreakdown && <button>Breakdown</button>}
              {showBreakdown && <button onClick={()=>setShowEditBreakdown(false)}>Hide Breakdown</button>}
            </div>
          ) : (
            <div
              className="w-full py-1 bg-gray-100 border-r border-gray-200 cursor-pointer"
              onClick={() => {
                setShowBreakdown(true)
                setShowEditBreakdown(true)
              }}
            >
              Breakdown
            </div>
          )}
          <div className="w-full py-1 border-r border-gray-200 cursor-pointer">
            {docFileName ? (
              <PdfViewer fileName={docFileName} />
            ) : (
              <p onClick={togglePdfUpload}>Add Drawings</p>
            )}
          </div>
          <div
            id="ignore"
            className="w-full py-1 border-gray-200 cursor-pointer"
            onClick={toggleIgnoreConfirmation}
          >
            Ignore
          </div>
        </div>

        {showBreakdown && (
          <div>
            {!showEditBreakdown && items.length > 0 && (
              <div
                className="bg-white text-gray-600 py-1 border-t border-gray-200"
                onDoubleClick={() => setShowEditBreakdown(true)}
              >
                <p className="font-light text-xs text-center py-1">
                  Double click to edit.
                </p>
                <table className="leading-normal w-full text-center mt-2 py-4">
                  <thead>
                    <tr className="text-center">
                      <th>Quantity Needed</th>
                      <th>Stock</th>
                      
                      <th>Part Number - Description</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      // Define a base key for each row based on the item's unique identifier
                      const baseKey = `item-${item.partNumber}`
                      // Parsing itemsAddedToLists for detailed display

                      let itemsAddedDetail = null
                      if (itemsAddedToLists.length > 0) {
                        try {
                          const relevantList = itemsAddedToLists.find(
                            (listItem) =>
                              listItem.partNumber === item.partNumber
                          )
                          if (relevantList) {
                            itemsAddedDetail = `${
                              relevantList.name.slice(0, 1).toUpperCase() +
                              relevantList.name.slice(1)
                            } ordered ${relevantList.quantity} on ${new Date(
                              relevantList.date
                            ).toLocaleDateString()}`
                          }
                        } catch (e) {
                          console.error('Error parsing itemsAddedToLists', e)
                        }
                      }
                      return (
                        // Fragment with a unique key
                        <React.Fragment key={baseKey}>
                          <tr
                            className={`h-12 border-gray-200 border-t ${
                              missing &&
                              missing.includes(item.partNumber) &&
                              'bg-violet-500 text-white'
                            }`}
                          >
                            <td className="px-1">{item.quantityNeeded}</td>
                            <td className={`${
                              missing &&
                              missing.includes(item.partNumber) &&
                              'bg-violet-800 text-white'
                            } bg-gray-100 px-1`}>{item.quantity}</td>
                            {/*<td className="px-1 w-20">
                              {item.images !==
                                'https://boretec.com/images/image-coming-soon.png' && (
                                <img
                                  className="rounded-md h-12"
                                  src={item.images}
                                />
                              )}
                            </td>*/}
                            <td className="px-1">
                              {item.partNumber} - {item.description}
                            </td>
                            <td className="px-1">
                            {!item.partNumber.includes('Shop') && <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.cost*item.quantityNeeded)}</p>}
                            </td>
                          </tr>
                          {itemsAddedDetail && (
                            <tr key={`${baseKey}-detail`}>
                            <td
                              colSpan={4}
                              className="p-0 bg-violet-800 text-white"
                            >
                              {itemsAddedDetail}
                            </td>
                            </tr>
                          )}
                          {missing &&
                            missing.includes(item.partNumber) &&
                            !itemsAddedDetail && (
                              // Add a key for the action row that is derived from the baseKey
                              <tr key={`${baseKey}-action`}>
                                <td colSpan={4} className={`p-0`}>
                                  {item.type === 'buy' && (
                                    <button
                                      className={` ${
                                        showAddToToOrderList ? 'hidden' : ''
                                      } w-full bg-violet-800 text-white`}
                                      onClick={() =>
                                        toggleAddToToOrderListForPart(
                                          item.partNumber
                                        )
                                      }
                                    >
                                      Add {item.quantityNeeded - item.quantity}{' '}
                                      to Order list
                                    </button>
                                  )}
                                  {item.type === 'build' && (
                                    <button
                                      className={` ${
                                        showAddToToBuildList ? 'hidden' : ''
                                      } w-full bg-violet-800 text-white`}
                                      onClick={() =>
                                        toggleAddToToBuildListForPart(
                                          item.partNumber
                                        )
                                      }
                                    >
                                      Add {item.quantityNeeded - item.quantity}{' '}
                                      to Build list
                                    </button>
                                  )}
                                  {showAddToToOrderListByPart[
                                    item.partNumber
                                  ] && (
                                    <AddToToOrderList
                                      description={item.description}
                                      partNumber={item.partNumber}
                                      images={item.images}
                                      vendors={item.vendors}
                                      location={item.location}
                                      cost={item.cost}
                                      initialQuantity={
                                        item.quantityNeeded - item.quantity
                                      }
                                      manufactPartNum={item.manufactPartNum}
                                      manufacturer={item.manufacturer}
                                      onHide={() =>
                                        toggleAddToToOrderListForPart(
                                          item.partNumber
                                        )
                                      }
                                      onUpdate={handleUpdateFromListButtons}
                                    />
                                  )}
                                  {showAddToToBuildListByPart[
                                    item.partNumber
                                  ] && (
                                    <AddToToBuildList
                                      description={item.description}
                                      partNumber={item.partNumber}
                                      imageUrl={item.images}
                                      location={item.location}
                                      items={item.items || '[]'}
                                      docFileName={item.docFileName}
                                      initialQuantity={
                                        item.quantityNeeded - item.quantity
                                      }
                                      onHide={() =>
                                        toggleAddToToBuildListForPart(
                                          item.partNumber
                                        )
                                      }
                                      onUpdate={handleUpdateFromListButtons}
                                    />
                                  )}
                                </td>
                              </tr>
                            )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
                <p className="text-right font-bold w-full py-1 border-t border-gray-200 px-2">Total cost: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(breakdownCost)}</p>
              </div>
            )}

            {showEditBreakdown && (
              <InventorySearchBreakdown
                handleAddItems={handleInventoryClick}
                itemsProp={items}
                allItems={allItems}
                onClose={onClose}
                excludePartNumber={partNumber}
              />
            )}
          </div>
        )}
        {/*showGetBreakdownUrl && (<div className="bg-gray-100">
      <div className="px-4 pt-4 pb-2">
                <p>Add a breakdown link:</p>
                <p className={`breakdownUrl rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-center bg-gray-300`}
            onInput={()=>{
              setShowBreakdown(true); // Additional operations upon changing the value          
            }}
            contentEditable={true}
            suppressContentEditableWarning={true}></p>

      </div>
      {showGetBreakdownUrlSave && <button className={`w-full text-center bg-blue-600 text-white py-1`} onClick={()=>updateBreakdown()}>{breakdownUrlLabel}</button>}
      </div>)*/}
        {/*showBreakdown && (<div
        className="w-full px-3 py-1 font-medium text-center rounded-b-lg bg-black text-white cursor-pointer" onClick={()=>setShowAdd2InvoiceConfirmation(true)}>Close</div>)*/}
        {isEdited && !showEditBreakdown && (
          <div>
            <div
              className="w-full px-3 py-1 font-medium text-center bg-fuchsia-700 border-b border-white text-white cursor-pointer"
              onClick={() => {setIsEdited(false);setShowBreakdown(false)}}
            >
              Exit without saving
            </div>
            <div
              className="w-full px-3 py-1 font-medium text-center rounded-b-lg bg-black text-white cursor-pointer"
              onClick={saveChanges}
            >
              Save
            </div>
          </div>
        )}
        {!isEdited && !showEditBreakdown && (
          <>
            {!origin.includes('BTE') && (
              <div>
                {items.length > 0 ? (
                  <div
                    className="w-full px-3 py-1 font-medium text-center rounded-b-lg bg-black text-white cursor-pointer"
                    onClick={() => setShowAddConfirmation(true)}
                  >
                    Add to Inventory
                  </div>
                ) : (
                  <div
                    className="w-full px-3 py-1 font-medium text-center rounded-b-lg bg-black text-white cursor-pointer"
                    onClick={() =>
                      alert(
                        'Add a Breakdown list to properly adjust inventory.'
                      )
                    }
                  >
                    Add to Inventory
                  </div>
                )}
              </div>
            )}
            {origin.includes('BTE') && (
              <div>
                {items.length > 0 ? (
                  <div
                    className="w-full px-3 py-1 font-medium text-center rounded-b-lg bg-black text-white cursor-pointer"
                    onClick={() => setShowAdd2InvoiceConfirmation(true)}
                  >
                    Add to Shipment: {origin}
                  </div>
                ) : (
                  <div
                    className="w-full px-3 py-1 font-medium text-center rounded-b-lg bg-black text-white cursor-pointer"
                    onClick={() =>
                      alert(
                        'Add a Breakdown list to properly adjust inventory.'
                      )
                    }
                  >
                    Add to Shipment: {origin}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ToBuildCardEditable
