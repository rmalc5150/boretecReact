import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
//import { AWS } from "../AWSconfig"; // Adjust the import path based on your project structure


const SignaturePad: React.FC<{ setSignatureUploaded: (value: boolean) => void, email: string }> = ({ setSignatureUploaded, email }) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setUploadSuccess(false);
  };

  const saveSignature = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }

    setUploading(true);

    const dataURL = sigCanvas.current.toDataURL('image/png');
    const blob = await (await fetch(dataURL)).blob();
    const file = new File([blob], 'signature.png', { type: 'image/png' });

    // Configure AWS S3
    //const s3 = new AWS.S3();
    const date = new Date().toISOString();
    const params = {
      Bucket: 'optimatrade-recordings',
      Key: `signatures/${email}-${date}.png`,
      Body: file,
      ContentType: 'image/png'
    };

    try {
      //await s3.upload(params).promise();
      setUploadSuccess(true);
      setSignatureUploaded(true);
      console.log('Signature uploaded successfully!');
    } catch (error) {
      console.error('Error uploading signature:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>

      {uploadSuccess ? (
        <div className="text-gray-900 font-light">
          <p>Signature uploaded successfully!</p>

        </div>
      ) : (
        <>
          {uploading ? (
            <div className="text-center animate-pulse">Uploading...</div>
          ) : (
            <>
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{className: 'sigCanvas w-full h-40 bg-gray-200 rounded-lg' }}
              />
              <div className="text-slate-900 space-x-1 flex font-normal mt-1">
                <button className="rounded-lg bg-rose-400 hover:bg-rose-500 py-1 px-2" onClick={clearSignature}>Clear</button>
                <button className="rounded-lg bg-teal-500 hover:bg-teal-600 py-1 px-2 flex-grow" onClick={saveSignature}>Save Signature</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SignaturePad;