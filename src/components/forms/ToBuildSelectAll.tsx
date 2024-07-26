import React, { useEffect, useState } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

interface Part {
  partNumber: string;
  status: string;
  imageUrl: string;
  quantity: number;
  dateCreated: string;
  dateCompleted: string;
  dateOrdered: string | null;
  editor: string | null;
  origin: string;
  vendors: string;
  partLocation: string;
  cost: string;
  assignedTo: string;
  internalDescription: string;
  showItem: number;
  dateEdited: string | null;
  manufactPartNum: string;
  manufacturer: string;
  paymentMethod: string | null;
}

const ToOrderSelectAll: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedBy, setSortedBy] = useState<string>('');

  // Refactored async function to fetch parts
  const fetchOrders = async () => {
    const payload = {}; // Assuming no payload needed for this invocation

    const params: InvokeCommandInput = {
      FunctionName: 'boretec_toBuild_selectAll',
      Payload: JSON.stringify(payload),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);

      const result = JSON.parse(
        new TextDecoder('utf-8').decode(response.Payload as Uint8Array)
      );

      // Assuming result is the array directly, adjust based on actual response structure
      if (result) {
        setParts(result); // Assuming 'body' contains the array of parts, adjust based on actual response structure
      } else {
        console.log('Lambda function returned an error:', response);
      }
    } catch (error) {
      console.error('Error calling Lambda function', error);
      // Handle error appropriately
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []); // Dependency array is empty, so this runs once on component mount


  const sortData = (field: keyof Part) => {
    const sorted = [...parts].sort((a, b) => {
      // Use a non-null assertion operator (!) if you are sure it won't be null,
      // or provide a fallback value to handle null or undefined.
      const aValue = a[field] ?? ''; // Fallback to empty string if null
      const bValue = b[field] ?? ''; // Fallback to empty string if null
  
      // If the field values are strings, ensure they are compared correctly.
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
  
      // If the field values are numbers, handle them accordingly.
      // Adjust this part if you have specific fields that are numbers.
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
  
      // Adjust comparisons as needed based on your data types.
      return 0;
    });
    setParts(sorted);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setSortedBy(field);
  };

  return (
    <table className="w-full bg-white p-2 rounded-lg text-center border-gray-200 max-h-screen overflow-y-auto">
      <thead>
        <tr>
          <th className="border-r" onClick={() => sortData('partNumber')}>Part Number</th>
          <th className="border-r" onClick={() => sortData('status')}>Status</th>
          <th className="border-r" onClick={() => sortData('quantity')}>Quantity</th>
          <th className="border-r" onClick={() => sortData('dateCreated')}>Date Created</th>
          <th className="border-r" onClick={() => sortData('origin')}>Origin</th>
          <th className="border-r" onClick={() => sortData('dateCompleted')}>Completed</th>
          <th className="" onClick={() => sortData('assignedTo')}>Assigned to</th>
        </tr>
      </thead>
      <tbody>
        {parts.map((part, index) => (
          <tr key={index}>
            <td className="border-r border-t">{part.partNumber}</td>
            <td className="border-r border-t">{part.status}</td>
            <td className="border-r border-t">{part.quantity}</td>
            <td className="border-r border-t">{new Date(part.dateCreated).toLocaleDateString()}</td>
            <td className="border-r border-t">{part.origin}</td>
            <td className="border-r border-t">{part.dateCompleted ? `${new Date(part.dateCompleted).toLocaleDateString()}`: ""}</td>
            <td className="border-t">{part.assignedTo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ToOrderSelectAll;
