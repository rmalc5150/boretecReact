'use client'

//add account: yes/no to vendor objects.
//remove lead time if build, add in dynamic pricing and publicFacing as options or defaults.

import React, { useState, useEffect, useCallback, useRef } from 'react'

import DeleteItem from '../../components/buttons/DeleteItemRentals'


interface RentalsItemProps {
  partNumber: string

  description: string
  quantity: number 
  available: number
  location: string
  cost: number
  retailPrice: number
  weight: number
  leadTime: number
  images: string // This might be better as string[] if multiple images are expected

  category: string
  showItem: string
  editor: string
  editDateTime: string

  qboID: string
  royalties: number // Changed from boolean to number (tinyint)
}



const RentalsCardEditable: React.FC<RentalsItemProps> = (props) => {
  const { partNumber, images, editor } = props


  const [weight, setWeight] = useState(props.weight)
  const [retailPrice, setRetailPrice] = useState(props.retailPrice)
  const [cost, setCost] = useState(props.cost || 0)
  const [quantity, setQuantity] = useState(props.quantity)
  const [available, setAvailable] = useState(props.available)
  const [description, setDescription] = useState(props.description)
  const [editDateTime, setEditDateTime] = useState(props.editDateTime)

  const [category, setCategory] = useState(props.category)

  const [isEditing, setIsEditing] = useState(false)

  const [showCard, setShowCard] = useState(false)
  const [showFullImage, setShowImageFull] = useState(false)

  const [showSaving, setShowSaving] = useState(false)
  const [showDelete, setDelete] = useState(false)

  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [changesSaved, setChangesSaved] = useState(false)


  const [removeButton, setRemoveButton] = useState(false)







  const newTime = () => {
    const dateTimeArray = new Date().toString().split(' ')
    const newDateTime =
      dateTimeArray[1] +
      ' ' +
      dateTimeArray[2] +
      ' ' +
      dateTimeArray[3] +
      ' ' +
      dateTimeArray[4] +
      ' ' +
      dateTimeArray[6] +
      ')'
    return newDateTime
  }

  const componentRef = useRef<HTMLDivElement>(null) // Adding a ref to the component

  const verifyDelete = () => {
    setDelete(true)
    scrollUp()
  }
  const scrollUp = () => {
    if (componentRef.current) {
      const scrollY =
        componentRef.current.getBoundingClientRect().top + window.scrollY - 80 // 80px above
      window.scrollTo({ top: scrollY, behavior: 'smooth' })
    }
  }
  useEffect(() => {
    // Check if we are transitioning from isEditing=true to isEditing=false
    let timer: ReturnType<typeof setTimeout>
    if (changesSaved) {
      scrollUp()
      timer = setTimeout(() => {
        setChangesSaved(false) // Hide the confirmation div
      }, 15000) // milliseconds
    }

    return () => clearTimeout(timer) // Cleanup the timer
  }, [isEditing, changesSaved])

  const removeSubstring = (originalString: string) => {
    // Replace '-h-200' with -h-1000
    const updatedString = originalString.replace('-h-200.png', '-h-1000.png')
    return updatedString
  }
  const currentImageUrlFull = removeSubstring(images)

  const handleSave = async () => {
    scrollUp()
    setShowSaving(true)

        //console.log(applicationResponse)
        setIsEditing(false)


          setChangesSaved(true)
          setUnsavedChanges(false)

    
    setShowSaving(false)
  }

  const hideAll = () => {
    setDelete(false)
    setShowCard(true)
  }

  const onHideDelete = () => {
    setDelete(false)
  }

  return (
    <div ref={componentRef}>
      {showFullImage && (
        <div className="">
          <div className="-z-50 absolute p-5 font-thin">
            Downloading image...
          </div>

          <img
            src={currentImageUrlFull}
            alt="Part"
            className="relative w-full object-contain overflow-hidden rounded-lg border border-gray-200 bg-white"
            onClick={() => setShowImageFull(false)}
          />
        </div>
      )}

      {showDelete && (
        <DeleteItem
          partNumber={partNumber}
          onDelete={hideAll}
          onHideDelete={onHideDelete}
        />
      )}

      <div
        id={`div-${partNumber}`}
        className={`searchable-parent bg-white border border-gray-200 hover:border-gray-300 rounded-lg overflow-hidden lg:text-sm" ${
          showDelete || showFullImage || showCard
            ? 'hidden'
            : ''
        }`}
      >
        {unsavedChanges && (
          <div>
            <p
              className={`text-center p-1 ${
                isEditing
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-purple-700 text-white'
              }`}
            >
              Unsaved Changes
            </p>
          </div>
        )}

        {changesSaved && (
          <div className="bg-blue-600 text-white text-center p-1">
            <p>Recently Edited</p>
          </div>
        )}
        {showSaving && (
          <div className="bg-blue-600 text-white text-center p-1">
            <p>Saving...</p>
          </div>
        )}

        <div className="grid grid-cols-2">
          <div
            className="text-center p-2"
            onDoubleClick={() => setIsEditing(true)}
          >
            <div className="my-2 font-bold tracking-tight text-gray-900">
              <p>{partNumber}</p>
              
            </div>
            {isEditing && <p className="text-left text-sm">Description:</p>}
            <p
              contentEditable={isEditing}
              onInput={() => setUnsavedChanges(true)}
              suppressContentEditableWarning={true}
              className={`description ${
                isEditing
                  ? 'bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600'
                  : ''
              }`}
            >
              {description}
            </p>
          </div>
          <div>
            {images && (
              <div id={`images-${partNumber}`} className="flex justify-end">
                <img
                  src={images}
                  alt="Part"
                  className={`max-h-48 object-contain overflow-hidden ${
                    isEditing ? '' : 'rounded-bl-lg'
                  }`}
                  onClick={() => setShowImageFull(true)}
                />
              </div>
            )}
          </div>
        </div>

        
        <div
          className="grid grid-cols-3 px-2 mt-5"
          onDoubleClick={() => setIsEditing(true)}
        >
          <div className="p-2 text-gray-700 text-center border-r border-t border-gray-100">
            <div>
              <b>Available</b>
            </div>
            <p
              contentEditable={isEditing}
              onInput={() => setUnsavedChanges(true)}
              suppressContentEditableWarning={true}
              className={`quantity ${
                isEditing
                  ? 'bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600'
                  : ''
              }`}
            >
              {available} of {quantity}
            </p>
          </div>

          <div className="p-2 text-gray-700 text-center border-r border-t border-gray-100">
            <div>
              <b>Monthly Price</b>
            </div>
            {isEditing ? (
              <div className="flex justify-center items-center">
                <p>$</p>
                <input
                  type="number"
                  step="0.01"
                  value={retailPrice}
                  onChange={(e) => {
                    setRetailPrice(parseFloat(e.target.value)) // Assuming you have a function to update the price
                    setUnsavedChanges(true)
                  }}
                  disabled={!isEditing}
                  className="bg-blue-100 text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                />


              </div>
            ) : (
              <div className="flex justify-center items-center">
                <p>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(retailPrice)}
                </p>
              </div>
            )}
          </div>
          <div className="p-2 text-gray-700 text-center border-t border-gray-100">
            <div>
              <b>Weight</b>
            </div>
            <div className="flex justify-center items-center">
              <p
                contentEditable={isEditing}
                onInput={() => setUnsavedChanges(true)}
                suppressContentEditableWarning={true}
                className={`weight ${
                  isEditing
                    ? 'bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 flex-grow'
                    : ''
                }`}
              >
                {weight}
              </p>
              <p>lbs</p>
            </div>
          </div>

        </div>

        {isEditing && (
          <div className="flex text-xs px-1 justify-end text-gray-500 mt-2 font-thin">

              <p>
                Updated <span className="font-normal">{editDateTime}</span>
              </p>
      
          </div>
        )}
        {isEditing && (
          <div>
            <div
              className="bg-blue-600 text-white border-b border-white text-center px-2 py-3 cursor-pointer"
              onClick={() => handleSave()}
            >
              Save
            </div>
            <div
              className="bg-purple-700 text-white border-b border-white text-center px-2 py-2 cursor-pointer"
              onClick={() => {
                setIsEditing(false); scrollUp()
              }}
            >
              Exit Without Saving
            </div>
         
              <div
                className="admin bg-rose-600 text-center text-white px-2 py-1 cursor-pointer"
                onClick={verifyDelete}
              >
                <p>Remove Item</p>
              </div>
        
          </div>
        )}
        <div
              className="w-full bg-black text-white text-center"
     
            >
         
                <button className="w-full py-px">Assign to Customer</button>
           
               
           
            </div>
      </div>
    </div>
  )
}

export default RentalsCardEditable
