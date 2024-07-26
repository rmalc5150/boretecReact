'use client'

import React, { useRef, useState } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

interface SerialUploadProps {

  invoiceNumber: string
  onSerialsUpdated: (serials: string[]) => void;
}

const SerialUpload: React.FC<SerialUploadProps> = ({ onSerialsUpdated, invoiceNumber }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;
    setIsUploading(true);
  
    const fileContent = await file.arrayBuffer();
    const payload = {
      base64Image: Buffer.from(fileContent).toString('base64'),
      invoiceNumber,
    };
    console.log(payload);
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_rekognition_serialNumber',
      Payload: JSON.stringify(payload),
    };
  
    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      const result = JSON.parse(new TextDecoder('utf-8').decode(response.Payload as Uint8Array));
      console.log(result);
      if (result.statusCode === 200) {
        // Wrap result.detectedText in an array before calling onSerialsUpdated
        onSerialsUpdated([result.detectedText]);
      } else {
        console.error('Upload failed.');
      }
    } catch (error) {
      console.error('Error invoking Lambda function', error);
    } finally {
      setIsUploading(false);
    }
  };
  

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full flex justify-center items-center space-x-2"
      >
        {isUploading ? 'Uploading...' : '+ Serial Number'}
      </button>
    </div>
  );
};

export default SerialUpload
