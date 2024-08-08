import React, { useState, useRef } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'

interface InventoryCardAddProps {
  onSave: (newItem: any) => void
  onClose: () => void
}

interface Vendor {
  vName: string
  vUrl: string
  vPartNumber: string
  vLeadTime: string
  vCost: string
}

const InventoryCardAdd: React.FC<InventoryCardAddProps> = ({
  onSave,
  onClose,
}) => {
  const [newItem, setNewItem] = useState({
    category: 'Part',
    partNumber: '',
    description: '',
    name: '',
    quantity: '',
    location: '',
    cost: '',
    retailPrice: '',
    weight: '',
    images: '',
    manufacturer: '',
    manufactPartNum: '',
    type: 'build',
    items: '[]',
    parLevel: '',
    partsInStock: 'no',
    publicFacing: 'yes'
  })
  const [selectionPublicFacing, setPublicFacing] = useState('yes')
  const [selectionPartsInStock, setPartsInStock] = useState('no')
  const [selectedOption, setSelectedOption] = useState('Part')
  const [status, setStatus] = useState('confirmation')
  const [selection, setSelection] = useState('build')
  const [vendors, setVendors] = useState<Vendor[]>([
    { vName: '', vUrl: '', vPartNumber: '', vLeadTime: '', vCost: '' },
  ])
  const options = [
    'Part',
    'Raw Material',
    'Steering Head',
    'Steering System',
    'Steering Station',
    'Boring Machine',
    'Cutting Head',
    'Auger',
  ]

  /*
  const handleVendorChange = (
    index: number,
    field: keyof Vendor,
    value: string
  ) => {
    const newVendors = [...vendors]
    newVendors[index][field] = value
    setVendors(newVendors)
  }

  const addVendor = () => {
    setVendors([
      ...vendors,
      { vName: '', vUrl: '', vPartNumber: '', vLeadTime: '', vCost: '' },
    ])
  }
  */

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value
    setSelectedOption(selectedValue)
    setNewItem({ ...newItem, category: selectedValue })
    //console.log(newItem);
  }

  const handleChange = (field: string, value: string) => {
    setNewItem({ ...newItem, [field]: value })
  }

  /*
  const handleChange = (field, value) => {
  // Convert value to a number if the field is weight or cost
  let numericValue = field === 'weight' || field === 'cost' ? Number(value) : value;

  // Ensure weight or cost cannot be negative
  if ((field === 'weight' || field === 'cost') && numericValue < 0) {
    console.error(`${field} cannot be negative. Setting to 0.`);
    numericValue = 0; // Set to default value
  }

  // Update the newItem state
  setNewItem({ ...newItem, [field]: numericValue });
};
  */

  const handleSave = async () => {
    scrollUp()
    if (
      !newItem.partNumber.trim() ||
      !newItem.name.trim() ||
      !newItem.description.trim() ||
      !newItem.quantity.trim() ||
      !newItem.retailPrice.trim()
    ) {
      alert(
        'To add an item, please enter a part number, description, public-facing description, and quantity.'
      )
      return // Exit the function early
    }
    setStatus('processing')
      // Sanitize vendors array
  const sanitizedVendors = vendors.map(vendor => ({
    ...vendor,
    vLeadTime: vendor.vLeadTime || "", // Convert empty string to null
    vCost: vendor.vCost || "", // Convert empty string to null
  }));

    const payload = { ...newItem}
    //console.log(payload)
    const params = {
      FunctionName: 'boretec_insert_item',
      Payload: JSON.stringify(payload),
    }

    const paramsQboId = {
      FunctionName: 'boretec_add_item_2_QBO',
      Payload: JSON.stringify(payload),
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

      const commandQboId = new InvokeCommand(paramsQboId)
      const responseQboId = await lambdaClient.send(commandQboId)
      //console.log('Lambda response:', response);

      // Parse the Payload to get the application-level response
      const applicationResponseQboId = JSON.parse(
        new TextDecoder().decode(responseQboId.Payload)
      )
      //console.log('Application response:', applicationResponse);
      const responseBodyQboId = JSON.parse(applicationResponseQboId.body)

      if (applicationResponse.statusCode === 200) {
        //console.log('Item added successfully.');
        setStatus('added')
        setTimeout(() => {
          onSave(newItem) // Notify parent component of the save
          // Place any additional actions you want to perform after the delay inside this block
        }, 1500)
        
       
        
      } else {
        alert('Failed to add the item: ' + responseBody.error + responseBodyQboId) //+ responseBodyQboId
        setStatus('confirmation')
      }
    } catch (error) {
      alert('Failed to add the item. ' + error)
      console.error('Error invoking Lambda function:', error)
      setStatus('confirmation')
    }
  }
  const componentRef = useRef<HTMLDivElement>(null) // Adding a ref to the component
  const scrollUp = () => {
    if (componentRef.current) {
      const scrollY =
        componentRef.current.getBoundingClientRect().top + window.scrollY - 80 // 80px above
      window.scrollTo({ top: scrollY, behavior: 'smooth' })
    }
  }

  return (
    <div ref={componentRef}>
    {status === 'processing' && (
      <div className="w-full h-96 flex justify-center items-center text-white font-medium bg-blue-600 rounded-lg">
        <p className="animate-pulse">Adding item...</p>
      </div>
    )}
    {status === 'added' && (
      <div className="w-full h-96 flex justify-center items-center text-white text-lg font-medium bg-blue-600 rounded-lg">
        <p className="">Added</p>
      </div>
    )}
    {status === 'confirmation' && (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm">
      <h1 className="text-2xl text-center font-bold px-4 py-2 text-white bg-black">New Item</h1>
      <div className="flex justify-end">
        <a href="/bulkUpload" className="bg-gray-200 text-gray-900 py-1 px-2 rounded-bl-lg">Bulk upload</a>
      </div>
      {/* beginning of required div*/}
      <div className="px-4 py-2 border-b border-blue-600">
        <p className="text-indigo-700 font-bold">Required</p>
        <div className="my-4">
          <label
            htmlFor="partNumber"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Part Number:
          </label>
          <input
            type="text"
            value={newItem.partNumber}
            onChange={(e) => handleChange('partNumber', e.target.value)}
            placeholder="Part Number"
            className={`appearance-none border border-indigo-600 rounded w-full py-2 px-3 leading-tight placeholder-indigo-400 focus:outline-indigo-600 ${newItem.partNumber ? "text-white bg-indigo-600":"text-indigo-700 bg-indigo-100"}`}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="quantity"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Quantity:
          </label>
          <input
            type="number"
            value={newItem.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            placeholder="Quantity"
            className={`appearance-none border border-indigo-600 rounded w-full py-2 px-3 leading-tight placeholder-indigo-400 focus:outline-indigo-600 ${newItem.quantity ? "text-white bg-indigo-600":"text-indigo-700 bg-indigo-100"}`}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Internal Description:
          </label>
          <textarea
            value={newItem.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Description (internal)"
            className={`appearance-none border border-indigo-600 rounded w-full py-2 px-3 leading-tight placeholder-indigo-400 focus:outline-indigo-600 ${newItem.description ? "text-white bg-indigo-600":"text-indigo-700 bg-indigo-100"}`}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Public-facing Description:
          </label>
          <textarea
            value={newItem.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Description (external)"
            className={`appearance-none border border-indigo-600 rounded w-full py-2 px-3 leading-tight placeholder-indigo-400 focus:outline-indigo-600 ${newItem.name ? "text-white bg-indigo-600":"text-indigo-700 bg-indigo-100"}`}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="retailPrice"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Retail Price: <span className="text-sm font-light">(Input numbers only - no commas or symbols)</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={newItem.retailPrice}
            onChange={(e) => handleChange('retailPrice', e.target.value)}
            placeholder="Retail Price"
            className={`appearance-none border border-indigo-600 rounded w-full py-2 px-3 leading-tight placeholder-indigo-400 focus:outline-indigo-600 ${newItem.retailPrice ? "text-white bg-indigo-600":"text-indigo-700 bg-indigo-100"}`}
          />
        </div>
        <div className="text-center md:flex md:justify-center md:items-center">
          <p className=" px-1">This will or should be public-facing? </p>

          <select
                  value={selectionPublicFacing}
                  onChange={(e) => {
                    setPublicFacing(e.target.value)
                    setNewItem({ ...newItem, publicFacing: e.target.value })
                  }}
                  className="text-indigo-700 outline-none font-bold border border-indigo-300 bg-indigo-200 focus:outline-none focus:ring-0 px-2 py-1 rounded-lg text-right"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  
                </select>
        </div>
        <div className="text-center md:flex md:justify-center md:items-center pt-2">
          <p className=" px-1">This is as a </p>

          <select
            value={selectedOption}
            onChange={handleSelectChange}
            className="outline-none font-bold border border-indigo-300 focus:outline-none focus:ring-0 px-2 py-1 rounded-lg text-right bg-indigo-200 text-indigo-700"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}{' '}
                {/* Capitalize the first letter */}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center md:flex md:justify-center md:items-center py-2">
            <p className="whitespace-nowrap px-1">
              This is a part or product that we{' '}
            </p>
            <select
              value={selection}
              onChange={(e) => {
                setSelection(e.target.value)
                setNewItem({ ...newItem, type: e.target.value })
              }}
              className="outline-none text-indigo-700 font-bold border border-indigo-300 bg-indigo-200 focus:outline-none focus:ring-0 px-2 py-1 rounded-lg text-right"
            >
              <option value="build">Build</option>
              <option value="buy">Buy</option>
            </select>
          </div>

        {selection ==="build" &&(
        <div className="text-center md:flex md:justify-center md:items-center pb-2">
                <p className="whitespace-nowrap px-1">
                  Do we want to keep the parts in stock?{' '}
                </p>
                <select
                  value={selectionPartsInStock}
                  onChange={(e) => {
                    setPartsInStock(e.target.value)
                    setNewItem({ ...newItem, partsInStock: e.target.value })
                  }}
                  className="text-indigo-700 outline-none font-bold border border-indigo-300 bg-indigo-200 focus:outline-none focus:ring-0 px-2 py-1 rounded-lg text-right"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            )}

      </div>
      {/* end of required div*/}
      {/* beginning of optional div*/}
      <div className="px-4 py-2">
        <p className="text-blue-600 font-bold">Optional</p>
        <div className="my-4">
          <label
            htmlFor="location"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Location:
          </label>
          <input
            type="text"
            value={newItem.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Location"
            className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 ${newItem.location ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="cost"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Cost:
          </label>
          <input
            type="number"
            step="0.1"
            value={newItem.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            placeholder="Cost"
            className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 ${newItem.cost ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="weight"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Weight:
          </label>
          <input
            type="number"
            step="0.1"
            value={newItem.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            placeholder="Weight"
            className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 ${newItem.weight ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
          />
        </div>


        <div className="mb-4">
          <label
            htmlFor="parLevel"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            PAR level:
          </label>
          <input
            type="number"
            value={newItem.parLevel}
            onChange={(e) => handleChange('parLevel', e.target.value)}
            placeholder="PAR level"
            className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 ${newItem.parLevel ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
          />
        </div>
        <div>

          {/*selection === 'build' && (
            <div className="mt-2">
              <div className="mb-4">
                <label
                  htmlFor="partsUrl"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Breakdown URL:
                </label>
                <input
                  type="text"
                  value={newItem.partsUrl}
                  onChange={(e) => handleChange('partsUrl', e.target.value)}
                  placeholder="Breakdown URL"
                  className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 ${newItem.partsUrl ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
                />
              </div>


            </div>
          )*/}

          {/*selection === 'buy' && (
            <div className="manufacturerVendors mt-2">
              <div className="mb-4">
                <label
                  htmlFor="ManuName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Manufacturer&apos;s Name:
                </label>
                <input
                  id="ManuName"
                  type="text"
                  value={newItem.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  placeholder="Manufacturer's Name"
                  className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 ${newItem.manufacturer ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="ManuPartNumber"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Manufacturer&apos;s Part Number:
                </label>
                <input
                  id="manuPartNumber"
                  type="text"
                  value={newItem.manufactPartNum}
                  onChange={(e) =>
                    handleChange('manufactPartNum', e.target.value)
                  }
                  placeholder="Manufacturer's Part Number"
                  className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 ${newItem.manufactPartNum ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
                />
              </div>
              <div className="vendorParent ml-5">
                {vendors.map((vendor, index) => (
                  <div key={index} className="vendor mb-4">
            
                    <label
                      htmlFor="vendor"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Vendor:
                    </label>
                    <input
                      type="text"
                      value={vendor.vName}
                      onChange={(e) =>
                        handleVendorChange(index, 'vName', e.target.value)
                      }
                      placeholder="Vendor's Name"
                      className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 mb-4 ${vendor.vName ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
                    />
                    <input
                      type="text"
                      value={vendor.vUrl}
                      onChange={(e) =>
                        handleVendorChange(index, 'vUrl', e.target.value)
                      }
                      placeholder="Product Link"
                      className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 mb-4 ${vendor.vUrl ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
                    />
                    <input
                      type="text"
                      value={vendor.vPartNumber}
                      onChange={(e) =>
                        handleVendorChange(index, 'vPartNumber', e.target.value)
                      }
                      placeholder="Product Part Number"
                      className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 mb-4 ${vendor.vPartNumber ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
                    />
                    <input
                      type="number"
                      value={vendor.vLeadTime}
                      onChange={(e) =>
                        handleVendorChange(index, 'vLeadTime', e.target.value)
                      }
                      placeholder="Product Lead Time"
                      className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 mb-4 ${vendor.vLeadTime ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
                    />
                    <input
                      type="number"
                      value={vendor.vCost}
                      onChange={(e) =>
                        handleVendorChange(index, 'vCost', e.target.value)
                      }
                      placeholder="Product Cost"
                      className={`appearance-none border border-blue-600 rounded w-full py-2 px-3 leading-tight placeholder-blue-500 focus:outline-blue-600 mb-4 ${vendor.vCost ? "text-white bg-blue-600":"text-blue-700 bg-blue-50"}`}
                    />
                
                  </div>
                ))}
                <button id="addVendorDiv" onClick={addVendor}>
                  + Vendor
                </button>
              </div>
            </div>
          )*/}
        </div>
      </div>

      {/* Buttons for Save and Close */}
      <div className="flex justify-end grid grid-cols-2 text-center">
      <button
          onClick={onClose}
          className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2"
        >
          Close
        </button>
        <button
          disabled={!newItem.retailPrice || !newItem.quantity || !newItem.description || !newItem.name || !newItem.partNumber}
          onClick={handleSave}
          className={`${!newItem.retailPrice || !newItem.quantity || !newItem.description || !newItem.name || !newItem.partNumber ? "bg-blue-100":"bg-blue-700 hover:bg-blue-800"} text-white font-bold py-2`}
        >
          Add
        </button>

      </div>
    </div>)}
    </div>
  )
}

export default InventoryCardAdd
