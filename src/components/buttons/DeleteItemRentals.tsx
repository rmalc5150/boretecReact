import React, { useState } from 'react';



interface PdfUploadProps {
    partNumber: string;
    onDelete: () => void;
    onHideDelete: () => void;

}

const PdfUpload: React.FC<PdfUploadProps> = ({ partNumber, onDelete, onHideDelete }) => {
  const [uploadStatus, setUploadStatus] = useState('');

  
    const removeItem = async () => {
      
    
    setUploadStatus('Removing Item...');
      
            onDelete();
              
          
  };


  
    return (
        <div className="text-white text-center bg-rose-600 rounded-lg overflow-hidden lg:text-sm p-10">
   

        <p className="mb-2 mx-1 text-xl">{`Are you sure you want to remove ${partNumber}?`}</p>


        <div className="flex justify-between">
          <button
            className="flex-1 bg-rose-200 py-1 px-2 mx-1 rounded-lg text-rose-600 hover:bg-transparent hover:bg-white"
            onClick={onHideDelete}
            id="confirmBtn">No</button>
          <button 
            className="flex-1 bg-rose-900 text-white py-1 px-2 mx-1 rounded-lg hover:bg-black"
            onClick={removeItem}
            id="cancelBtn">Yes</button>
        </div>
        {uploadStatus && <p className="py-5">{uploadStatus}</p>}
      </div>
 
 

    );
  };

  export default PdfUpload;