import { LambdaClient } from "@aws-sdk/client-lambda";

export const lambdaClient = new LambdaClient({
    region: 'us-east-1',
    apiVersion: "latest",
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY as string,
    },
});