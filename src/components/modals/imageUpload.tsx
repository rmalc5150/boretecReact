// ImageUpload.tsx

import React, { useState } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

const ImageUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files ? event.target.files[0] : null;
        setFile(uploadedFile);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!file) {
            alert('Please select an image to upload.');
            return;
        }

        const fileContent = await file.arrayBuffer();
        const payload = {
            fileName: file.name,
            fileContent: Buffer.from(fileContent).toString('base64')
        };

        const params: InvokeCommandInput = {
            FunctionName: 'YourLambdaFunctionForImageUpload',
            Payload: JSON.stringify(payload)
        };

        try {
            const command = new InvokeCommand(params);
            const response = await lambdaClient.send(command);
            const result = JSON.parse(new TextDecoder("utf-8").decode(response.Payload as Uint8Array));

            if (result.statusCode === 200) {
                setUploadStatus('Image uploaded successfully.');
            } else {
                setUploadStatus('Failed to upload the image.');
            }
        } catch (error) {
            console.error('Error invoking Lambda function', error);
            setUploadStatus('Error invoking Lambda function');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button type="submit">Upload Image</button>
            </form>
            {uploadStatus && <p>{uploadStatus}</p>}
        </div>
    );
};

export default ImageUpload;
