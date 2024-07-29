import { NextApiRequest, NextApiResponse } from 'next';
import { InvokeCommand, InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../src/lib/amazon'; // Adjust the import based on your project structure
import { TextDecoder } from 'util';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const eventPayload = req.body;

  if (!eventPayload) {
    return res.status(400).json({ error: 'Event payload is required' });
  }

  try {
    const invokeLambdaFunction = async (payload: any) => {
      const params: InvokeCommandInput = {
        FunctionName: 'saveQboEvents', // Replace with your Lambda function name
        Payload: JSON.stringify(payload),
      };

      try {
        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);
        const payloadString = new TextDecoder().decode(response.Payload);
        const payloadObject = JSON.parse(payloadString);

        if (payloadObject.statusCode !== 200) {
          throw new Error('Error processing event in AWS Lambda');
        }
      } catch (error) {
        throw new Error('Error invoking Lambda function');
      }
    };

    // Invoke the Lambda function with the event payload
    await invokeLambdaFunction(eventPayload);

    res.status(200).json({ message: 'Event processed successfully' });
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).json({ error: 'Error processing event' });
  }
};