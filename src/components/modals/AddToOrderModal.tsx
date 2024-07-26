import React from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

interface AddToOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  partNumber: string;
  description: string;
}

const AddToOrderModal: React.FC<AddToOrderModalProps> = ({ isOpen, onClose, partNumber, description }) => {
  
  const handleConfirm = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_add_item_toOrder',
      Payload: JSON.stringify({ partNumber })
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
      console.log('Response from Lambda:', response);
      onClose(); // Close modal after invoking lambda
    } catch (error) {
      console.error('Error invoking Lambda function', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="justify-center items-center h-screen w-full z-50 text-black fixed top-0 left-0 bg-gray-900 bg-opacity-75">
      <div className="bg-white p-5 m-auto">
        <p className="mb-2 mx-1 text-xl">{`Are you sure you want to order ${partNumber}?`}</p>
        <p className="mb-5 mx-1 text-lg">{description}</p>

        <div className="flex justify-between">
          <button
            className="flex-1 bg-black border-transparent border py-1 px-2 mx-1 rounded-lg text-white hover:bg-transparent hover:text-black hover:border-black"
            onClick={handleConfirm}
            id="confirmBtn">Yes</button>
          <button 
            className="flex-1 bg-gray-200 py-1 px-2 mx-1 rounded-lg hover:bg-gray-300"
            onClick={onClose}
            id="cancelBtn">No</button>
        </div>
      </div>
    </div>
  );
};

export default AddToOrderModal;
