import React, { useState, useEffect } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

// Define the props interface
interface EstimateSearchProps {
  displayName: string;
}

// Define the estimate interface
interface Estimate {
  estimateID: string;
  dateCreated: string;
  origin: string | null;
  subtotal: number;
  discount:number;
  tax:number;
}

const EstimateSearch: React.FC<EstimateSearchProps> = ({ displayName }) => {
  // Type the estimates state with the Estimate interface
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEstimates = async () => {
    setIsLoading(true);
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_estimateSearch',
      Payload: JSON.stringify({ displayName }),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);

      const payloadString = new TextDecoder().decode(response.Payload);
      const payloadObject = JSON.parse(payloadString);
      //console.log(payloadObject);
      if (payloadObject) {
        setIsLoading(false);
        setEstimates(payloadObject);
      } else {
        alert(`Error: ${payloadObject}`);
      }
    } catch (error) {
      console.error('Error fetching estimates', error);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [displayName]);

  return (
    <div>
    {isLoading && <p className="animate-pulse">Loading...</p>}
    {estimates.length > 0 ? (
    <div className="overflow-x-auto">
<table className="min-w-full divide-y divide-gray-200 shadow-md">
  <thead className="border-t border-gray-300">
    <tr>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
        Estimate Number
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
        Date Created
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
        Origin
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
        Total
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {estimates.map((estimate, index) => (
      <tr key={index} className="hover:bg-gray-100">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <a href={`/sales?estimates?${estimate.estimateID}`} className="block w-full h-full">
            {estimate.estimateID}
          </a>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <a href={`/sales?estimates?${estimate.estimateID}`} className="block w-full h-full">
            {new Date(estimate.dateCreated).toString().slice(0, 15)}
          </a>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <a href={`/sales?estimates?${estimate.estimateID}`} className="block w-full h-full">
            {estimate.origin && <div>{estimate.origin.charAt(0).toUpperCase() + estimate.origin.slice(1)}</div>}
          </a>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <a href={`/sales?estimates?${estimate.estimateID}`} className="block w-full h-full">
          ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(estimate.subtotal-(estimate.subtotal*estimate.discount/100)+estimate.tax)}
          </a>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>): (<p className="p-1 text-center border-t border-gray-300 bg-white">No recent estimates.</p>)}
    </div>
  );
};

export default EstimateSearch;
