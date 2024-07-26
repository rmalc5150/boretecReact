import React, { useState } from 'react';
import { InvokeCommand, InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';
import confetti from 'canvas-confetti';
import Cookies from 'js-cookie';

interface PdfUploadProps {
    partNumber: string;
    onHide: (fileName:string) => void;


}

const PdfUpload: React.FC<PdfUploadProps> = ({ partNumber, onHide }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState('');
    let fileName:string;
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files ? event.target.files[0] : null;
        setFile(uploadedFile);
    };
    const nameCheck=()=> {
      const email = Cookies.get('email')
  if (email) {
    const extractedUsername = email.split('@')[0].toLowerCase()
    return extractedUsername
  }
  }
    const triggerConfetti = () => {
        confetti({
          particleCount: 300,
          spread: 360,
          startVelocity: 55,
          origin: { y: 0.75 },
        })
    
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 360,
            startVelocity: 65,
            origin: { y: 0.5 },
          })
        }, 50)
    
        setTimeout(() => {
          confetti({
            particleCount: 500,
            spread: 360,
            startVelocity: 75,
            origin: { y: 0.25 },
          })
        }, 100)
        setTimeout(() => {
          confetti({
            particleCount: 500,
            spread: 360,
            startVelocity: 85,
            origin: { y: 0 },
          })
        }, 150) // Delay the third confetti by 30ms
    
        if (navigator.vibrate) {
          // Trigger haptic feedback
          navigator.vibrate(50) // Vibrate for 50ms
        }
      }
  
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
        partNumber,
        origin: nameCheck()
    };
    
    const params: InvokeCommandInput = {
        FunctionName: 'boretec_upload_pdf',
        Payload: JSON.stringify(payload)
    };
    
    fileName = file.name;
        //console.log(payload);
      try {
          const command = new InvokeCommand(params);
          const response = await lambdaClient.send(command);
  
          const result = JSON.parse(new TextDecoder("utf-8").decode(response.Payload));
          console.log(result);
          if (result.statusCode === 200) {
              setUploadStatus('File uploaded successfully.');
              triggerConfetti();
              onHide(file.name);
              
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
  const hideComponent = (fileName:string) => {
    // Call the onHide function passed from the parent component
    onHide(fileName); // Correctly call the onHide prop with the file name
  };

  const subject = `Please upload the drawings for ${partNumber}`;
  const body = "Thanks.";
  const mailtoLink = `mailto:sam@boretec.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  
    return (
        <div className="text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm pb-10">
            <button className="pl-2" onClick={() => hideComponent(fileName)}>&larr;</button>
            <div className="justify-center items-center">
                <div>
            <p className="text-center text-lg w-full p-2">No documentation exists.</p>
            <div className="text-center w-full italic px-2 my-8"><a href={mailtoLink}>Click here to ask Sam to upload a file.</a></div>
            <p className="text-center w-full p-2">Note: there&apos;s a 6 mb limit.</p>
            <form className="p-2" onSubmit={handleSubmit}>
                <input type="file" accept=".pdf" onChange={handleFileChange} />
                <button className="rounded-sm bg-gray-800 text-white my-1 px-2 py-1" type="submit">Upload</button>
            </form>
            {uploadStatus && <p className="p-2">{uploadStatus}</p>}
            </div>
            </div>
        </div>
    );
  };

  export default PdfUpload;