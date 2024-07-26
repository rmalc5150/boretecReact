import React, { useState, useEffect, ChangeEvent } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

interface PartsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  partNumber: string;
  parts: string; // CSV content as a string
  onSave: (newParts: Part[]) => void; // Callback function to notify parent component
}

interface Part {
  [key: string]: string;
}

const PartsListModal: React.FC<PartsListModalProps> = ({ isOpen, onClose, partNumber, parts, onSave }) => {
  const [parsedParts, setParsedParts] = useState<Part[]>([]);

  useEffect(() => {
    if (parts && parts.includes('\n')) {
      const parsedData = parseCSV(parts);
      setParsedParts(parsedData);
    }
  }, [parts]);

  const parseCSV = (csv: string) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const data = line.split(',');
      return headers.reduce((obj, nextKey, index) => {
        obj[nextKey] = data[index];
        return obj;
      }, {} as Part);
    });
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const newParts = parseCSV(text);
          setParsedParts(newParts);
          await savePartsToLambda(partNumber, text);
        }
      };
      reader.readAsText(file);
    }
  };

  const savePartsToLambda = async (partNumber: string, newContent: string) => {
    const payload = {
      partNumber,
      newContent: {
        parts: newContent
      }
    };
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_update_item',
      Payload: JSON.stringify(payload),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      if (response.StatusCode === 200) {
      
      } else {
        alert('Failed to add the item.' + JSON.stringify(response));
      }
    } catch (error) {
      alert('Failed to add the item. ' + error);
      console.error('Error invoking Lambda function:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="text-white bg-gray-900 absolute w-full h-full -mt-8 top-0 left-0">
      <button onClick={onClose} className="w-full z-1000 top-0 left-0 absolute bg-white text-black p-2 text-left">Close</button>
      
      <div className="p-4 overflow-auto">
        <h2>Parts List for {partNumber}</h2>
        {parsedParts.length > 0 ? (
          <table className="w-full bg-gray-900 text-white overflow-y-auto">
            <thead>
              <tr>
                {Object.keys(parsedParts[0]).map((header, index) => (
                  <th key={index} className="border border-gray-700 px-4 py-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedParts.map((part, index) => (
                <tr key={index}>
                  {Object.values(part).map((value, idx) => (
                    <td key={idx} className="border border-gray-700 px-4 py-2">{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>
            <p>No parts data available. Please upload a CSV file.</p>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PartsListModal;
