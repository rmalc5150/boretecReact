'use client'
import React, { useState, useEffect } from 'react';
import SerialUpload from '../../components/buttons/SerialUpload';
import ImageUploadShip from '../../components/buttons/ImageUploadShip';
import ShipConfirmation from '../../components/buttons/ShipConfirmation';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

export interface ToShipCardEditableProps {
  invoiceNumber: string
  status: string
  serialNumbers: string
  customerPhone: string
  tracking: string

  shippingWeight: string
  images: string
  invoiceItems: string
  shippedDate: string
  missing: string
  NumberOfPieces: number
  totalWeight: number
  dimensions: string
  trackingNumber: string
  shipAddressLine1: string
  shipAddressLine2: string
  shipAddressLine3: string
  shipAddressLine4: string
  shipMethod: string
  companyName: string
  itemsDescription: string
  customerEmail: string
  itemsQuantity: string
  InvoiceDueDate: string
  billEmail: string
  dateAdded: string
  shipAddressCity: string
  shipAddressState: string
  shipAddressPostalCode: string
  itemsDetailType: string
  shipDate: string
  checked: boolean
}
// Define a type for individual machines
interface ItemDetail {
  description: string
  partNumber: string;
  quantity: number;
}

const ToShipCardEditable: React.FC<ToShipCardEditableProps> = ({
  shipAddressCity,
  shipDate,
  shipAddressState,
  shipAddressPostalCode,
  itemsDetailType,
  invoiceNumber,
  status,
  serialNumbers: initialSerialNumbers,
  customerPhone,
  trackingNumber: initialTrackingNumber,
  dimensions: initialDimensions,
  NumberOfPieces: initialNumberOfPieces,
  totalWeight: initialTotalWeight,
  shipAddressLine1,
  shipAddressLine2,
  invoiceItems,
  shipAddressLine4,
  shippingWeight,
  images: initialImages,
  shipMethod,
  companyName,
  itemsDescription,
  customerEmail,
  itemsQuantity,
  InvoiceDueDate,
  billEmail,
  dateAdded,
  checked,
  missing,
}) => {
  const [showShipConfirmation, setShowShipConfirmation] = useState(false)
  const [isEdited, setIsEdited] = useState(false)
  const [buttonLabel, setButtonLabel] = useState('Mark as Shipped')
  const [newTrackingNumber, setNewTracking] = useState('')
  const [addTrackingNumber, setAddTrackingNumber] = useState(false)
  const [totalWeight, setWeight] = useState(initialTotalWeight || 0)
  const [dimensions, setDimensions] = useState(initialDimensions || '')
  const [NumberOfPieces, setNumberOfPieces] = useState<number>(
    initialNumberOfPieces || 1
  )
  const [newSerial, setNewSerial] = useState('')
  const [addNewSerialNumber, setAddSerialNumber] = useState(false)
  const [images, setImages] = useState<string[]>(JSON.parse(initialImages) || []);
  const [serialNumbers, setSerialNumbers] = useState<string[]>(JSON.parse(initialSerialNumbers) || []);
  const [trackingNumber, setTrackingNumber] = useState(JSON.parse(initialTrackingNumber));

  const createItemsJson = (
    description: string | null,
    partNumber: string | null,
    quantity: string | null,
    invoiceItems: string | null
  ): ItemDetail[] => {
    const safeDescription = description ?? '';
    const safePartNumber = partNumber ?? '';
    const safeQuantity = quantity ?? '';
  
    const descriptions = safeDescription.split(',');
    const partNumbers = safePartNumber.split(','); //.map(pn => pn.includes(':') ? pn.split(':')[1] : pn);
    const quantities = safeQuantity.split(',').map(Number);
    //console.log(partNumbers);
    let items: ItemDetail[] = [];
    if (invoiceItems) {
      items = JSON.parse(invoiceItems);
    }
    else {
    partNumbers.forEach((partNumber , index) => {
      if (partNumber && !isNaN(quantities[index])) {
        items.push({
          description: descriptions[index],  // Adding description here to show in the render.
          partNumber: partNumbers[index],
          quantity: quantities[index]
        });
      }
    });
  }
    //console.log(items);
    return items;
  };

  const items = createItemsJson(itemsDescription, itemsDetailType, itemsQuantity, invoiceItems);

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

  const handleImagesUpdated = (newImages: string[]) => {
    //console.log(newImages);
    
    setImages((prev) => [...prev, ...newImages])
    setIsEdited(true)
    setButtonLabel('Save')
  }

  const handleSerialsUpdated = (newSerials: []) => {
    setSerialNumbers((prev) => [...prev, ...newSerials])
  }

  const addSerialNumber = (newValue: string) => {
    setSerialNumbers([...serialNumbers, newValue])
    setIsEdited(true)
    setButtonLabel('Save')
    setNewSerial('')
    setAddSerialNumber(false)
  }

  const handleSerialNumberChange = (index: number, newValue: string) => {
    if (serialNumbers.length === 0) {
      // If the array is empty, add the new value as the first item
      setSerialNumbers([newValue])
    } else {
      // Otherwise, update the existing serial number
      const updatedSerialNumbers = [...serialNumbers]
      updatedSerialNumbers[index] = newValue
      setSerialNumbers(updatedSerialNumbers)
    }
    setIsEdited(true)
    setButtonLabel('Save')
  }

  const addTracking = (newValue: string) => {
    setTrackingNumber([...trackingNumber, newValue])
    setIsEdited(true)
    setButtonLabel('Save')
    setNewTracking('')
    setAddTrackingNumber(false)
  }

  const handleTrackingChange = (index: number, newValue: string) => {
    if (trackingNumber.length === 0) {
      // If the array is empty, add the new value as the first item
      setTrackingNumber([newValue])
    } else {
      // Otherwise, update the existing serial number
      const updatedTracking = [...trackingNumber]
      updatedTracking[index] = newValue
      setTrackingNumber(updatedTracking)
    }
    setIsEdited(true)
    setButtonLabel('Save')
  }

  const editDimensions = (value: string) => {
    if (!isEdited) {
      setIsEdited(true)
      setButtonLabel('Save')
    }
    setDimensions(value)
  }
  const editNumberOfPieces = (value: number) => {
    if (!isEdited) {
      setIsEdited(true)
      setButtonLabel('Save')
    }
    setNumberOfPieces(value)
  }

  const editWeight = (value: number) => {
    if (!isEdited) {
      setIsEdited(true)
      setButtonLabel('Save')
    }
    setWeight(value)
  }

  const saveChanges = async () => {
    setButtonLabel('Saving...')

    const payload = {
      trackingNumber: trackingNumber || null,
      totalWeight: totalWeight !== undefined ? totalWeight : null,
      dimensions: dimensions !== undefined || dimensions === "" ? dimensions : null,
      serialNumbers: serialNumbers || null,
      images: images || null,
      NumberOfPieces: NumberOfPieces !== undefined ? NumberOfPieces : null,
      invoiceNumber,
    }
    //console.log(payload)

    const params: InvokeCommandInput = {
      FunctionName: 'boretec_update_toShip',
      Payload: JSON.stringify(payload),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      const payloadString = new TextDecoder().decode(response.Payload);
      const payloadObject = JSON.parse(payloadString);
      //console.log(payloadObject);
      if (payloadObject.statusCode === 200){
      setIsEdited(false)
      setButtonLabel('Mark as Shipped')}
      else {
        setButtonLabel('Save');
        alert(payloadObject.body)
      }
    } catch (error) {
      console.error('Error fetching inventory items', error);
    }


  }

  const toggleShipConfirmation = () => {
    if (isEdited) {
      saveChanges()
    } else {
      setShowShipConfirmation(!showShipConfirmation)
    }
  }

  const handleHideShipConfirmation = () => {
    setShowShipConfirmation(false)
  }


  const getStatusContent = () => {

    switch (status) {
      case 'picsNeeded':
        return {
          message: 'Add Pictures',
          className: 'bg-orange-500',
        }
      case 'needInventory':
        return { message: 'Waiting on Parts', className: 'bg-rose-600' }
      case 'Paid':
        return { message: 'Paid and Ready to Ship', className: 'bg-emerald-600' }
      default:
        return { message: 'Ready to Ship', className: 'bg-emerald-600' }
    }
  }

  const statusContent = getStatusContent()

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_:string, index: number) => index !== indexToRemove))
    setButtonLabel("Save");
  }


  return (
    <div className="">
      {showShipConfirmation && (
        <ShipConfirmation
          invoiceNumber={invoiceNumber}
          onHide={handleHideShipConfirmation}
        />
      )}

      <div
        id={`div-${invoiceNumber}`}
        className={`text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm ${
          showShipConfirmation ? 'hidden' : ''
        }`}
      >
        {missing && missing !== "" && missing.split(",").length > 0 && <div className="w-full py-1 font-medium text-center text-white bg-violet-600 border-b border-white">Waiting for Parts</div>}
        {images.length !== 0 ? (<div
    
          className={`grid grid-cols-3 w-full py-1 font-medium text-center text-white ${statusContent.className}`}
        >
          <div className="px-2 text-left">{new Date(shipDate + 'T00:00:00Z').toUTCString().slice(5, 16)}</div>
          <h2>{statusContent.message}</h2>
          <div className="text-right px-2">{shipMethod}</div>
        </div>) :(<div
        
          className={`grid grid-cols-3 w-full py-1 font-medium text-center text-white bg-cyan-600`}
        >
          <div className="px-2 text-left">{new Date(shipDate + 'T00:00:00Z').toUTCString().slice(5, 16)}</div>
          <h2>Add Pictures</h2>
          <div className="text-right px-2">{shipMethod}</div>
        </div>)}
        <div className="grid md:grid-cols-2 gap-2 pl-2">
          <div className="">
            <p className="my-2 font-bold">
              Invoice&nbsp;<span>{invoiceNumber}</span>
            </p>
            <div className="flex justify-center items-center">
              <div>
                {items.map((item, index) => (
                  <div key={index} className={`grid md:grid-cols-2 border-b border-gray-200 p-1 ${missing && missing.includes(`${item.partNumber}`) && "bg-violet-500 text-white rounded-md"}`}>
                    <div className="flex space-x-2 items-center pr-2">
                    
                    <p>({item.quantity})</p>
                    
                    <a className="font-medium" href={`/inventory?${item.partNumber.toLowerCase()}`}>{item.partNumber.split(":").length > 1 ? item.partNumber.split(":")[1] : item.partNumber}</a>
                    </div>
                    <p className="">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            id={`images-${invoiceNumber}`}
            className="w-auto object-contain overflow-hidden"
          >
            <div
              className={`${
                images.length === 0
                  ? 'text-gray-400 py-2 flex items-center justify-center'
                  : 'flex flex-wrap'
              }`}
            >
              {images.length > 0 ? (
                images.map((imageName:string, index:number) => (
                  <img
                    key={index}
                    src={imageName}
                    alt={imageName}
                    className="h-32 mt-1 mr-1 rounded-sm object-contain"
                    onDoubleClick={() => removeImage(index)}
                  />
                ))
              ) : (
                <div className="text-center italic">
                  <p className="mt-2">
                    To remove an image, double click the image.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 px-2 mt-5">
          <div className="p-2 text-gray-700 text-center md:border-r border-gray-200">
            <div>
              <b>Serial Numbers</b>
            </div>
            <div className="mt-1">
              {serialNumbers.length === 0 && (
                <div className="md:flex my-1">
                  <input
                    type="text"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="p-1 bg-gray-100 rounded-lg w-full flex-grow text-center"
                  />
                  <button
                    className="px-1 hover:bg-gray-300 rounded-lg"
                    onClick={() => addSerialNumber(newSerial)}
                  >
                    Add
                  </button>
                </div>
              )}

              {isEdited ? (
                <div>
                  {serialNumbers.map((serial:string, index:number) => (
                    <input
                      key={index}
                      type="text"
                      value={serial}
                      onChange={(e) =>
                        handleSerialNumberChange(index, e.target.value)
                      }
                      className="my-1 p-1 bg-gray-100 rounded-lg w-full text-center"
                    />
                  ))}
                </div>
              ) : (
                <div>
                  
                  {serialNumbers.map((serial:string, index:number) => (
                    <p
                      key={index}
                      onDoubleClick={() => setIsEdited(true)}
                      className="my-1 p-1 bg-gray-100 rounded-lg w-full text-center"
                    >
                      {serial}
                    </p>
                  ))}
                </div>
                  )}

              {serialNumbers.length > 0 && (
                <button onClick={() => setAddSerialNumber(true)}>
                  + Serial Number
                </button>
              )}
              {addNewSerialNumber && (
                <div className="md:flex my-1">
                  <input
                    type="text"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="p-1 bg-gray-100 rounded-lg w-full flex-grow text-center"
                  />
                  <button
                    className="px-1 hover:bg-gray-300 rounded-lg"
                    onClick={() => addSerialNumber(newSerial)}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="order-first sm:order-none p-2 text-gray-700 text-center md:border-r border-gray-200">
            <a href={`/sales?customers?${companyName.replace(/\s/g, "*")}`}>
            <div>
              <b>Shipping Address:</b>
            </div>
            <p className="mt-1">{companyName}</p>
            <p className="">{shipAddressLine1}</p>
            <p className="">{shipAddressLine2}</p>
            <p className="">{shipAddressCity}, {shipAddressState} {shipAddressPostalCode}</p>
     
            <p className="">{formatPhoneNumber(customerPhone)}</p>
            {billEmail.split(',').length > 1 ? <p className="">{billEmail.replace(","," ").toLowerCase()}</p> : <p>{billEmail.toLowerCase()}</p>}
            </a>
          </div>
          <div className="p-2 text-gray-700 text-center">
            <div>
              <b>Tracking Numbers</b>
            </div>
            <div className="mt-1">
           
              {trackingNumber.length === 0 && (
                <div className="md:flex my-1">
                  <input
                    type="text"
                    value={newTrackingNumber}
                    onChange={(e) => setNewTracking(e.target.value)}
                    className="p-1 bg-gray-100 rounded-lg w-full flex-grow text-center"
                  />
                  <button
                    className="px-1 hover:bg-gray-300 rounded-lg"
                    onClick={() => addTracking(newTrackingNumber)}
                  >
                    Add
                  </button>
                </div>
              )}

              {isEdited ? (
                <div>
                  {trackingNumber.map((tracking:string, index:number) => (
                    <input
                      key={index}
                      type="text"
                      value={tracking}
                      onChange={(e) =>
                        handleTrackingChange(index, e.target.value)
                      }
                      className="my-1 p-1 bg-gray-100 rounded-lg w-full"
                    />
                  ))}
                </div>
              ) : (
                <div>
                  {' '}
                  {trackingNumber.map((tracking:string, index:number) => (
                    <p
                      key={index}
                      onDoubleClick={() => setIsEdited(true)}
                      className="my-1 p-1 bg-gray-100 rounded-lg w-full"
                    >
                      {tracking}
                    </p>
                  ))}
                </div>
              )}

              {trackingNumber.length > 0 && (
                <button onClick={() => setAddTrackingNumber(true)}>
                  + Tracking Number
                </button>
              )}
              {addTrackingNumber && (
                <div className="md:flex my-1">
                  <input
                    type="text"
                    value={newTrackingNumber}
                    onChange={(e) => setNewTracking(e.target.value)}
                    className="p-1 bg-gray-100 rounded-lg w-full flex-grow"
                  />
                  <button
                    className="px-1 hover:bg-gray-300 rounded-lg"
                    onClick={() => addTracking(newTrackingNumber)}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="p-2 text-gray-700 text-center md:border-r md:border-t border-gray-200">
            <div>
              <b>Shipping Dimensions</b>
            </div>
            <div className="mt-1">
              <input
                type="text"
                value={dimensions}
                onChange={(e) => editDimensions(e.target.value)}
                className="dimensionsInput p-1 bg-gray-100 rounded-lg w-full text-center"
              />
            </div>
          </div>
          <div className="p-2 text-gray-700 text-center md:border-r md:border-t border-gray-200">
            <div>
              <b>Shipped Pieces</b>
            </div>
            <div className="mt-1">
              <input
                type="number"
                value={NumberOfPieces}
                onChange={(e) => editNumberOfPieces(parseInt(e.target.value))}
                className="NumerOfPiecesInput p-1 bg-gray-100 rounded-lg w-full text-center"
              />
            </div>
          </div>
          <div className="p-2 text-gray-700 text-center md:border-t border-gray-200">
            <div>
              <b>Shipping Weight</b>
            </div>
            <div className="mt-1">
              <input
                type="number"
                value={totalWeight}
                onChange={(e) => editWeight(parseFloat(e.target.value))}
                className="weightInput p-1 bg-gray-100 rounded-lg w-full text-center"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 text-gray-700 text-center border-t border-gray-200 font-medium">
          <div className="w-full py-1 border-r border-gray-200">
            <SerialUpload
              invoiceNumber={invoiceNumber}
              onSerialsUpdated={()=>handleSerialsUpdated}
            />
          </div>

          <div
            id={`edit-${invoiceNumber}`}
            className="w-full py-1  cursor-pointer"
          >
            <ImageUploadShip
              invoiceNumber={invoiceNumber}
              onImagesUpdated={handleImagesUpdated}
            />
          </div>
        </div>
        {buttonLabel === 'Save' && <div
        
          className={`w-full px-3 py-1 font-medium text-center bg-purple-700 
          text-white cursor-pointer`}
          onClick={()=>{setIsEdited(false);setButtonLabel("Mark as Shipped")}}
        >
          Exit without saving
        </div>}
        <div
    
          className={`w-full px-3 py-1 font-medium text-center rounded-b-lg ${
            buttonLabel === 'Save' ? 'bg-blue-700 animate-pulse' : 'bg-black'
          } text-white cursor-pointer`}
          onClick={toggleShipConfirmation}
        >
          {buttonLabel}
        </div>
      </div>
    </div>
  )
}

export default ToShipCardEditable