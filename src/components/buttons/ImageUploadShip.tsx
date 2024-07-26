import React, { useRef, useState } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';
import imageCompression from 'browser-image-compression';

const ImageUploadShip: React.FC<{
  invoiceNumber: string;
  onImagesUpdated: (newImages: string[]) => void;
}> = ({ invoiceNumber, onImagesUpdated }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    // Compression options
    const options = {
      maxSizeMB: 3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      // Compress the image with the options
      const compressedFile = await imageCompression(file, options);

      // Convert the compressed file to ArrayBuffer for upload
      const fileContent = await compressedFile.arrayBuffer();

      const payload = {
        fileName: compressedFile.name, // Use compressed file name
        fileContent: arrayBufferToBase64(fileContent),
        invoiceNumber,
      };
      
      //console.log(payload);

      const params: InvokeCommandInput = {
        FunctionName: 'boretec_upload_image',
        Payload: JSON.stringify(payload),
      };

      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      //console.log(response);

      const result = JSON.parse(new TextDecoder('utf-8').decode(response.Payload as Uint8Array));

      if (result.statusCode === 200) {
        onImagesUpdated([result.url]);
      } else {
        alert("Image didn't upload");
      }
    } catch (error) {
      console.error('Error uploading or compressing image', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(uploadFile);
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
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? 'Uploading...' : '+ Image'}
      </button>
    </div>
  );
};

export default ImageUploadShip;