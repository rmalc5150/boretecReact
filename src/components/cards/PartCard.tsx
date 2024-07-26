'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'



interface PartCardProps {
  partNumber: string
  description: string
  quantity: string
  location: string
  cost: string
  retailPrice: string
  weight: string
  leadTime: string
  docFileName: string
  images: string
  upsell: string
  type: string
  parts: string
  vendors: string
  manufacturer: string
  manufactPartNum: string
  parLevel: string
  partsUrl: string
  partsInStock: string
  name:string
  qboID: number
  onAddToEstimate: (partNumber: string, retailPriceFloat: number, image: string, name:string, qboID: number) => void; // Type for new prop
}

const NumberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PartCard: React.FC<PartCardProps> = (props) => {
  const {
    partNumber,
    quantity,
    retailPrice,
    weight,
    images,
    name,
    qboID,
    onAddToEstimate
  } = props
  const [showFullImage, setShowImageFull] = useState(false)
  const imageUrl = images || 'https://boretec.com/images/image-coming-soon.png'


  const formatNumber = (number: number): string => NumberFormatter.format(number);
  const retailPriceFloat = parseFloat(retailPrice);
  const weightFloat = parseFloat(weight);

  const removeSubstring = (originalString: string) => {
    // Replace '-h-200' with -h-1000
    const updatedString = originalString.replace('-h-200.png', '-h-1000.png')
    return updatedString
  }

  const currentImageUrlFull = removeSubstring(imageUrl)

  return (
    <div>
      {showFullImage && (
        <div>
          <div className="-z-50 absolute p-5 font-thin">
            Downloading image...
          </div>

          <img
            src={currentImageUrlFull}
            alt="Part"
            className="relative w-full border border-gray-200 object-contain overflow-hidden rounded-lg bg-white"
            onClick={() => setShowImageFull(false)}
          />
        </div>
      )}
      <div
        id={`div-${partNumber}`}
        className={`searchable-parent bg-white border border-gray-200 hover:border-gray-300 rounded-lg overflow-hidden lg:text-sm ${
          showFullImage ? 'hidden' : ''
        }`}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center px-2">
            <div className="my-2 font-bold tracking-tight searchable text-gray-900 flex justify-center">
              <p>{partNumber}</p>

            </div>
            <p>
              <span className="searchable">{name}</span>
            </p>

          </div>
          <div>
         
          {imageUrl !== '#' && (
              <div id={`images-${partNumber}`} className="flex justify-end items-center">
              <img
                src={imageUrl}
                alt="Part"
                className="h-28 object-contain overflow-hidden rounded-bl-lg cursor-pointer"
                onClick={() => setShowImageFull(true)}
              />
              </div>
            )}
        
          </div>
        </div>
        <div className="grid grid-cols-3 px-2 mt-5">
          <div className="p-2 text-gray-700 text-center border-r border-t border-gray-100">
            <div>
              <b>Stock</b>
            </div>
            <p>
              <span className="quantity">{quantity}</span>
            </p>
          </div>

          <div className="p-2 text-gray-700 text-center border-r border-t border-gray-100">
            <div>
              <b>Price</b>
            </div>
            <p>
              $<span className="retailPrice">{formatNumber(retailPriceFloat)}</span>
            </p>
          
          </div>
          <div className="p-2 text-gray-700 text-center border-t border-gray-100">
            <div>
              <b>Weight</b>
            </div>
            <p>
              <span className="weight">{weight ? `${formatNumber(weightFloat)} lbs`: ""}</span>
            </p>
          </div>


        </div>

        <div className="bg-gray-900 text-white text-center font-medium">




          <div
            className="w-full py-1 border-t border-gray-50 cursor-pointer" onClick={() => onAddToEstimate(partNumber, retailPriceFloat, imageUrl, name, qboID)}>
            Add to Estimate
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartCard
