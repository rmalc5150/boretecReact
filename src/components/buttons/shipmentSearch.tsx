'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'

interface searchShipmentsProps {
  companyName: string
}
export interface searchShipment {
  invoiceNumber: string
  status: string
  serialNumbers: string[] | string
  customerPhone: string
  tracking: string[]
  shippingWeight: string
  images: [] | string
  shippedDate: string
  NumberOfPieces: number
  totalWeight: number
  dimensions: string
  trackingNumber: string[] | string
  shipAddressLine1: string
  shipAddressLine2: string
  shipAddressCity: string
  shipAddressState: string
  shipAddressPostalCode: string
  shipMethod: string
  companyName: string
  itemsDescription: string[]
  customerEmail: string
  itemsQuantity: string[]
  InvoiceDueDate: string
  billEmail: string
  dateAdded: string
  invoiceItems: string
}

// Define a type for individual machines
export interface ItemDetail {
  description: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

const SearchShipments: React.FC<searchShipmentsProps> = ({ companyName }) => {
  const [shipments, setShipments] = useState<searchShipment[]>([])


  const fetchToShipItems = useCallback(async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_toShip_select_companyName',
      Payload: JSON.stringify({ companyName }),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject)
      setShipments(payloadObject) // Assuming the payload contains the array of items
    } catch (error) {
      console.error('Error fetching inventory items', error)
    }
  }, [companyName]);

  useEffect(() => {
    fetchToShipItems();
  }, [fetchToShipItems]);

  return (
    <div className="bg-gray-200 border-t border-b border-gray-300">
      {shipments.length === 0 && <p className="bg-white text-center p-1">No available shipments.</p>}
      {shipments.map((shipment, index) => (
        <div
          key={index}
          className={`text-gray-700 p-2 bg-white lg:text-sm grid md:grid-cols-2 gap-2 my-2`}
        >



          <div className="">
                      <div className="text-center">
            <p className="my-2 text-lg font-bold">
              Invoice {shipment.invoiceNumber} - {shipment.status}
            </p>
          </div>
            <div className="p-2 text-gray-700 text-center">
 
              
                {shipment.serialNumbers && (
                  <div
                    id={`serialNumbers-${shipment.invoiceNumber}`}
                    className="w-auto object-contain overflow-hidden"
                  >
                           <div>
                <b>Serial Numbers</b>
              </div>
                    <div
                      className={`${
                        !Array.isArray(shipment.serialNumbers) ||
                        shipment.serialNumbers.length === 0
                          ? 'text-gray-400 py-2 flex items-center justify-center'
                          : ''
                      }`}
                    >
                      {(() => {
                        // Attempt to parse serialNumbers if it's a string, otherwise use it directly if it's already an array
                        let serialNumbers = Array.isArray(
                          shipment.serialNumbers
                        )
                          ? shipment.serialNumbers
                          : typeof shipment.serialNumbers === 'string' &&
                            shipment.serialNumbers.trim().startsWith('[')
                          ? JSON.parse(shipment.serialNumbers)
                          : []

                        return serialNumbers.length > 0 ? (
                          serialNumbers.map((serial: string, index: number) => (
                            <p className="px-1" key={serial+index}>{serial}</p>
                          ))
                        ) : (
                          <span>No Serial Numbers available</span>
                        )
                      })()}
                    </div>
                  </div>
                )}
                          
              <div>
                <b>Tracking Numbers</b>
              </div>
              <div className="mt-1">
                {shipment.trackingNumber && (
                  <div
                    id={`trackingNumber-${shipment.invoiceNumber}`}
                    className="w-auto object-contain overflow-hidden"
                  >
                    <div
                      className={`${
                        !Array.isArray(shipment.trackingNumber) ||
                        shipment.trackingNumber.length === 0
                          ? 'text-gray-400 py-2 flex items-center justify-center'
                          : ''
                      }`}
                    >
                      {(() => {
                        // Attempt to parse trackingNumber if it's a string, otherwise use it directly if it's already an array
                        let trackingNumber = Array.isArray(
                          shipment.trackingNumber
                        )
                          ? shipment.trackingNumber
                          : typeof shipment.trackingNumber === 'string' &&
                            shipment.trackingNumber.trim().startsWith('[')
                          ? JSON.parse(shipment.trackingNumber)
                          : []

                        return trackingNumber.length > 0 ? (
                          trackingNumber.map(
                            (number: string, index: number) => <p key={index+number}>{number}</p>
                          )
                        ) : (
                          <span>No Tracking Numbers available</span>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
           
              
            </div>
            <div className="p-2 text-gray-700 text-center">
              <div>
                <b>Shipping Information</b>
              </div>
              <p className="mt-1">{shipment.companyName}</p>
              <p className="">{shipment.shipAddressLine1}</p>
              <p className="">{shipment.shipAddressLine2}</p>
              <p className="">{shipment.shipAddressCity}, {shipment.shipAddressState} {shipment.shipAddressPostalCode} </p>
              
              <p className="">{shipment.customerPhone}</p>
              <p className="">{shipment.billEmail.replace(/,/g, "")}</p>
              {shipment.dimensions && <div className="p-1 text-gray-700 mt-5">
                <b>Shipping Dimensions</b>: {shipment.dimensions}
              </div>}
              {shipment.NumberOfPieces && <div className="p-1 text-gray-700">
                <b>Shipped Pieces</b>: {shipment.NumberOfPieces}
              </div>}
              {shipment.totalWeight && <div className="p-1 text-gray-700">
                <b>Shipping Weight</b>: {shipment.totalWeight}
              </div>}
            </div>
 
          </div>
          <div
            id={`images-${shipment.invoiceNumber}`}
            className="w-auto object-contain overflow-hidden"
          >
            <div
              className={`${
                shipment.images && shipment.images.length === 0
                  ? 'text-gray-400 py-2 flex items-center justify-center'
                  : ''
              }`}
            >
              
              {shipment.images && (
                <div
                  id={`images-${shipment.invoiceNumber}`}
                  className="w-auto object-contain overflow-hidden"
                >
                  <div
                    className={`${
                      !Array.isArray(shipment.images) ||
                      shipment.images.length === 0
                        ? 'text-gray-400 py-2 flex items-center justify-center'
                        : ''
                    }`}
                  >
                    {(() => {
                      // Attempt to parse images if it's a string, otherwise use it directly if it's already an array
                      let images = Array.isArray(shipment.images)
                        ? shipment.images
                        : typeof shipment.images === 'string' &&
                          shipment.images.trim().startsWith('[')
                        ? JSON.parse(shipment.images)
                        : []

                      return images.length > 0 ? (
                        images.map((imageName: string, index: number) => (
                          <img
                            key={index}
                            src={imageName}
                            alt={`image ${index}`}
                            className="w-40 rounded-sm object-contain p-px"
                          />
                        ))
                      ) : (
                        <span>No images available</span>
                      )
                    })()}
                  </div>
                </div>
              )}
{/* Table to display inventory items */}
{shipment.invoiceItems && (<div>
  <p className="mt-2 font-bold text-lg">Items</p>
  <table className="text-left mt-2 min-w-full divide-y divide-gray-200 border-b border-gray-200">
    <thead>
      <tr>
        <th scope="col" className="px-2 py-1 text-xs font-medium uppercase">Quantity</th>
        <th scope="col" className="px-2 py-1 text-xs font-medium uppercase">Part Number</th>
        <th scope="col" className="px-2 py-1 text-xs font-medium uppercase">Description</th>

      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {(() => {
        // Attempt to parse invoiceItems if it's a string in JSON format
        let invoiceItems = [] as ItemDetail[];
        try {
          invoiceItems = JSON.parse(shipment.invoiceItems) as ItemDetail[];
        } catch (error) {
          console.error('Error parsing invoiceItems', error);
        }

        return invoiceItems.map((item, index) => (
          <tr key={index}>
            <td className="px-2 py-1 whitespace-nowrap">{item.quantity}</td>
            <td className="px-2 py-1 whitespace-nowrap">{item.partNumber.split(":").length > 1 ? item.partNumber.split(":")[1] : item.partNumber}</td>
            <td className="px-2 py-1">{item.description}</td>

          </tr>
        ));
      })()}
    </tbody>
  </table>
  </div>
)}

            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SearchShipments
