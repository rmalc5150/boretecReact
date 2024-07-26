import React, { useRef, useState } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

  
interface IgnoreConfirmationProps {
  quantityPartsLocation: string;
  onHide: () => void;
}

  const IgnoreConfirmation: React.FC<IgnoreConfirmationProps> = ({ quantityPartsLocation, onHide }) => {
    const [isVisible, setIsVisible] = useState(true); // Control the visibility of the component
    const [status, setStatus] = useState('confirmation'); // Control the display of confirmation or processing message
  
    const hideComponentConfirm = () => setIsVisible(false);
  
    


    const hideComponent = () => {
      // Call the onHide function passed from the parent component
      onHide();
    };
    const markShipped = async () => {
      setStatus('processing');
  
      const payload = {
        quantityPartsLocation,
        'status': 'shipped'
      }
      //console.log(payload);
      const params: InvokeCommandInput = {
        FunctionName: 'boretec_update_toShip',
        Payload: JSON.stringify(payload),
      }

      try {
        //const command = new InvokeCommand(params)
        //const response = await lambdaClient.send(command)
        const result= 200;
        /*const result = JSON.parse(
          new TextDecoder('utf-8').decode(response.Payload as Uint8Array)
        )*/
        // Check if the Lambda function returned status 200
        //if (result.StatusCode === 200) {
          if (result === 200) {
          console.log('Lambda function succeeded', payload);
     
          hideComponentConfirm();
          // Here you can update state or perform actions based on successful Lambda execution
        } else {
          // If status is not 200 or 'success', show an error and revert state
          alert("Something went wrong");
          setStatus('confirmation');
        }
      } catch (error) {
        console.error('Error calling Lambda function', error);
        alert("Something went wrong");
        setStatus('confirmation'); // Revert to confirmation state on error
      }
    };
  
    if (!isVisible) return null;
  
    return (
      <div id={`confirm-${quantityPartsLocation}`} className="text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm flex items-center justify-center">
        <div className="w-full p-5">
          <p className={`confirmation text-center ${status !== 'confirmation' ? 'hidden' : ''}`}>
            Are you sure you want to ignore this build:&nbsp;<span className="font-bold">{quantityPartsLocation}</span>?
          </p>
          <div className={`buttons flex justify-center items-center mt-5 ${status !== 'confirmation' ? 'hidden' : ''}`}>
            <button className="bg-gray-200 text-black hover:bg-gray-300 text-center m-1 py-1 flex-grow rounded-lg" onClick={hideComponent}>No</button>
            <button className="bg-gray-700 text-white hover:bg-black text-center py-1 m-1 flex-grow rounded-lg" onClick={markShipped}>Yes</button>
          </div>
          <p className={`processing ${status !== 'processing' ? 'hidden' : ''} text-center`}>
            Processing...{quantityPartsLocation}
          </p>
        </div>
      </div>
    );
  };

  export default IgnoreConfirmation