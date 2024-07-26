import { InvokeCommand } from "@aws-sdk/client-lambda";
import { lambdaClient } from "../lib/amazon"; // Ensure you have a configured Lambda client
import { useRouter } from "next/router";

  export const fetchAccessToken = async () => {

    const params = {
      FunctionName: "fetchAccessToken",
      Payload: JSON.stringify({}),
    };
  
    
    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);
  
      // Parse the Payload to get the application-level response
      const applicationResponse = JSON.parse(
        new TextDecoder().decode(response.Payload)
      );
  
      //console.log("Application response:", applicationResponse);
  
      if (applicationResponse.statusCode === 200) {

        //console.log(`Failed to save QBO token:  ${applicationResponse.accessToken}`);
        return applicationResponse.accessToken;
      }
      else {
        return null;
      }
    } catch (error) {
    
      console.log("Error invoking Lambda function:", error);
      return null;
    }
  };


