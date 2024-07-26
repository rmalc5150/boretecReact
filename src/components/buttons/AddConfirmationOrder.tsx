import React, { useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import confetti from 'canvas-confetti'

interface AddConfirmationProps {
  quantity: number
  dateCreated: string
  partNumber: string
  cost: number
  onHide: () => void
}

const AddConfirmation: React.FC<AddConfirmationProps> = ({
  partNumber,
  quantity,
  dateCreated,
  cost,
  onHide,
}) => {
  const [isVisible, setIsVisible] = useState(true) // Control the visibility of the component
  const [status, setStatus] = useState('confirmation') // Control the display of confirmation or processing message
  const [addQuant, setQuantity] = useState(quantity) // Control the visibility of the component

  const hideComponentConfirm = () => setIsVisible(false)

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

  const newTime = () => {
    const dateTimeArray = new Date()
    return dateTimeArray
  }

  const hideComponent = () => {
    // Call the onHide function passed from the parent component
    onHide()
  }
  const addQuantity = async (state: boolean) => {
    setStatus('processing')

    const payload = {
      partNumber,
      dateCreated,
      cost,
      addQuantity: addQuant,
      date: newTime(),
      close: state,
      type: 'order',
    }
    console.log(payload)
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_add_to_inventory',
      Payload: JSON.stringify(payload),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)

      const result = JSON.parse(
        new TextDecoder('utf-8').decode(response.Payload as Uint8Array)
      )
      console.log(result)
      // Check if the Lambda function returned status 200
      if (result.status === 200) {
        triggerConfetti()
        window.location.reload()

        // Here you can update state or perform actions based on successful Lambda execution
      } else {
        // If status is not 200 or 'success', show an error and revert state
        alert(`Something went wrong: ${result.error}`)
        setStatus('confirmation')
      }
    } catch (error) {
      console.error('Error calling Lambda function', error)
      alert('Something went wrong')
      setStatus('confirmation') // Revert to confirmation state on error
    }
  }

  if (!isVisible) return null

  return (
    <div
      id={`confirm-${partNumber}`}
      className="text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden lg:text-sm flex items-center justify-center w-full p-5"
    >
      {status === 'confirmation' && (
        <div>
          <p className={`confirmation text-center`}>
            How many&nbsp;<span className="font-bold">{partNumber}</span>
            &nbsp;do you want to add to inventory?
          </p>
          <input
            type="number"
            value={addQuant}
            step="1.0"
            className="text-center w-full px-2 py-1 border border-gray-300 rounded-lg"
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <div className={`buttons flex justify-center items-center mt-5`}>
            <button
              className="bg-gray-200 text-black hover:bg-gray-300 text-center m-1 py-1 flex-grow px-2 rounded-lg"
              onClick={hideComponent}
            >
              Close
            </button>
            {quantity > addQuant && (
              <button
                className="bg-gray-500 text-white hover:bg-gray-700 text-center m-1 py-1 px-2 flex-grow rounded-lg"
                onClick={() => addQuantity(false)}
              >
                Add {addQuant} and wait for more
              </button>
            )}
            {quantity > addQuant && (
              <button
                className="bg-gray-700 text-white hover:bg-black text-center py-1 m-1 px-2 flex-grow rounded-lg"
                onClick={() => addQuantity(true)}
              >
                Add {addQuant} and close the Order
              </button>
            )}
            {quantity <= addQuant && (
              <button
                className="bg-gray-700 text-white hover:bg-black text-center py-1 m-1 px-2 flex-grow rounded-lg"
                onClick={() => addQuantity(true)}
              >
                Add {addQuant}
              </button>
            )}
          </div>
        </div>
      )}
      {status === 'processing' && (
        <p className={`text-center`}>Processing...{partNumber}</p>
      )}
    </div>
  )
}

export default AddConfirmation
