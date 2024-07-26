"use client";
import React, { useState, useEffect } from "react";
import ImageUploadIn from "../../components/buttons/imageUploadRentIn";
import ImageUploadOut from "../../components/buttons/imageUploadRentOut";
import MarkAsRentedConfirmation from "../../components/buttons/markAsRentedConfirmation";
import MarkAsReturnedConfirmation from "../../components/buttons/markAsReturnedConfirmation";

export interface RentedCardEditableProps {
  invoiceNumber: string;
  status: string;
  serialNumbers: string;
  customerPhone: string;
  dateShipped: string | null;
  description: string;
  isVisible: boolean;
  imagesOut: string;
  imagesIn: string;
  invoiceItems: string;
  shippedDate: string;
  dateExpected: string | null;
  NumberOfPieces: number;
  totalWeight: number;
  dimensions: string;
  trackingNumber: string;
  shipAddressLine1: string;
  shipAddressLine2: string;
  shipAddressLine3: string;
  shipAddressLine4: string;
  shipMethod: string;
  companyName: string;
  itemsDescription: string;
  customerEmail: string;
  itemsQuantity: string;
  InvoiceDueDate: string;
  billEmail: string;
  dateAdded: string;
  shipAddressCity: string;
  shipAddressState: string;
  shipAddressPostalCode: string;
  itemsDetailType: string;
  shipDate: string;
  checked: boolean;
}

interface ItemDetail {
  description: string;
  partNumber: string;
  quantity: number;
}

