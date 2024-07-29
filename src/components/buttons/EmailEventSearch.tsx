import React, { useState, useEffect } from 'react';
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

// Define the props interface
interface EstimateSearchProps {
  emailId: string;
  isMobile: boolean;
}

// Define the estimate interface
interface EmailEvent {
  email: string;
  url: string;
  event: string;
  timestamp: string;
  id: number;
}

const EstimateSearch: React.FC<EstimateSearchProps> = ({ emailId, isMobile }) => {
  // Type the estimates state with the Estimate interface
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEstimates = async () => {
    setIsLoading(true);
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_emailEventSearch',
      Payload: JSON.stringify({ emailId }),
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);

      const payloadString = new TextDecoder().decode(response.Payload);
      const payloadObject = JSON.parse(payloadString);
      //console.log(payloadObject);
      if (payloadObject) {
        setIsLoading(false);
        setEvents(payloadObject);
      } else {
        alert(`Error: ${payloadObject}`);
      }
    } catch (error) {
      console.error('Error fetching estimates', error);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [emailId]);

  return (
    <div>
    {isLoading && <p className="animate-pulse">Loading...</p>}
    {events.length > 0 ? (

          
      <div className="text-center">
        {events.map((event) => (    
      <div className="border-t border-gray-300 grid md:grid-cols-4 grid-cols-2 py-1 px-2">
  
            <p>{event.timestamp}</p>
            <p>{event.event}</p>
            {!isMobile && <p>{event.email}</p>}
            {!isMobile && <div>
              {event.url.includes("intuit") && <p>invoice link</p>}
              {event.url.includes("boretec") && <p>Boretec link</p>}
              
              </div>}
          </div>

    
     

    ))}
     </div>
  ): (<p className="p-1 text-center border-t border-gray-300 bg-white">No recent estimates.</p>)}
    </div>
  );
};

export default EstimateSearch;
