import React, { useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import Cookies from 'js-cookie'
import DatePicker from 'react-datepicker';

interface AddToToOrderListProps {
  description: string
  partNumber: string
  images: string
  vendors: string
  location: string
  cost: number
  manufactPartNum: string
  manufacturer: string
  onHide: () => void
}

const AddToToOrderList: React.FC<AddToToOrderListProps> = ({
  partNumber,
  description,
  images,
  location,
  vendors,
  cost,
  manufactPartNum,
  manufacturer,
  onHide,
}) => {

  const [status, setStatus] = useState('confirmation') // Control the display of confirmation or processing message
  const [quantity, setQuantity] = useState(1) // Control the display of confirmation or processing message
  const [dateNeeded, setDateNeeded] = useState<Date | null>(new Date());



  const newTime = () => {
    const dateTimeArray = new Date()
    return dateTimeArray
  }

  const nameCheck = () => {
    const email = Cookies.get('email')
    if (email) {
      const extractedUsername = email.split('@')[0].toLowerCase()
      return extractedUsername
    }
  }

  const hideComponent = () => {
    // Call the onHide function passed from the parent component
    onHide()
  }
  const addQuantity = async () => {
    

    if (quantity < 1) {
      alert("Quantity must be at least 1.")
      return
    }
    setStatus('processing')
    const payload = {
      partNumber,
      quantity,
      dateCreated: newTime(),
      dateNeeded,
      imageUrl: images,
      origin: nameCheck(),
      vendors,
      internalDescription: description,
      partLocation: location,
      cost,
      manufactPartNum,
      manufacturer,
    }
    //console.log(payload);
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_insert_toOrder',
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
        setStatus('added')
        setTimeout(() => {
          hideComponent()
          // Place any additional actions you want to perform after the delay inside this block
        }, 1500)
        // Here you can update state or perform actions based on successful Lambda execution
      } else {
        // If status is not 200 or 'success', show an error and revert state
        alert(`Something went wrong: ${result.body}`)
        setStatus('confirmation')
      }
    } catch (error) {
      console.error('Error calling Lambda function', error)
      alert('Something went wrong')
      setStatus('confirmation') // Revert to confirmation state on error
    }
  }



  return (
    <div>
      {status === 'processing' && (
        <div className="w-full h-96 flex justify-center items-center text-white font-medium bg-blue-600 rounded-lg">
          <p className="animate-pulse">Adding to Order List</p>
        </div>
      )}
      {status === 'added' && (
        <div className="w-full h-96 flex justify-center items-center text-white text-lg font-medium bg-blue-600 rounded-lg">
          <p className="">Added</p>
        </div>
      )}
      {status === 'confirmation' && (
        <div
          id={`confirm-${partNumber}`}
          className="flex flex-col justify-between h-96 text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm"
        >
          <div className="">
            <div className="flex justify-center my-4">
              <img
                className="h-20 rounded-lg"
                src={images}
                alt="product picture"
              />
              <div className="m-1">
                <p className="font-bold">{partNumber}</p>
                <p className="">{description}</p>
              </div>
            </div>
          </div>
          <div className="">
            <p className="px-2 text-center font-medium text-lg">
              How many would you like to order?
            </p>
            <div className="flex justify-center mt-2">
              <div>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.round(Number(e.target.value)))} // Fix applied here
                  className="text-center m-1 p-1 flex-grow rounded-lg border border-gray-300" 
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div>
            <p className="px-2 text-center font-medium text-lg">
              When do we need this?
            </p>
          <DatePicker
            selected={dateNeeded}
            onChange={setDateNeeded}
            dateFormat="MM-dd-yy" // Customize the date format
            className={`text-center px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 border border-gray-300 w-full`} // Apply Tailwind or custom styling here
            wrapperClassName="date-picker" // Wrapper class for additional styling
            popperPlacement="top-end" // Customize the popper placement
          />
          </div>
          </div>
          <div className="">
            <div className="buttons flex justify-center items-center m-2">
              <button
                className="bg-gray-200 text-black hover:bg-gray-300 text-center m-1 py-1 flex-grow rounded-md"
                onClick={hideComponent}
              >
                Close
              </button>
              <button
                className="bg-gray-700 text-white hover:bg-black text-center py-1 m-1 flex-grow rounded-md"
                onClick={addQuantity}
              >
                Add to Order List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddToToOrderList
