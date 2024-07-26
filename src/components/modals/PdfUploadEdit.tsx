import React, { useState } from 'react';
import { InvokeCommand, InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';


interface PdfUploadProps {
    partNumber: string;
    onHide: (fileName:string) => void;

}

const PdfUpload: React.FC<PdfUploadProps> = ({ partNumber, onHide }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState('');
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files ? event.target.files[0] : null;
        setFile(uploadedFile);
    };

    
  
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!file) {
          alert('Please select a file to upload.');
          return;
      }
      setUploadStatus('Uploading...');
      const fileContent = await file.arrayBuffer();
      const payload = {
        fileName: file.name,
        fileContent: Buffer.from(fileContent).toString('base64'),
        partNumber
    };
    
    const params: InvokeCommandInput = {
        FunctionName: 'boretec_upload_pdf',
        Payload: JSON.stringify(payload)
    };
 
        //console.log(payload);
      try {
          const command = new InvokeCommand(params);
          const response = await lambdaClient.send(command);
  
          const result = JSON.parse(new TextDecoder("utf-8").decode(response.Payload));
          //console.log(result);
          if (result.statusCode === 200) {
              setUploadStatus('File uploaded successfully.');
              onHide(file.name); // Correctly call the onHide prop with the file name
              
          } else {
              // Display error message from Lambda response if available
              const errorMessage = result.errorMessage || 'Failed to upload the file.';
              setUploadStatus(errorMessage);
          }
      } catch (error) {
          // Detailed error logging
          console.error('Error invoking Lambda function', error);
          if (error instanceof Error) {
              setUploadStatus(`Error: ${error.message}`);
          } else {
              setUploadStatus('Unknown error occurred');
          }
      }

      };
  
      const subject = `Please upload the drawings for ${partNumber}`;
      const body = "Thanks.";
      const mailtoLink = `mailto:sam@boretec.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    


  
    return (
        <div className="">

            <div className="justify-center items-center">
                <div>
            <p className="font-bold tracking-tight">Add or Replace Drawings</p>
            <p className="text-center w-full p-2 italic text-gray-500">Note: there&apos;s a 6 mb limit.</p>
            <form className="p-2" onSubmit={handleSubmit}>
                <input type="file" accept=".pdf" onChange={handleFileChange} />
                <button className="rounded-sm bg-gray-800 text-white my-1 px-2 py-1" type="submit">Upload</button>
            </form>
            {uploadStatus && <p className="font-bold py-2">{uploadStatus}</p>}
            <div className="text-center w-full italic px-2 my-4 text-gray-500"><a href={mailtoLink}>Click here to ask Sam to upload a file.</a></div>
            </div>
       
            </div>
        </div>
    );
  };

  export default PdfUpload;