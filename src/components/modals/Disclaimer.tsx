'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
//import { AWS } from "../AWSconfig";
import VideoRecorder from './VideoRecorder';
import SignaturePad from './Signature';
import Cookies from "js-cookie";

interface DisclaimerProps {

    email: string;
  }

const Disclaimer: React.FC<DisclaimerProps> = ({email}) => {
  const [ipAddress, setIpAddress] = useState<string>('');
  const [signatureConfirmation, setSignatureConfirmation] = useState(false);
  const [videoConfirmation, setVideoConfirmation] = useState(false);
  const [disclaimer, setDisclaimer] = useState(false);
  const date = new Date().toISOString();

  //const lambda = new AWS.Lambda();

  const fetchIpAddress = async () => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      setIpAddress(response.data.ip);
    } catch (error) {
      console.error('Error fetching IP address:', error);
    }
  };

  const updateUserDisclaimer = async () => {
    if (ipAddress !== "" && signatureConfirmation && videoConfirmation) {
    const params = {
      FunctionName: "insertDisclaimerInfo",
      Payload: JSON.stringify({email, ipAddress, date}),
    };
    console.log(params);
    try {
      /*const data = await lambda.invoke(params).promise();
      const responsePayload = JSON.parse(data.Payload as string);
      
      if (responsePayload.statusCode !== 200) {
        throw new Error(responsePayload);
      }*/
      
      setDisclaimer(true);

    } catch (error) {
      console.error("Error with the Lambda:", error);
      alert("Try that again. If the problem persists. Contact Randall.");
    }
  } else {
    alert("You need to submit both the signature and video to proceed.");
  }
  };

  useEffect(() => {
    Cookies.remove("disclaimer");
    fetchIpAddress();
  }, []);

  return (
    <div className="font-light mx-5 mt-5 mb-10">
        <div className="text-gray-900">
        <div className="flex items-center mb-10">
            <img
              src="https://boretec.com/images/boretecBlack.png"
              alt="logo"
              className="h-10 pr-2"
            ></img><h1 className="w-full text-center text-xl">Rental Disclaimer</h1>
            </div>
        
        <p className="">
          All the information on this website, including but not limited to texts, graphics, images, machine learning predictions, and other material, is provided for research purposes only and is not intended in any way to be financial advice or counsel. Always seek the guidance of a qualified financial advisor with any questions you may have regarding financial decisions. 
        </p>
  <p className="mt-2">
        The information on this website consists of publically available data and proprietary machine-learning predictions derived from such. The confirmation of the accuracy and/or veracity of both the data and the predictions is solely your responsbility. 
        </p>
        <p className="mt-2">
          Optima Holdings is not responsible for any actions or decisions made based on the information provided on this website. By using this website, you agree that Optima Holdings is not liable for any direct, indirect, incidental, consequential, or any other damages arising out of or in connection with your use of this website content.
        </p>
          <p className="mt-2 ">
          Additionally, you agree that you, and no one else, will have access to this information and or this website. You also understand that if it&apos;s uncovered that you are sharing access or information, your access will be revoked immediately without recompense.
        </p>
        </div>
      <div className="grid md:grid-cols-2 gap-4">

        <div className="m-2 text-black">


      <h3 className="mt-4 text-lg font-normal text-black">Video Recording Request</h3>
      <p className="mt-2">
      Please record a video stating the following:
      </p>
      <p className="mt-2 font-thin">
      I, [Your Name], understand that Optima Holdings is neither currently nor will be liable for any actions or decisions made on my behalf, and I agree to all terms set forth on this page as of {new Date().toString().slice(0,16)}.
      </p>

      <h3 className="mt-4 text-lg font-normal text-black">Signature Request</h3>
      <p className="mt-2">
        Please also submit your signature to indicate your understanding of and agreement to the terms set forth on this page.
      </p>
<div className="mt-5">
<p className="text-sm text-black">Your IP Address: {ipAddress}</p>
<p className="text-sm text-black">Your email address: {email}</p>

</div>
          

        </div>
        <div>
          <VideoRecorder setVideoUploaded={setVideoConfirmation} email={email}/>
          <div className="m-2">
        <SignaturePad setSignatureUploaded={setSignatureConfirmation} email={email}/>
        </div>
        </div>
      </div>
      <div className="mt-5 mx-2">
      {signatureConfirmation && videoConfirmation && !disclaimer && <button onClick={updateUserDisclaimer} className="w-full rounded-lg font-normal bg-teal-400 hover:bg-teal-500 text-slate-900 py-1 px-2">I agree to the terms</button>}
      {disclaimer && <a className="w-full bg-teal-300 text-slate-900 py-1 px-2 rounded-lg" href="/">You&apos;re all set. Click here to see today&apos;s trades.</a>}
      </div>
    </div>
  );
};

export default Disclaimer;