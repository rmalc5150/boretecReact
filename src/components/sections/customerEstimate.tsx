'use client'

import React, { useEffect, useState, useRef } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'

interface EstimateItem {
  partNumber: string
  retailPriceFloat: number // Renamed from retailPrice for clarity
  image: string
  name: string
  quantity: number
}

const CustomerEstimate = () => {
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([])
  const [estimateID, setEstimateID] = useState<string | number>('')
  const [givenName, setGivenName] = useState<string>('')
  const [familyName, setFamilyName] = useState<string>('')
  const [tax, setTax] = useState<number>(0)
  const [subtotal, setSubtotal] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [companyName, setCompanyName] = useState<string>('')
  const [primaryEmail, setPrimaryEmail] = useState<string>('')
  const [primaryPhone, setPrimaryPhone] = useState<string>('')
  const [billAddressCity, setBillAddressCity] = useState<string>('')
  const [billAddressLine1, setBillAddressLine1] = useState<string>('')
  const [billAddressLine2, setBillAddressLine2] = useState<string | null>(null)
  const [billAddressState, setBillAddressState] = useState<string>('')
  const [billAddressPostalCode, setBillAddressPostalCode] = useState<string>('')
  const [country, setCountry] = useState<string>('USA')
  const [fullyQualifiedName, setFullyQualifiedName] = useState<string>('')
  const [shipAddressState, setShipAddressState] = useState<string>('')
  const [shipAddressCity, setShipAddressCity] = useState<string>('')
  const [shipAddressLine1, setShipAddressLine1] = useState<string>('')
  const [shipAddressLine2, setShipAddressLine2] = useState<string | null>(null)
  const [shipAddressPostalCode, setShipAddressPostalCode] = useState<string>('')
  const [mobilePhone, setMobilePhone] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const smsMessage = `I accept estimate ${estimateID}. Please send an invoice.`

  const smsHref = `sms:+18647076249?body=${encodeURIComponent(smsMessage)}`
  const emailHref = `mailto:sales@boretec.com?subject=Boretec Estimate ${estimateID}&body=${encodeURIComponent(
    smsMessage
  )}`

  //sum esstimateItems
  const totalPrice = estimateItems.reduce(
    (acc, item) => acc + item.quantity * item.retailPriceFloat,
    0
  )
  // Format totalPrice with comma separators for thousands
  const formattedSubTotalPrice = totalPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const formattedTotalPrice = (
    subtotal -
    (subtotal * discount) / 100 +
    tax
  ).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const fetchEstimate = async (urlKey: string) => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_select_estimate_urlKey',
      Payload: JSON.stringify({ urlKey }),
    }
    //console.log(params);
    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject);
      if (payloadObject.length > 0) {
        const firstResult = payloadObject[0]
        setEstimateID(firstResult.estimateID)
        setGivenName(firstResult.givenName)
        setFamilyName(firstResult.familyName)
        setTax(firstResult.tax)
        setSubtotal(firstResult.subtotal)
        setDiscount(firstResult.discount)
        setCompanyName(firstResult.companyName)
        setPrimaryEmail(firstResult.primaryEmail)
        setPrimaryPhone(firstResult.primaryPhone)
        setBillAddressCity(firstResult.billAddressCity)
        setBillAddressLine1(firstResult.billAddressLine1)
        setBillAddressLine2(firstResult.billAddressLine2 || null) // This might be null, which is handled by the state type
        setBillAddressState(firstResult.billAddressState)
        setBillAddressPostalCode(firstResult.billAddressPostalCode)
        setCountry(firstResult.country) // Assuming "USA" or another country value is returned
        setFullyQualifiedName(firstResult.fullyQualifiedName)
        setShipAddressState(firstResult.shipAddressState)
        setShipAddressCity(firstResult.shipAddressCity)
        setShipAddressLine1(firstResult.shipAddressLine1)
        setShipAddressLine2(firstResult.shipAddressLine2 || null) // This might also be null
        setShipAddressPostalCode(firstResult.shipAddressPostalCode)
        setMobilePhone(firstResult.mobilePhone)
        setMessage(firstResult.message)

        // Parsing the items from the lambda response and updating the state
        const parsedItems: EstimateItem[] = JSON.parse(firstResult.items).map(
          (item: any) => ({
            partNumber: item.partNumber,
            retailPriceFloat: item.retailPrice,
            image:
              item.images || 'https://boretec.com/images/image-coming-soon.png', // Fallback image if none is provided
            name: item.name,
            quantity: item.quantity,
          })
        )
        setEstimateItems(parsedItems)
      }
    } catch (error) {
      console.error('Error fetching inventory items', error)
    }
  }
  useEffect(() => {
    const fullUrl = window.location.href

    if (fullUrl.includes('?')) {
      const urlKey = fullUrl.split('?')[1]
      //console.log(urlKey)
      fetchEstimate(urlKey)
    }
  }, [])

  return (
    <section className="py-10">
      <h1 className="text-2xl font-medium tracking-tight text-center mb-5">
        Estimate {estimateID}
      </h1>
      <div className="bg-white rounded-lg p-2 border border-gray-200">
        {estimateItems.map((item, index) => (
          <div
            key={index}
            className="py-2 flex border-b border-gray-100 justify-center items-center space-x-2 md:space-x-4"
          >
            <img
              src={item.image}
              className="w-32 object-contain rounded-md"
              alt="Part"
            />
            <div className="flex-grow space-y-1">
              <div className="flex">
                <p className="font-bold">Part Number:</p>
                <p>&nbsp;{item.partNumber}</p>
              </div>
              <div className="flex">
                <p className="font-bold">Description:</p>
                <p>&nbsp;{item.name}</p>
              </div>
              <div className="flex items-center">
                <p className="font-bold">Quantity:</p>
                <p>&nbsp;{item.quantity}</p>
              </div>
              <div className="flex">
                <p className="font-bold">Price per Item:</p>
                <p>
                  &nbsp;{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.quantity * item.retailPriceFloat)}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-end text-right items-center p-2">
          <div>
            <p className="font-medium">Subtotal: ${formattedSubTotalPrice}</p>
            <p className="mt-2">Tax: ${tax.toFixed(2)}</p>
            {discount > 0 && (
              <p>
                {discount}% discount: -{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal*discount/100)}
              </p>
            )}
            <p className="mt-2 font-semibold">Total: ${formattedTotalPrice}</p>
          </div>
        </div>
      </div>
      {message && (
        <div className="p-2">
          <p className="font-medium">Additional Information:</p>
          <p>{message}</p>
        </div>
      )}
      <p className="mt-5 mb-2">To accept the estimate:</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
        <a
          href="tel:+18647081250"
          className="rounded-lg bg-black py-1 px-2 w-full text-center text-white"
        >
          Call
        </a>
        <a
          href={smsHref}
          className="rounded-lg bg-black py-1 px-2 w-full text-center text-white"
        >
          Text
        </a>
        <a
          href={emailHref}
          className="rounded-lg bg-black py-1 px-2 w-full text-center text-white"
        >
          Email
        </a>
      </div>

      <div className="md:grid md:grid-cols-3 mt-10 justify-items-center gap-2">
        <div>
          <h2 className="font-medium">
            {givenName} {familyName}
          </h2>
          <p className="font-medium">{companyName}</p>
          <p>
            <span className="font-medium">Primary email:</span> {primaryEmail}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {primaryPhone}
          </p>
          {mobilePhone && (
            <p>
              <span className="font-medium">Mobile:</span> {mobilePhone}
            </p>
          )}
        </div>
        <div className="pt-2">
          <p className="font-medium">Shipping Address:</p>
          <p>{shipAddressLine1}</p>
          {shipAddressLine2 && <p>{shipAddressLine2}</p>}
          {shipAddressCity && shipAddressState && (
            <p>
              {shipAddressCity}, {shipAddressState}
            </p>
          )}
          {shipAddressPostalCode && <p>{shipAddressPostalCode}</p>}
          <p>{country}</p>
        </div>
        <div className="pt-2">
          <p className="font-medium">Billing Address:</p>

          <p>{billAddressLine1}</p>
          <p>
            {billAddressCity}
            {billAddressCity ? ', ' : ''}
            {billAddressState}{' '}
          </p>
          <p>{billAddressPostalCode}</p>
          <p>{country}</p>
        </div>
      </div>
      <div className="px-2 mt-4 py-5 text-sm md:flex md:justify-between">
        <p>Shipping costs and tracking numbers are provided on the invoice.</p>
        <a className="font-medium" href="https://boretec.com/terms.html">Terms and Conditions</a>
      </div>
    </section>
  )
}

export default CustomerEstimate