const RentedCardEditable: React.FC<RentedCardEditableProps> = ({
  shipAddressCity,
  shipDate,
  shipAddressState,
  shipAddressPostalCode,
  itemsDetailType,
  invoiceNumber,
  status,
  serialNumbers: initialSerialNumbers,
  customerPhone,
  trackingNumber: initialTrackingNumber,
  dimensions: initialDimensions,
  NumberOfPieces: initialNumberOfPieces,
  totalWeight: initialTotalWeight,
  shipAddressLine1,
  shipAddressLine2,
  invoiceItems,
  shipAddressLine4,
  dateExpected: initialDateExpected,
  imagesOut: initialImagesOut,
  imagesIn: initialImagesIn,
  shipMethod,
  companyName,
  itemsDescription,
  customerEmail,
  itemsQuantity,
  dateShipped,
  billEmail,
  dateAdded,
  checked,
}) => {
  let formattedInitialDateExpected = null;
  if (initialDateExpected) {
    formattedInitialDateExpected = new Date(initialDateExpected);
  }
  const [dateExpected, setDateExpected] = useState<Date | null>(
    formattedInitialDateExpected
  );
  const [showRentalChangeConfirmation, setshowRentalChangeConfirmation] =
    useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Mark as Shipped");
  const [newTrackingNumber, setNewTracking] = useState("");
  const [addTrackingNumber, setAddTrackingNumber] = useState(false);
  const [newSerial, setNewSerial] = useState("");
  const [addNewSerialNumber, setAddSerialNumber] = useState(false);

  const safelyParseJSON = (jsonString: string, fallback: any = []) => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      //console.error("Failed to parse JSON:", e);
      return fallback;
    }
  };

  let dateExpectedFormatted;
  let dateShippedFormatted;

  if (dateExpected) {
    dateExpectedFormatted = new Date(dateExpected);
  }

  if (dateShipped) {
    dateShippedFormatted = new Date(dateShipped);
  }
  const today = new Date();

  const [imagesOut, setImagesOut] = useState<string[]>(
    safelyParseJSON(initialImagesOut)
  );
  const [imagesIn, setImagesIn] = useState<string[]>(
    safelyParseJSON(initialImagesIn)
  );
  const [serialNumbers, setSerialNumbers] = useState<string[]>(
    safelyParseJSON(initialSerialNumbers)
  );
  const [trackingNumber, setTrackingNumber] = useState(
    safelyParseJSON(initialTrackingNumber)
  );

  const createItemsJson = (
    description: string | null,
    partNumber: string | null,
    quantity: string | null,
    invoiceItems: string | null
  ): ItemDetail[] => {
    const safeDescription = description ?? "";
    const safePartNumber = partNumber ?? "";
    const safeQuantity = quantity ?? "";

    const descriptions = safeDescription.split(",");
    const partNumbers = safePartNumber.split(",");
    const quantities = safeQuantity.split(",").map(Number);

    let items: ItemDetail[] = [];
    if (invoiceItems) {
      items = safelyParseJSON(invoiceItems);
    } else {
      partNumbers.forEach((partNumber, index) => {
        if (partNumber && !isNaN(quantities[index])) {
          items.push({
            description: descriptions[index],
            partNumber: partNumber,
            quantity: quantities[index],
          });
        }
      });
    }
    return items;
  };

  const items = createItemsJson(
    itemsDescription,
    itemsDetailType,
    itemsQuantity,
    invoiceItems
  );

  const formatPhoneNumber = (phoneNumberString: string) => {
    if (phoneNumberString) {
      const cleanPhoneNumber = phoneNumberString.replace(/\D/g, "");

      if (cleanPhoneNumber.length === 10) {
        return `(${cleanPhoneNumber.slice(0, 3)}) ${cleanPhoneNumber.slice(
          3,
          6
        )}-${cleanPhoneNumber.slice(6)}`;
      } else {
        return "Invalid number; must be 10 digits";
      }
    }
    return "";
  };

  const handleHideMarkAsRentedConfirmation = (dateExpected: Date | null) => {
    setshowRentalChangeConfirmation(false);
    if (dateExpected) {
      setDateExpected(dateExpected); // Update dateExpected state in parent
    }
  };

  const handleImagesUpdatedOut = (newImages: string[]) => {
    setImagesOut((prev) => [...prev, ...newImages]);
    setIsEdited(true);
    setButtonLabel("Save");
  };
  const handleImagesUpdatedIn = (newImages: string[]) => {
    setImagesIn((prev) => [...prev, ...newImages]);
    setIsEdited(true);
    setButtonLabel("Save");
  };

  const handleSerialsUpdated = (newSerials: string[]) => {
    setSerialNumbers((prev) => [...prev, ...newSerials]);
  };

  const addSerialNumber = (newValue: string) => {
    setSerialNumbers([...serialNumbers, newValue]);
    setIsEdited(true);
    setButtonLabel("Save");
    setNewSerial("");
    setAddSerialNumber(false);
  };

  const handleSerialNumberChange = (index: number, newValue: string) => {
    if (serialNumbers.length === 0) {
      setSerialNumbers([newValue]);
    } else {
      const updatedSerialNumbers = [...serialNumbers];
      updatedSerialNumbers[index] = newValue;
      setSerialNumbers(updatedSerialNumbers);
    }
    setIsEdited(true);
    setButtonLabel("Save");
  };

  const addTracking = (newValue: string) => {
    setTrackingNumber([...trackingNumber, newValue]);
    setIsEdited(true);
    setButtonLabel("Save");
    setNewTracking("");
    setAddTrackingNumber(false);
  };

  const handleTrackingChange = (index: number, newValue: string) => {
    if (trackingNumber.length === 0) {
      setTrackingNumber([newValue]);
    } else {
      const updatedTracking = [...trackingNumber];
      updatedTracking[index] = newValue;
      setTrackingNumber(updatedTracking);
    }
    setIsEdited(true);
    setButtonLabel("Save");
  };

  const saveChanges = async () => {
    setButtonLabel("Saving...");
    setIsEdited(false);
    setButtonLabel("Mark as Shipped");
  };

  const toggleShipConfirmation = () => {
    if (isEdited) {
      saveChanges();
    } else {
      setshowRentalChangeConfirmation(!showRentalChangeConfirmation);
    }
  };

  const handleHideShipConfirmation = () => {
    setshowRentalChangeConfirmation(false);
  };

  const removeImageOut = (indexToRemove: number) => {
    if (!dateExpected) {
      setImagesOut(imagesOut.filter((_, index) => index !== indexToRemove));
      setButtonLabel("Save");
      setIsEdited(true);
    } else {
      alert(
        "Once the item is marked as rented, the outgoing images cannot be changed."
      );
    }
  };

  const removeImageIn = (indexToRemove: number) => {
    setImagesIn(imagesIn.filter((_, index) => index !== indexToRemove));
    setButtonLabel("Save");
    setIsEdited(true);
  };

  return (
    <div>
      {showRentalChangeConfirmation && (
        <div>
          {dateExpected ? (
            <MarkAsReturnedConfirmation
              invoiceNumber={invoiceNumber}
              onHide={handleHideShipConfirmation}
            />
          ) : (
            <MarkAsRentedConfirmation
              invoiceNumber={invoiceNumber}
              onHide={handleHideShipConfirmation}
              handleHideMarkAsRentedConfirmation={
                handleHideMarkAsRentedConfirmation
              }
            />
          )}
        </div>
      )}

      <div
        id={`div-${invoiceNumber}`}
        className={`text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden text-sm ${
          showRentalChangeConfirmation ? "hidden" : ""
        }`}
      >
        {dateExpectedFormatted && dateExpectedFormatted < today ? (
          <div
            className={`w-full py-1 font-medium text-center text-white bg-rose-600 lg:grid flex lg:grid-cols-3 px-2`}
          >
            <h2 className="text-left">Invoice: {invoiceNumber}</h2>
            <div className="hidden lg:flex md:justify-center">
              <h2>
                {(
                  (today.getTime() - dateExpectedFormatted.getTime()) /
                  (1000 * 60 * 60 * 24)
                ).toFixed(2)}{" "}
                days Late
              </h2>
            </div>
            <div className="justify-end text-right flex-grow">
              <p>Expected: {dateExpectedFormatted?.toString().slice(0, 15)}</p>
            </div>
          </div>
        ) : (
          <div
            className={`w-full py-1 font-medium text-center text-white bg-teal-500 xl:grid flex xl:grid-cols-2 px-2`}
          >
            <h2 className="text-left">Invoice: {invoiceNumber}</h2>
            {/*<div className="hidden md:flex md:justify-center">{dateExpected ? <h2>Expected: {new Date(dateExpected).toString().slice(0,15)}</h2> : <h2>Ready</h2>}</div>*/}
            {dateExpectedFormatted && (
              <div className="justify-end text-right flex-grow">
                <p className="text-right flex-grow">
                  Expected: {dateExpectedFormatted?.toString().slice(0, 15)}
                </p>
              </div>
            )}
          </div>
        )}
        {((imagesOut.length === 0 && !dateExpected) ||
          (imagesIn.length === 0 && dateExpected)) && (
          <div
            className={`w-full py-1 font-medium text-center text-white bg-indigo-500`}
          >
            <h2>Add Pictures</h2>
          </div>
        )}

        <div className="md:grid md:grid-cols-2 px-2">
          <div className="col-span-2">
            <p className="font-bold mt-1 mb-2">Items:</p>

            <div className="flex items-center">
              <div className="mb-5">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={`grid md:grid-cols-2 ${
                      items.length !== index + 1 && "border-b border-gray-200"
                    } p-1`}
                  >
                    <div className="flex space-x-2 items-center pr-2">
                      <p>({item.quantity})</p>

                      <p className="font-medium">
                        {item.partNumber.split(":").length > 1
                          ? item.partNumber.split(":")[1]
                          : item.partNumber}
                      </p>
                    </div>
                    <p className="">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center italic">
              <p className="my-2 text-gray-400">
                To remove an image, double click the image.
              </p>
            </div>
          </div>
          <div
            className={`${
              dateExpected ? "md:border-r" : "md:col-span-2"
            } border-b md:border-b-0 border-gray-200 pb-2`}
          >
            <p className="font-bold">Outgoing Images:</p>
            <div className="w-auto object-contain overflow-hidden">
              <div
                className={`${
                  imagesOut.length === 0
                    ? "text-gray-400 py-2 flex items-center justify-center"
                    : "flex flex-wrap"
                } `}
              >
                {imagesOut.length > 0 ? (
                  imagesOut.map((imageName: string, index: number) => (
                    <img
                      key={index}
                      src={imageName}
                      alt={imageName}
                      className="h-32 mt-1 mr-1 rounded-sm object-contain"
                      onDoubleClick={() => removeImageOut(index)}
                    />
                  ))
                ) : (
                  <div className="text-center italic">
                    <p className="mt-2">No outgoing images.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {dateExpected && (
            <div className="p-2">
              <p className="font-bold">Incoming Images:</p>
              <div className="w-auto object-contain overflow-hidden">
                <div
                  className={`${
                    imagesIn.length === 0
                      ? "text-gray-400 py-2 flex items-center justify-center"
                      : "flex flex-wrap"
                  }`}
                >
                  {imagesIn.length > 0 ? (
                    imagesIn.map((imageName: string, index: number) => (
                      <img
                        key={index}
                        src={imageName}
                        alt={imageName}
                        className="h-32 mt-1 mr-1 rounded-sm object-contain"
                        onDoubleClick={() => removeImageIn(index)}
                      />
                    ))
                  ) : (
                    <div className="text-center italic">
                      <p className="mt-2">No Incoming images.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 px-2 border-t border-gray-200">
          <div className="order-first sm:order-none p-2 text-gray-700 text-center md:border-r border-gray-200">
            <div>
              <b>Customer & location:</b>
            </div>
            <p className="mt-1">{companyName}</p>
            <p className="">{shipAddressLine1}</p>
            <p className="">{shipAddressLine2}</p>
            <p className="">
              {shipAddressCity}, {shipAddressState} {shipAddressPostalCode}
            </p>

            <p className="">{formatPhoneNumber(customerPhone)}</p>
            {billEmail.split("@").length - 1 < 2 ? (
              <p className="">{billEmail.replace(",", "")}</p>
            ) : (
              <p>{billEmail}</p>
            )}
          </div>
          <div className="p-2 text-gray-700 text-center">
            <div>
              <b>Tracking Numbers</b>
            </div>
            <div className="mt-1">
              {trackingNumber.length === 0 && (
                <div className="md:flex my-1">
                  <input
                    type="text"
                    value={newTrackingNumber}
                    onChange={(e) => setNewTracking(e.target.value)}
                    className="p-1 bg-gray-100 rounded-lg w-full flex-grow text-center"
                  />
                  <button
                    className="px-1 rounded-lg"
                    onClick={() => addTracking(newTrackingNumber)}
                  >
                    Add
                  </button>
                </div>
              )}

              {isEdited ? (
                <div>
                  {trackingNumber.map((tracking: string, index: number) => (
                    <input
                      key={index}
                      type="text"
                      value={tracking}
                      onChange={(e) =>
                        handleTrackingChange(index, e.target.value)
                      }
                      className="my-1 p-1 bg-gray-100 rounded-lg w-full"
                    />
                  ))}
                </div>
              ) : (
                <div>
                  {" "}
                  {trackingNumber.map((tracking: string, index: number) => (
                    <p
                      key={index}
                      onDoubleClick={() => setIsEdited(true)}
                      className="my-1 p-1 bg-gray-100 rounded-lg w-full"
                    >
                      {tracking}
                    </p>
                  ))}
                </div>
              )}

              {trackingNumber.length > 0 && (
                <button onClick={() => setAddTrackingNumber(true)}>
                  + Tracking Number
                </button>
              )}
              {addTrackingNumber && (
                <div className="md:flex my-1">
                  <input
                    type="text"
                    value={newTrackingNumber}
                    onChange={(e) => setNewTracking(e.target.value)}
                    className="p-1 bg-gray-100 rounded-lg w-full flex-grow"
                  />
                  <button
                    className="px-1 rounded-lg"
                    onClick={() => addTracking(newTrackingNumber)}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            <div className="mt-2">
              <b>Serial Numbers</b>
            </div>
            <div className="mt-1">
              {serialNumbers.length === 0 && (
                <div className="md:flex my-1">
                  <input
                    type="text"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="p-1 bg-gray-100 rounded-lg w-full flex-grow text-center"
                  />
                  <button
                    className="px-1 rounded-lg"
                    onClick={() => addSerialNumber(newSerial)}
                  >
                    Add
                  </button>
                </div>
              )}

              {isEdited ? (
                <div>
                  {serialNumbers.map((serial: string, index: number) => (
                    <input
                      key={index}
                      type="text"
                      value={serial}
                      onChange={(e) =>
                        handleSerialNumberChange(index, e.target.value)
                      }
                      className="my-1 p-1 bg-gray-100 rounded-lg w-full text-center"
                    />
                  ))}
                </div>
              ) : (
                <div>
                  {serialNumbers.map((serial: string, index: number) => (
                    <p
                      key={index}
                      onDoubleClick={() => setIsEdited(true)}
                      className="my-1 p-1 bg-gray-100 rounded-lg w-full text-center"
                    >
                      {serial}
                    </p>
                  ))}
                </div>
              )}

              {serialNumbers.length > 0 && (
                <button onClick={() => setAddSerialNumber(true)}>
                  + Serial Number
                </button>
              )}
              {addNewSerialNumber && (
                <div className="md:flex my-1">
                  <input
                    type="text"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="p-1 bg-gray-100 rounded-lg w-full flex-grow text-center"
                  />
                  <button
                    className="px-1 rounded-lg"
                    onClick={() => addSerialNumber(newSerial)}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {!dateExpected ? (
          <div
            id={`edit-${invoiceNumber}`}
            className="w-full py-1 border-t cursor-pointer"
          >
            <ImageUploadOut
              invoiceNumber={invoiceNumber}
              onImagesUpdated={handleImagesUpdatedOut}
            />
          </div>
        ) : (
          <div className="text-gray-700 text-center border-t border-gray-200 font-medium md:grid md:grid-cols-3">
            <div
              id={`edit-${invoiceNumber}`}
              className="w-full py-1 md:border-r cursor-pointer"
            >
              <ImageUploadIn
                invoiceNumber={invoiceNumber}
                onImagesUpdated={handleImagesUpdatedIn}
              />
            </div>
            <div className="py-1 md:border-r cursor-pointer">Payments</div>
            <div className="py-1 cursor-pointer">Reminders</div>
          </div>
        )}

        {buttonLabel === "Save" && (
          <div
            className={`w-full px-3 py-1 font-medium text-center bg-purple-700 
          text-white cursor-pointer`}
            onClick={() => {
              setIsEdited(false);
              setButtonLabel("Mark as Shipped");
            }}
          >
            Exit without saving
          </div>
        )}
        <div
          className={`w-full px-3 py-1 font-medium text-center rounded-b-lg ${
            buttonLabel === "Save" ? "bg-blue-700 animate-pulse" : "bg-black"
          } text-white cursor-pointer`}
          onClick={toggleShipConfirmation}
        >
          {!dateExpected && buttonLabel !== "Save" && `Mark as Rented`}
          {dateExpected && buttonLabel !== "Save" && "Mark as Returned"}
          {buttonLabel === "Save" && "Save"}
        </div>
      </div>
    </div>
  );
};

export default RentedCardEditable;
