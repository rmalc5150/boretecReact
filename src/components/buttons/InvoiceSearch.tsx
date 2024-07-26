import React, { useState, useEffect } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

// Define the props interface
interface InvoiceSearchProps {
  displayName: string;
}

// Define the invoice interface
interface Invoice {
  invoiceNumber: string;
  dateCreated: string;
  invoiceStatus: string | null;
  total: number;
}

const InvoiceSearch: React.FC<InvoiceSearchProps> = ({ displayName }) => {
  // Type the invoices state with the Invoice interface
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_invoiceSearch',
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
        setInvoices(payloadObject);
      } else {
        alert(`Error: ${payloadObject}`);
      }
    } catch (error) {
      console.error('Error fetching invoices', error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [displayName]);

  return (
    <div>
    {isLoading && <p className="animate-pulse">Loading...</p>}
    {invoices.length > 0 ? (
    <div className="overflow-x-auto">
<table className="min-w-full divide-y divide-gray-200 shadow-md">
  <thead className="border-t border-gray-300">
    <tr>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
        Invoice Number
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
        Date Created
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
        Status
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
        Total
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {invoices.map((invoice, index) => (
      <tr key={index} className="hover:bg-gray-100">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <a href={`/sales?invoices?${invoice.invoiceNumber.toLowerCase()}`} className="block w-full h-full">
            {invoice.invoiceNumber}
          </a>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <a href={`/sales?invoices?${invoice.invoiceNumber.toLowerCase()}`} className="block w-full h-full">
            {new Date(invoice.dateCreated).toString().slice(0, 15)}
          </a>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <a href={`/sales?invoices?${invoice.invoiceNumber.toLowerCase()}`} className="block w-full h-full">
            {invoice.invoiceStatus === "Paid" ? "Paid" : "Unpaid"}
          </a>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <a href={`/sales?invoices?${invoice.invoiceNumber.toLowerCase()}`} className="block w-full h-full">
          ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(invoice.total)}
          </a>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>): (<p className="p-1 text-center border-t border-gray-300 bg-white">No recent invoices.</p>)}
    </div>
  );
};

export default InvoiceSearch;
