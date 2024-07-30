import React, { useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'


interface ResendLinkComponentProps {
  emails: string
  link: string
  invoiceNumber: string
  onHide: () => void
  displayName: string
}

const ResendLinkComponent: React.FC<ResendLinkComponentProps> = ({
  emails,
  link,
  invoiceNumber,
  displayName,
  onHide
}) => {
  const [addingEmail, setAddingEmail] = useState('') 
  const [status, setStatus] = useState('confirmation') // Control the display of confirmation or processing message
  const emailsToArray = (emailString: string): string[] => {
    return emailString.split(',').map(email => email.trim())
  }
  const [sendToEmails, setSendToEmails] = useState<string[]>(emailsToArray(emails))

  const hideComponent = () => {
    onHide()
  }

  const sendEmail = async () => {
    if (sendToEmails.length <= 0) {
      alert('You have to have include at least one email addess.')
    return
    } 


    setStatus('processing')

    const payload = {
      link,
      sendToEmails,
      invoiceNumber,
      displayName
    }

    //console.log(payload);
    const params: InvokeCommandInput = {
      FunctionName: 'resendInvoiceEmailSendGrid',
      Payload: JSON.stringify(payload),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)

      const result = JSON.parse(
        new TextDecoder('utf-8').decode(response.Payload as Uint8Array)
      )

      if (result.status === 200) {
        
   
        onHide();
        // Perform any other actions needed on success
      } else {
        alert(`Something went wrong: ${result.error}`)
        setStatus('confirmation')
      }
    } catch (error) {
      console.error('Error calling Lambda function', error)
      alert('Something went wrong')
      setStatus('confirmation')
    }
  }


  const addEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Invalid email address')
      return
    }
    setSendToEmails([...sendToEmails, email])
    setAddingEmail('')
  }

  const removeEmail = (index: number) => {
    setSendToEmails(sendToEmails.filter((_, i) => i !== index))
  }



  return (
    <div className="text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm p-5">
            <div>
              <p>Resend to these email addresses: <span className="text-xs">(Click an email below to remove it)</span></p>
             <div className="space-y-2 p-1">
            {sendToEmails.map((email, index) => (
          <div key={index} className="bg-gray-100 py-1 px-2 rounded-lg" onClick={() => removeEmail(index)}>
            {email}
          </div>
        ))}
        </div>
            <div className ="flex items-center justify-center ">
      <input
          type="text"
          placeholder="Add email"
          value={addingEmail}
          onChange={(e)=>setAddingEmail(e.target.value)}
          className="text-black hover:border-gray-400 border border-gray-300 text-center m-1 py-1 flex-grow px-2 rounded-lg"
        />
        <button className={`${addingEmail !== "" ? "bg-gray-700 text-white hover:bg-gray-800 rounded-lg" : ""} px-2 py-1`} onClick={()=>addEmail(addingEmail)}>Add Email</button>
        </div>
        

      </div>
      
      <div className="flex space-x-2 mt-10">

        <button
          className="bg-gray-700 text-white hover:bg-gray-800 text-center m-1 py-1 flex-grow px-2 rounded-lg"
          onClick={sendEmail}
        >
          Resend Link
        </button>
        <button
          className="bg-gray-200 text-black hover:bg-gray-300 text-center m-1 py-1 flex-grow px-2 rounded-lg"
          onClick={hideComponent}
        >
          Close
        </button>
      </div>
      <p className="mt-5 font-semibold text-center px-2">Note: Resending the link will reset the delivery details.</p>

    </div>
  )
}

export default ResendLinkComponent