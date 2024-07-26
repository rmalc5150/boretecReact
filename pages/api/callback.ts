//..pages/api/callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from '../../src/services/authService';
import { Token } from '../../src/types/Token';
import axios from 'axios';
import Cookies from 'cookies';
import { InvokeCommand, type InvokeCommandInput } from "@aws-sdk/client-lambda";
import { lambdaClient } from "../../src/lib/amazon";


export default async (req: NextApiRequest, res: NextApiResponse) => {
  const authCode = req.query.code as string;


  if (!authCode) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const tokens: Token = await getToken(authCode);

    const invokeLambdaFunction = async () => {

      const params: InvokeCommandInput = {
        FunctionName: "insertRefreshToken",
        Payload: JSON.stringify({ refreshToken: tokens.refreshToken }),
      };
      //console.log(payload);
      try {
        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);
        const payloadString = new TextDecoder().decode(response.Payload);
        const payloadObject = JSON.parse(payloadString);
        if (payloadObject.statusCode !==200){
          throw new Error('Error storing tokens in AWS');
        }
      } catch (error) {
        throw new Error("Error invoking Lambda function");
      }
    };
   // Invoke the Lambda function
   await invokeLambdaFunction();

    // Initialize Cookies instance
    const cookies = new Cookies(req, res);
    
    // Set tokens as cookies with relaxed options for local development
    cookies.set('accessToken', tokens.accessToken, { httpOnly: false, secure: false });
    cookies.set('refreshToken', tokens.refreshToken, { httpOnly: false, secure: false });

    res.writeHead(302, { Location: '/sales' });
    res.end();

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error in callback endpoint:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Error fetching token', details: error.response ? error.response.data : error.message });
    } else {
      console.error('Unexpected error in callback endpoint:', error);
      res.status(500).json({ error: 'Unexpected error fetching token' });
    }
  }
};