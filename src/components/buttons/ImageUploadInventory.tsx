import React, { useRef, useState } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';
import imageCompression from 'browser-image-compression';

interface ImageUploadInventoryProps {
    partNumber: string;
    setUnsavedChanges: (changed: boolean) => void;
    setCurrentImageUrl: (imageUrl: string) => void;
    handleSave: ()=>void;
}

const ImageUploadInventory: React.FC<ImageUploadInventoryProps> = ({
    partNumber,
    setCurrentImageUrl,
    setUnsavedChanges,
    handleSave
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [buttonLabel, setButtonLabel] = useState('Update Image');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFileBase64, setSelectedFileBase64] = useState<string | null>(null);

    const prepareImageForUpload = async (file: File) => {
        // Compression options
        const options = {
            maxSizeMB: 5, // Max size in MB
            maxWidthOrHeight: 1920, // Compress with a max width/height
            useWebWorker: true, // Use web worker for better performance
        };

        try {
            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedFileBase64(reader.result as string);
                setButtonLabel('Upload');
                const imagesContainer = document.getElementById(`images-${partNumber}`);
                if (imagesContainer) {
                    let imgTag = imagesContainer.querySelector('img');
                    if (!imgTag) {
                        imgTag = document.createElement('img');
                        imagesContainer.appendChild(imgTag);
                    }
                    imgTag.src = reader.result as string;
                }
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error('Error during image compression', error);
        }
    };

    const uploadFile = async () => {
        setIsUploading(true);
        
        const payload = {
            fileContent: selectedFileBase64?.split(',')[1], // Remove the data URL part
            partNumber,
        };

        const params: InvokeCommandInput = {
            FunctionName: 'boretec_upload_image',
            Payload: JSON.stringify(payload),
        };

        try {
            const command = new InvokeCommand(params);
            const response = await lambdaClient.send(command);
            const result = JSON.parse(new TextDecoder('utf-8').decode(response.Payload as Uint8Array));
            //console.log(payload);
            if (result.statusCode === 200) {
                setCurrentImageUrl(result.url);
                setUnsavedChanges(true); 
                //handleSave();
            } else {
                alert("Image didn't upload");
            }
        } catch (error) {
            console.error('Error invoking Lambda function', error);
            alert("Image didn't save to database.");
        } finally {
            setIsUploading(false);
            setButtonLabel(`Replace Image`); // Reset the button label
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            prepareImageForUpload(file);
        }
    };

    const handleButtonClick = () => {
        if (buttonLabel === 'Upload') {
            uploadFile();
        } else {
            fileInputRef.current?.click();
            setUnsavedChanges(true); // Assuming intention to change is a unsaved change
        }
    };

    const reTake = () => {

            fileInputRef.current?.click();
            setUnsavedChanges(true); // Assuming intention to change is a unsaved change
      
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
            {buttonLabel === "Upload" && (
            <button
                onClick={reTake}
                disabled={isUploading}
                className="text-blue-600 bg-blue-100 w-full py-1 px-2"
            >
                Retake
            </button>)}
            <button
                onClick={handleButtonClick}
                disabled={isUploading}
                className={`${buttonLabel === "Upload" ? "bg-blue-600 text-white" : "text-blue-600 bg-blue-100"} ${buttonLabel !== "Replace Image" ? "rounded-bl-lg" : ""} w-full py-1 px-2`}
            >
                {isUploading ? 'Uploading...' : buttonLabel}
            </button>
            {buttonLabel === "Replace Image" && (
                <button
                            onClick={handleSave}
                            
                            className="bg-blue-600 text-white rounded-bl-lg w-full py-1 px-2"
                        >
                            Save
                        </button>
            )}
        </div>
    );
};

export default ImageUploadInventory;
