"use client"
import React, { useState } from 'react';
import { InvokeCommand, InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';
import confetti from 'canvas-confetti'



const CsvUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files ? event.target.files[0] : null;
        setFile(uploadedFile);
    };

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
            alert('Please select a CSV file to upload.');
            return;
        }
        setUploadStatus(`Uploading...`);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileContent = e.target?.result;
            const base64Content = Buffer.from(fileContent as ArrayBuffer).toString('base64');

            const payload = {
                csvContent: base64Content,
            };

            const params: InvokeCommandInput = {
                FunctionName: 'boretec_inventory_bulkInsert', // Update this to your Lambda function's name
                Payload: JSON.stringify(payload),
            };

            try {
                const command = new InvokeCommand(params);
                const response = await lambdaClient.send(command);

                const result = JSON.parse(new TextDecoder("utf-8").decode(response.Payload));
                console.log(result);
                if (result.statusCode === 200) {
                    triggerConfetti();
                    setUploadStatus(`CSV uploaded successfully. Skipped partNumbers: ${result.skipped}`);
                } else {
                    const errorMessage = result.body || 'Failed to upload the CSV.';
                    setUploadStatus(errorMessage);
                }
            } catch (error) {
                console.error('Error invoking Lambda function', error);
                setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="p-4">
            <h1 className="mb-4 text-xl text-center">Bulk Upload</h1>
            <div className="flex justify-center items-center mt-10">
            <form onSubmit={handleSubmit} className="flex justify-center items-center">
                <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gray-200 file:text-black
                  hover:file:bg-black hover:file:text-white"/>
                <button type="submit" className="px-4 py-1 bg-black text-white border border-transparent rounded-md hover:bg-white hover:text-black hover:border-black">Upload</button>
            </form>
            
            </div>
            {uploadStatus && <div className="mt-4 text-sm text-gray-600 mx-1 overflow-wrap break-words">{uploadStatus}</div>}
            <div className="mt-5">
        <p className="px-2 text-center mt-10 font-semibold text-gray-900">The csv column names must match the database column names.</p>
        <div className="flex flex-wrap mt-5">
        <p className="px-2 m-1 text-center text-sm text-gray-50 bg-gray-400 rounded-lg">
        partNumber
    </p>
    <p className="px-2 m-1 text-center text-sm text-gray-50 bg-gray-400 rounded-lg">
    bulkId
    </p>
    <p className="px-2 m-1 text-center text-sm text-gray-50 bg-gray-400 rounded-lg">
        type
    </p>
    <p className="px-2 m-1 text-center text-sm text-gray-50 bg-gray-400 rounded-lg">
    category
    </p>
    <p className="px-2 m-1 text-center text-sm text-gray-50 bg-gray-400 rounded-lg">
    publicFacing
    </p>
    <p className="px-2 m-1 text-center text-sm text-gray-50 bg-gray-400 rounded-lg">
    description
    </p>
    <p className="px-2 m-1 text-center text-sm text-gray-50 bg-gray-400 rounded-lg">
    name
    </p>
  {[
    "vName", "vUrl", "vPartNumber", "vLeadTime", "vPaymentMethod",
    "quantity",
    "leadTime",
    "partsUrl",
    "cost",
    "retailPrice",
    "location",
    "weight",
    "parLevel",
    "docFileName",
    "images",
    "manufacturer",
    "manufactPartNum",
    "partsInStock",
  ].map((value, index) => (
    <p key={index} className="px-2 m-1 text-center text-sm text-gray-900 bg-gray-200 rounded-lg">
      {value}
    </p>
  ))}

</div>

        </div>
        <div className="flex justify-center text-sm text-gray-700 px-2">
        <div className="mt-5">
        <p className="font-semibold">Required columns:</p>
        <p className="mt-2"><span className="px-2 py-px text-center text-gray-50 bg-gray-400 rounded-lg">partNumber</span> must be a unique combination of text and numbers.</p>
        <p className="mt-2"><span className="px-2 py-px text-center text-gray-50 bg-gray-400 rounded-lg">name</span> is the public-facing description.</p> 
        <p className="mt-2"><span className="px-2 py-px text-center text-gray-50 bg-gray-400 rounded-lg">description</span> is the internal description.</p> 
        <p className="mt-2"><span className="px-2 py-px text-center text-gray-50 bg-gray-400 rounded-lg">retailPrice</span> is how much the public will pay for this item.</p> 

        <p className="mt-2"><span className="px-2 py-px text-center text-gray-50 bg-gray-400 rounded-lg">builkId</span> should be a never-used-before unique combination of text and numbers. It&apos;s best to use the date and a short descrption of what you&apos;re uploading. (MMDDYYExampleUpload)</p>
        <p className="mt-2">Options for <span className="px-2 py-px text-center text-gray-50 bg-gray-400 rounded-lg">type</span>: &apos;build&apos; or &apos;buy&apos;</p>

       
        <p className="mt-2">Options for <span className="px-2 py-px text-center text-gray-50 bg-gray-400 rounded-lg">category</span>: &apos;Part&apos;,
    &apos;Steering Head&apos;,
    &apos;Steering System&apos;,
    &apos;Steering Station&apos;,
    &apos;Boring Machine&apos;,
    &apos;Cutting Head&apos;,
    &apos;Auger&apos;</p>
        <p className="mt-2">Options for <span className="px-2 py-px text-center text-gray-50 bg-gray-400 rounded-lg">publicFacing</span>: &apos;yes&apos; or &apos;no&apos;</p>

        <p className="mt-5 font-semibold">Notes:</p>
        <p className="mt-2">The order of the columns in the csv does not matter.</p> 
        <p className="mt-2">You can only enter one vender for each item. These are the <span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">vName</span>, <span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">vUrl</span>, <span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">vPartNumber</span>, <span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">vLeadTime</span>, and <span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">vPaymentMethod</span> fields. </p> 
        <p className="mt-2"><span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">name</span> is the public-facing description.</p> 
        <p className="mt-2"><span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">description</span> is the internal description.</p>
        <p className="mt-2"><span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">quantity</span> <span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">cost</span> <span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">leadTime</span> <span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">retailPrice</span> <span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">weight</span> and <span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">parLevel</span> can only be numbers.</p>
        <p className="mt-2"><span className="px-2 py-px text-center text-gray-900 bg-gray-200 rounded-lg">partsInStock</span> is for &apos;builds&apos; only and indicates if we want to keep those parts in stock. Use &apos;yes&apos; or &apos;no&apos; for this column.</p>
        </div>
        </div>
        </div>

    );
};

export default CsvUpload;
