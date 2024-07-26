import React, { useState, useEffect } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

interface Supplier {
  vendor: string;
  url: string;
  vendorPartNumber: string;
}

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  partNumber: string;
  vendors: string; // Suppliers is now a string
  manufacturer: string
  manufactPartNum: string
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, partNumber, vendors, manufacturer, manufactPartNum }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSuppliers, setEditedSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    try {
      // Parse the suppliers string as JSON
      const parsedSuppliers = JSON.parse(vendors);
      setEditedSuppliers(parsedSuppliers);
    } catch (error) {
      console.error("Error parsing suppliers data:", error);
      // Handle parsing error or set default values if necessary
    }
  }, [vendors]);

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    setIsEditing(false);

    const params: InvokeCommandInput = {
      FunctionName: 'boretec_update_item',
      Payload: JSON.stringify({ partNumber, newContent: { suppliers: editedSuppliers } })
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      console.log('Response from Lambda:', response);
      onClose(); // Close modal after saving
    } catch (error) {
      console.error('Error invoking Lambda function', error);
    }
  };

  const handleChange = (index: number, field: keyof Supplier, value: string) => {
    const updatedSuppliers = [...editedSuppliers];
    updatedSuppliers[index][field] = value;
    setEditedSuppliers(updatedSuppliers);
  };

  if (!isOpen) return null;

  return (
    <div className="justify-center items-center bg-white z-50 w-full h-full fixed top-0 -mt-8 left-0 bg-gray-900 bg-opacity-90 text-black">
      <div className="bg-white p-5 m-auto">
      <h2 className="text-xl mb-4">Manufacturer of {partNumber}</h2>
        <p>Name: {manufacturer}</p>
        <p>Part Number: {manufactPartNum}</p>
        <h2 className="text-xl mt-10 mb-4">Vendors</h2>
        <ul className="overflow-y-auto">
          {editedSuppliers.map((supplier, index) => (
            <li key={index} className="mb-10 flex flex-col">
              <input
                type="text"
                value={`Vendor: ${supplier.vendor}`}
                onChange={(e) => handleChange(index, 'vendor', e.target.value)}
                disabled={!isEditing}
                className="mr-2"
              />
              <a href={supplier.url} target="_blank" rel="noopener noreferrer" className={`${isEditing ? 'hidden' : ''}`}>{supplier.url}</a>
              <input
                type="text"
                value={supplier.url}
                onChange={(e) => handleChange(index, 'url', e.target.value)}
                disabled={!isEditing}
                className={`mr-2 ${!isEditing ? 'hidden' : ''}`}
              />
              <input
                type="text"
                value={`Vendor's part number: ${supplier.vendorPartNumber}`}
                onChange={(e) => handleChange(index, 'vendorPartNumber', e.target.value)}
                disabled={!isEditing}
                className="mr-2"
              />
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-4">
          <button 
            className="flex-1 bg-gray-200 py-1 px-2 mx-1 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
          {isEditing ? (
            <button 
              className="flex-1 bg-black border-transparent border py-1 px-2 mx-1 rounded-lg text-white hover:bg-transparent hover:text-black hover:border-black"
              onClick={handleSave}
            >
              Save
            </button>
          ) : (
            <button 
              className="flex-1 bg-black border-transparent border py-1 px-2 mx-1 rounded-lg text-white hover:bg-transparent hover:text-black hover:border-black"
              onClick={handleEdit}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierModal;
