import React, { useState } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';
import confetti from 'canvas-confetti'
  
interface ShipConfirmationProps {
  invoiceNumber: string;
  onHide: () => void;
}

  const ShipConfirmation: React.FC<ShipConfirmationProps> = ({ invoiceNumber, onHide }) => {
    const [isVisible, setIsVisible] = useState(true); // Control the visibility of the component
    const [status, setStatus] = useState('confirmation'); // Control the display of confirmation or processing message
  
    const hideComponentConfirm = () => setIsVisible(false);
  
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


    const hideComponent = () => {
      // Call the onHide function passed from the parent component
      onHide();
    };
    const markShipped = async () => {
      setStatus('processing');
  
      const payload = {
        invoiceNumber,
        shippedDate: new Date(),
        status: 'shipped',

      }
      //console.log(payload);
      const params: InvokeCommandInput = {
        FunctionName: 'boretec_mark_shipped',
        Payload: JSON.stringify(payload),
      }

      try {
        const command = new InvokeCommand(params)
        const response = await lambdaClient.send(command)
        
        const result = JSON.parse(
          new TextDecoder('utf-8').decode(response.Payload as Uint8Array)
        )
        //console.log(result);
        // Check if the Lambda function returned status 200
        if (result.statusCode === 200) {
       
          //console.log('Lambda function succeeded', payload);
          triggerConfetti();
          setTimeout(() => {
            hideComponentConfirm();
          }, 1000)
          
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
      <div id={`confirm-${invoiceNumber}`} className="text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm flex items-center justify-center">
        <div className="w-full p-5">
          <p className={`confirmation text-center ${status !== 'confirmation' ? 'hidden' : ''}`}>
            Are you sure you want mark invoice&nbsp;<span className="font-bold">{invoiceNumber}</span> as shipped?
          </p>
          <div className={`buttons flex justify-center items-center mt-5 ${status !== 'confirmation' ? 'hidden' : ''}`}>
            <button className="bg-gray-200 text-black hover:bg-gray-300 text-center m-1 py-1 flex-grow rounded-lg" onClick={hideComponent}>No</button>
            <button className="bg-gray-700 text-white hover:bg-black text-center py-1 m-1 flex-grow rounded-lg" onClick={markShipped}>Yes</button>
          </div>
          <p className={`processing ${status !== 'processing' ? 'hidden' : ''} text-center`}>
            Processing...{invoiceNumber}
          </p>
        </div>
      </div>
    );
  };

  export default ShipConfirmation