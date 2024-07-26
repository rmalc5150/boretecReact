import React, { useRef, useState } from 'react';


const ImageUploadShip: React.FC<{
  invoiceNumber: string;
  onImagesUpdated: (newImages: string[]) => void;
}> = ({ invoiceNumber, onImagesUpdated }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      onImagesUpdated(newImages);
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
        {isUploading ? 'Uploading...' : '+ Outgoing Image'}
      </button>
    </div>
  );
};

export default ImageUploadShip;
