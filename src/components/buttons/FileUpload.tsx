import React, { useRef, useState } from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  apiVersion: "latest",
  credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY as string,
  },
});

const bucketName = 'boretec-files';

const FileUpload: React.FC<{
  partNumber: string;
  onFilesUpdated: (newFiles: {name: string, url: string}[]) => void;
}> = ({ partNumber, onFilesUpdated }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const fileName = `${partNumber}-${file.name}`.replace(/\s+/g, '_');


    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file,
      }));

      const fileUrl = `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(fileName)}`;

      // Pass an object containing both the file name and URL
      onFilesUpdated([{ name: fileName, url: fileUrl }]);
    } catch (error) {
      console.error('Error uploading to S3:', error);
      alert("File didn't upload");
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
        accept="*"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
      <div className="flex justify-center items-center">
        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="text-white py-1 px-2 bg-gray-800 rounded-sm"
        >
          {isUploading ? 'Uploading...' : 'Add Files'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
