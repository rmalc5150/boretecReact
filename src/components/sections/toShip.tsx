'use client'

import React, { useEffect, useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import ToShipCardEditable from '../../components/cards/ToShipCardEditable'
import { ToShipCardEditableProps } from '../../components/cards/ToShipCardEditable'

const ToShip = () => {
  const [toShipItemsShow, setToShipItemsShow] = useState<
    ToShipCardEditableProps[]
  >([])
  const [toShipItemsTable, setToShipItemsTable] = useState<
    ToShipCardEditableProps[]
  >([])
  const [allItems, setAllItems] = useState<
  ToShipCardEditableProps[]
>([])
  const [showFutureTable, setShowFutureTable] = useState(false)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortedBy, setSortedBy] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    fetchToShipItems()
    // Function to detect if the device is mobile
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    }
    // Set isOpen to true if isMobile returns true
    setIsMobile(isMobile())
  }, [])

  const fetchToShipItems = async () => {
    const params = {
      FunctionName: 'boretec_toShip_selectAll',
      Payload: JSON.stringify({}),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const items: ToShipCardEditableProps[] = JSON.parse(payloadString) // Assuming the payload contains the array of items
      //console.log(items);
      setAllItems(items);
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Remove time part to compare only the date part

      const pastOrPresentItems: ToShipCardEditableProps[] = []
      const futureItems: ToShipCardEditableProps[] = []
      let checkedCount =0;

      items.forEach((item) => {
        const shipDate = new Date(item.shipDate)
        shipDate.setHours(0, 0, 0, 0) // Normalize shipDate for comparison

        if (!item.checked) { // Count items where checked is explicitly null
          checkedCount += 1;
        }
  
        if (shipDate <= today) {
          pastOrPresentItems.push(item);
        } else {
          futureItems.push(item);
        }
      })
      
      //console.log(checkedCount);
      /*if (checkedCount > 0) {
        checkInventory();
        //console.log(checkedCount);
      }*/
      setToShipItemsShow(pastOrPresentItems)
      setToShipItemsTable(futureItems)
      //console.log(futureItems);

      // You might set these arrays to state or handle them as needed
      // setPastOrPresentItems(pastOrPresentItems);
      // setFutureItems(futureItems);
    } catch (error) {
      console.error('Error fetching inventory items', error)
    }
  }

  const checkInventory = async () => {
    const params = {
      FunctionName: 'boretec_toShip_check_inventory',
      Payload: JSON.stringify({}),
    }
  
    try {
      const command = new InvokeCommand(params);
      await lambdaClient.send(command); // This line sends the command to AWS Lambda
      console.log('Lambda function invoked successfully');
    } catch (error) {
      console.error('Error fetching inventory items', error);
    }
  }
  

  const sortData = (field: keyof ToShipCardEditableProps) => {
    const sorted = [...toShipItemsTable].sort((a, b) => {
      // Use a non-null assertion operator (!) if you are sure it won't be null,
      // or provide a fallback value to handle null or undefined.
      const aValue = a[field] ?? '' // Fallback to empty string if null
      const bValue = b[field] ?? '' // Fallback to empty string if null

      // If the field values are strings, ensure they are compared correctly.
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      // If the field values are numbers, handle them accordingly.
      // Adjust this part if you have specific fields that are numbers.
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Adjust comparisons as needed based on your data types.
      return 0
    })
    setToShipItemsTable(sorted)
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    setSortedBy(field)
  }

  function formatQuantitiesAndParts(shipment: ToShipCardEditableProps) {
    const quantities = shipment.itemsQuantity.split(",");
    const partNumbers = shipment.itemsDetailType.split(",").map(pn => pn.includes(':') ? pn.split(':')[1] : pn);
    const combined = quantities.map((qty, index) => (
      <p key={index}>({qty.trim()}) {partNumbers[index].trim()}</p>
    ));
    return combined;
  }
  

  const convertToCSV = (data: ToShipCardEditableProps[]) => {
    const headers = ['Invoice Number', 'Invoice Status', 'Quantity - Part Number', 'Ship Date'];
    
    const escapeCSV = (str: string) => {
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`; // Escape double quotes and wrap with quotes
      }
      return str;
    };
  
    const rows = data.map(item => {
      const quantityParts = item.itemsQuantity.split(",");
      const partNumbers = item.itemsDetailType.split(",").map(pn => pn.includes(':') ? pn.split(':')[1] : pn);
      const combinedParts = quantityParts.map((qty, index) => `${qty.trim()} * ${partNumbers[index]?.trim()}`).join("; ");
  
      return [
        escapeCSV(item.invoiceNumber),
        escapeCSV(item.status),
        escapeCSV(combinedParts),
        escapeCSV(item.shipDate)
      ];
    });
  
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ToShipData.csv');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };
  

  return (
    <section className="mt-5">
      <div className={`flex justify-end`}>

        <button
          className="text-xs font-light text-gray-600 mb-1 mx-2"
          onClick={() => setShowFutureTable(!showFutureTable)}
        >
          {showFutureTable ? 'Hide Upcoming Shipments' : 'Upcoming Shipments'}
        </button>
      </div>
      {showFutureTable && (
        <div className="m-2">
          <table className="w-full bg-white p-2 rounded-lg text-center border-gray-200 max-h-screen overflow-y-auto">
  <thead>
    <tr>
      <th className="border-r py-1 cursor-pointer" onClick={() => sortData('invoiceNumber')}>
        Invoice Number {sortedBy === 'invoiceNumber' && sortDirection === 'desc' && <span className="text-xs text-gray-400">&#9650;</span>} {sortedBy === 'invoiceNumber' && sortDirection === 'asc' && <span className="text-xs text-gray-400">&#9660;</span>}
      </th>
      {!isMobile && <th className="border-r  py-1 cursor-pointer" onClick={() => sortData('status')}>
        Invoice Status {sortedBy === 'status' && sortDirection === 'desc' && <span className="text-xs text-gray-400">&#9650;</span>} {sortedBy === 'status' && sortDirection === 'asc' && <span className="text-xs text-gray-400">&#9660;</span>}
      </th>}
      {!isMobile && <th className="border-r  py-1">
        Quantity - Part Number
      </th>}
      <th className=" py-1 cursor-pointer" onClick={() => sortData('shipDate')}>
        Ship Date {sortedBy === 'shipDate' && sortDirection === 'desc' && <span className="text-xs text-gray-400">&#9650;</span>} {sortedBy === 'shipDate' && sortDirection === 'asc' && <span className="text-xs text-gray-400">&#9660;</span>}
      </th>
    </tr>
  </thead>
  <tbody>
    {toShipItemsTable.map((shipment, index) => (
      <tr key={index}>
        <td className="border-r border-t">
          {shipment.invoiceNumber}
        </td>
        {!isMobile &&<td className="border-r border-t">{shipment.status}</td>}
        {!isMobile &&<td className="border-r border-t">
          {formatQuantitiesAndParts(shipment)}
        </td>}
        <td className="border-t">{shipment.shipDate}</td>
      </tr>
    ))}
  </tbody>
</table>
<div className="flex justify-end text-xs font-light text-gray-600"><button onClick={() => convertToCSV(allItems)}>download list</button></div>
        </div>
      )}
      <div id="toShipCards" className="grid lg:grid-cols-1 gap-2 my-1">
        {toShipItemsShow.length > 0 ? (
          toShipItemsShow.map((item, index) => (
            <div key={index}>
              <ToShipCardEditable
                serialNumbers={item.serialNumbers}
                status={item.status}
                shippedDate={item.shippedDate}
                invoiceNumber={item.invoiceNumber}
                NumberOfPieces={item.NumberOfPieces}
                totalWeight={item.totalWeight}
                dimensions={item.dimensions}
                trackingNumber={item.trackingNumber}
                shipAddressLine1={item.shipAddressLine1}
                shipAddressLine2={item.shipAddressLine2}
                shipAddressLine3={item.shipAddressLine3}
                shipAddressLine4={item.shipAddressLine4}
                shipMethod={item.shipMethod}
                companyName={item.companyName}
                itemsDescription={item.itemsDescription}
                customerEmail={item.customerEmail}
                customerPhone={item.customerPhone}
                itemsQuantity={item.itemsQuantity}
                InvoiceDueDate={item.InvoiceDueDate}
                billEmail={item.billEmail}
                dateAdded={item.dateAdded}
                tracking={item.tracking}
                shippingWeight={item.shippingWeight}
                images={item.images}
                shipAddressCity={item.shipAddressCity}
                shipAddressState={item.shipAddressState}
                shipAddressPostalCode={item.shipAddressPostalCode}
                itemsDetailType={item.itemsDetailType}
                shipDate={item.shipDate}
                checked = {item.checked}
                missing={item.missing}
                invoiceItems={item.invoiceItems}
              />
            </div>
          ))
        ) : (
          <div className="p-2 text-sm font-thin">
            Everything&apos;s shipped.
          </div>
        )}
      </div>
    </section>
  )
}

export default ToShip
