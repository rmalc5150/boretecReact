import React, {useState } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

interface CancelReturnConfirmationOrder {
  dateCreated: string;
  updatedStatus: string;
  editor: string | undefined;
  onHide: () => void;
}

  const CancelReturnConfirmation: React.FC<CancelReturnConfirmationOrder> = ({ updatedStatus, dateCreated, editor, onHide }) => {
    const [isVisible, setIsVisible] = useState(true); // Control the visibility of the component
    const [status, setStatus] = useState('confirmation'); // Control the display of confirmation or processing message

  
    const hideComponentConfirm = () => setIsVisible(false);
  


    const newTime = () => {
      const dateTimeArray = new Date()
      return dateTimeArray
    }

    const hideComponent = () => {
      // Call the onHide function passed from the parent component
      onHide();
    };
    const markAsCanceledReturned = async () => {
      setStatus('processing')
      try {
        const payload = {
          dateCreated,
          updatedStatus,
          dateEdited: newTime(),
          editor: editor || "HAL",
        }
        //console.log(payload)
        const params: InvokeCommandInput = {
          FunctionName: 'boretec_canceled_returned_buttons',
          Payload: JSON.stringify(payload),
        }
  
        const command = new InvokeCommand(params)
        const response = await lambdaClient.send(command)
  
        const applicationResponse = JSON.parse(
          new TextDecoder().decode(response.Payload)
        )
        //console.log(applicationResponse)
  
        if (applicationResponse.status === 200) {
          //console.log('Update successful.')
          window.location.reload()
        } else if (applicationResponse.status === 500) {
          const responseBody = JSON.parse(applicationResponse.body)
          alert("Item didn't update" + responseBody.error)
          console.error('Update failed.', applicationResponse)
          setStatus('confirmation')
        }
      } catch (error) {
        console.error('Error invoking Lambda function', error)
        alert("Item didn't update" + error)
        setStatus('confirmation')
      }
    }
  
    if (!isVisible) return null;
  
    return (
      <div className="text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm flex items-center justify-center w-full p-5">
       {status === 'confirmation' && <div>
          <p className={`confirmation text-center`}>
            Are you sure you want to {updatedStatus === 'canceled' ? "cancel" : "return"} this order?
          </p>

          
          <div className={`buttons flex justify-center items-center mt-5`}>
            
            <button className="bg-gray-200 text-black hover:bg-gray-300 text-center m-1 py-1 flex-grow px-2 rounded-lg" onClick={hideComponent}>Close</button>

            <button className="bg-gray-700 text-white hover:bg-black text-center py-1 m-1 px-2 flex-grow rounded-lg" onClick={markAsCanceledReturned}>Yes</button>
            
          </div>
          
          </div>}
          {status === 'processing' && <p className={`text-center`}>
            Processing...
          </p>}
        
      </div>
    );
  };

  export default CancelReturnConfirmation