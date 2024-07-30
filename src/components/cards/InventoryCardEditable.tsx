"use client";

//add account: yes/no to vendor objects.
//remove lead time if build, add in dynamic pricing and publicFacing as options or defaults.

import React, { useState, useEffect, useCallback, useRef } from "react";
import { InvokeCommand, type InvokeCommandInput } from "@aws-sdk/client-lambda";
import { lambdaClient } from "../../lib/amazon";
import PdfViewer from "../../components/modals/PdfViewer";
import ImageUploadInventory from "../../components/buttons/ImageUploadInventory";
import Cookies from "js-cookie";
import PdfUploadEdit from "../modals/PdfUploadEdit";
import DeleteItem from "../modals/DeleteItem";
import AddToToBuildList from "../buttons/AddToToBuildList";
import AddToToOrderList from "../buttons/AddToToOrderList";
import FileUpload from "../buttons/FileUpload";
import InventorySearchBreakdown, {
  InventoryItem,
} from "../modals/inventorySearchBreakdown";
import CompanyLogoOrder from "../ui/companyLogoOrder";
import VendorSearch, { VendorItem } from "../modals/vendorSearch";
import RawMaterialsDiv from "../modals/rawMaterialsDiv";

interface Vendor {
  vName: string;
  vUrl: string;
  vPartNumber: string;
  vLeadTime: number;
  vCost: number;
  vPaymentMethod: string;
}


interface InventoryCardEditableProps {
  partNumber: string;
  description: string;
  quantity: number;
  location: string;
  cost: number;
  retailPrice: number;
  weight: number;
  leadTime: number;
  docFileName: string;
  images: string;
  upsell: string;
  type: string;
  parts: string;
  vendors: string;
  manufacturer: string;
  manufactPartNum: string;
  parLevel: number;
  partsUrl: string;
  partsInStock: string;
  name: string;
  editor: string;
  items: string;
  editDateTime: string;
  publicFacing: string;
  category: string;
  dynamicPricing: string;
  uploadedFiles: { name: string; url: string }[];
  quantityNeeded: number;
  allItems: InventoryItem[];
  breakdownInProgress: boolean;
  rAndD: boolean;
  royalties: boolean;
  measurements: string;
}

function useAdminCheck() {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const email = Cookies.get("email");
      if (email) {
        const extractedUsername = email.split("@")[0].toLowerCase();

        setAdmin(
          [
            "bill",
            "randall",
            "rhonda",
            "dave",
            "vitaliy",
            "chad",
            "sam",
            "billie",
          ].includes(extractedUsername)
        );
      }
    };

    checkAdminStatus();
  }, []);

  return admin;
}

const InventoryCardEditable: React.FC<InventoryCardEditableProps> = (props) => {
  const {
    vendors: vendorsString,
    partNumber,
    images,
    upsell,
    partsUrl,
    editor,
    allItems,
    measurements,
  } = props;

  //declare variable and useStates
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    if (typeof props.uploadedFiles === "string") {
      try {
        const parsed = JSON.parse(props.uploadedFiles);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(props.uploadedFiles) ? props.uploadedFiles : [];
  });
  const [items, setItems] = useState<InventoryItem[]>(
    JSON.parse(props.items) || []
  );
  const [breakdownCost, setBreakdownCost] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showBreakdownSave, setShowBreakdownSave] = useState(false);
  const [showEditBreakdown, setShowEditBreakdown] = useState(false);
  const [dynamicPricing, setDynamicPricing] = useState(
    props.dynamicPricing || "manual"
  );
  const [publicFacing, setPublicFacing] = useState(props.publicFacing);
  const [royalties, setRoyalties] = useState(props.royalties || false);
  const [manufacturer, setManufacturer] = useState(props.manufacturer);
  const [manufactPartNum, setManufactPartNum] = useState(props.manufactPartNum);
  const [leadTime, setLeadTime] = useState(props.leadTime);
  const [weight, setWeight] = useState(props.weight);
  const [retailPrice, setRetailPrice] = useState(props.retailPrice);
  const [cost, setCost] = useState(props.cost || 0);
  const [parLevel, setParLevel] = useState(props.parLevel);
  const [quantity, setQuantity] = useState(props.quantity);
  const [name, setName] = useState(props.name);
  const [location, setLocation] = useState(props.location);
  const [description, setDescription] = useState(props.description);
  const [docFileName, setDocFileName] = useState(props.docFileName);
  const [editDateTime, setEditDateTime] = useState(props.editDateTime);
  const [type, setType] = useState(props.type);
  const [category, setCategory] = useState(props.category);
  const imageUrl = images || "https://boretec.com/images/image-coming-soon.png";
  const [isEditing, setIsEditing] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showAdditionalFiles, setShowAdditionalFiles] = useState(false);
  const [showVendors, setShowVendors] = useState(false);
  const [showFullImage, setShowImageFull] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [showSaving, setShowSaving] = useState(false);
  const [showDelete, setDelete] = useState(false);
  const [partsInStock, setStockParts] = useState(props.partsInStock);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [changesSaved, setChangesSaved] = useState(false);
  const [showOrderBuild, setShowOrderBuild] = useState(false);
  const [editableVendorIndex, setEditableVendorIndex] = useState<number | null>(
    null
  );
  const [removeButton, setRemoveButton] = useState(false);
  const [showAddVendorDiv, setShowAddVendorDiv] = useState(false);
  const admin = useAdminCheck();
  const options = [
    "Part",
    "Raw Material",
    "Steering Head",
    "Steering System",
    "Steering Station",
    "Boring Machine",
    "Cutting Head",
    "Auger",
  ];
  const [breakdownInProgress, setBreakdownInProgress] = useState(
    props.breakdownInProgress || false
  );
  const [rAndD, setRAnD] = useState(props.rAndD || false);





  const handleProgressToggle = () => {
    setBreakdownInProgress(!breakdownInProgress);
    setUnsavedChanges(true);
    setShowBreakdownSave(true);
    //console.log(breakdownInProgress);
  };

  const toggleShowAddVendorDiv = () => {
    if (showAddVendorDiv) {
      setShowAddVendorDiv(false);
    } else {
      setShowAddVendorDiv(true);
    }
  };

  const handleRAndDToggle = () => {
    setRAnD(!rAndD);
    setUnsavedChanges(true);
    setShowBreakdownSave(true);
    //console.log(breakdownInProgress);
  };
  const removeVendor = (indexToRemove: number) => {
    const updatedVendors = vendors.filter(
      (_, index) => index !== indexToRemove
    );
    setVendors(updatedVendors);
    // Optionally reset any related states if necessary
  };

  const nameCheck = () => {
    const email = Cookies.get("email");
    if (email) {
      const extractedUsername = email.split("@")[0].toLowerCase();
      return extractedUsername;
    }
  };

  const editorToDisplay = () => {
    const username = nameCheck();
    if (editor) {
      if (username === editor) {
        return "You";
      } else {
        return editor.slice(0, 1).toUpperCase() + editor.slice(1);
      }
    }
  };

  const newTime = () => {
    const dateTimeArray = new Date().toString().split(" ");
    const newDateTime =
      dateTimeArray[1] +
      " " +
      dateTimeArray[2] +
      " " +
      dateTimeArray[3] +
      " " +
      dateTimeArray[4] +
      " " +
      dateTimeArray[6] +
      ")";
    return newDateTime;
  };

  const componentRef = useRef<HTMLDivElement>(null); // Adding a ref to the component

  const verifyDelete = () => {
    setDelete(true);
    scrollUp();
  };
  const scrollUp = () => {
    if (componentRef.current) {
      const scrollY =
        componentRef.current.getBoundingClientRect().top + window.scrollY - 80; // 80px above
      window.scrollTo({ top: scrollY, behavior: "smooth" });
    }
  };
  useEffect(() => {
    // Check if we are transitioning from isEditing=true to isEditing=false
    let timer: ReturnType<typeof setTimeout>;
    if (changesSaved) {
      scrollUp();
      timer = setTimeout(() => {
        setChangesSaved(false); // Hide the confirmation div
      }, 15000); // milliseconds
    }

    return () => clearTimeout(timer); // Cleanup the timer
  }, [isEditing, changesSaved]);

  const removeSubstring = (originalString: string) => {
    // Replace '-h-200' with -h-1000
    const updatedString = originalString.replace("-h-200.png", "-h-1000.png");
    return updatedString;
  };

  const currentImageUrlFull = removeSubstring(currentImageUrl);

  useEffect(() => {
    if (type === "build" && items.length > 0 && allItems) {
      const updatedItems = items.map((item) => {
        let updatedItem = item;
        const matchingInventoryItem = allItems.find(
          (inventoryItem) => inventoryItem.partNumber === item.partNumber
        );

        if (matchingInventoryItem) {
          if (matchingInventoryItem.cost !== item.cost) {
            updatedItem = { ...updatedItem, cost: matchingInventoryItem.cost };
            setUnsavedChanges(true);
          }
          if (matchingInventoryItem.description !== item.description) {
            updatedItem = {
              ...updatedItem,
              description: matchingInventoryItem.description,
            };
            setUnsavedChanges(true);
          }
          if (matchingInventoryItem.quantity !== item.quantity) {
            updatedItem = {
              ...updatedItem,
              quantity: matchingInventoryItem.quantity,
            };
          }
        }

        return updatedItem;
      });

      setItems(updatedItems);
    }
  }, [isEditing]);

  useEffect(() => {
    if (type === "build" && items.length > 0) {
      let totalCost = 0;
      for (const item of items) {
        // Ensure 'cost' is a number before adding it to totalCost
        const cost = Number(item.cost);
        const quantityNeeded = Number(item.quantityNeeded);
        totalCost += cost * quantityNeeded;
      }
      //console.log(totalCost);
      setCost(parseFloat(totalCost.toFixed(2)));
      setBreakdownCost(totalCost);

      if (dynamicPricing === "dynamic") {
        setRetailPrice(parseFloat((totalCost * 3.5).toFixed(2)));
      }
    }
    if (type === "buy" && dynamicPricing === "dynamic") {
      setRetailPrice(parseFloat((cost * 3.5).toFixed(2)));
    }
  }, [items, dynamicPricing, cost]);

  // A function to safely parse the JSON string
  const parseVendorsString = (vendorsStr: string): VendorItem[] => {
    try {
      return JSON.parse(vendorsStr);
    } catch (error) {
      console.error("Error parsing vendors JSON string:", error);
      return []; // Return an empty array in case of error
    }
  };

  // State initialization using the parsed vendors string
  const [vendors, setVendors] = useState<VendorItem[]>(
    parseVendorsString(props.vendors)
  );

  const handleVendorChange = <T extends VendorItem, K extends keyof VendorItem>(
    index: number,
    key: K,
    value: T[K]
  ) => {
    setVendors((prevVendors) => {
      const newVendors = [...prevVendors];
      const vendor = newVendors[index];
      if (vendor) {
        // Direct assignment with generic handling
        vendor[key] = value;
      }
      //console.log(newVendors);
      return newVendors;
    });
  };

  const handleAddVendor = (newVendor: VendorItem) => {
    let index;
    if (vendors.length === 0) {
      index = 0;
      setVendors([newVendor]);
      setEditableVendorIndex(index);
      setShowAddVendorDiv(false);
    } else {
      // Check if the newVendor's vName is already in the array
      const isVendorExist = vendors.some(
        (vendor) => vendor.vName === newVendor.vName
      );
      if (!isVendorExist) {
        index = vendors.length;
        const updatedVendors = [...vendors, newVendor];
        setVendors(updatedVendors);
        setEditableVendorIndex(index);
        //console.log(updatedVendors)
      } else {
        alert("Vendor already attached to this order.");
      }
    }
  };

  const handleSave = async () => {
    scrollUp();
    setShowSaving(true);
    const parent = document.getElementById(`div-${partNumber}`);
    if (parent) {
      try {
        // Collect updated vendor data from DOM

        /*const costValue = parent.querySelector('.cost')?.textContent || ''
        if (!isNaN(parseFloat(costValue))) {
          const costValueNumber = parseFloat(costValue)
          setCost(costValueNumber)
        } else {
          alert('Cost must be a number.')
          setShowSaving(false)
          return
        }*/

        const quantityValue =
          parent.querySelector(".quantity")?.textContent || "";
        if (!isNaN(parseInt(quantityValue))) {
          setQuantity(parseInt(quantityValue));
          //console.log(costValue)
        } else {
          alert("Quantity must be a number.");
          setShowSaving(false);
          return;
        }

        const weightValue = parent.querySelector(".weight")?.textContent || "";
        if (!isNaN(parseFloat(weightValue))) {
          setWeight(parseFloat(weightValue));
        } 

        const parLevelValue =
          parent.querySelector(".parLevel")?.textContent || "";
        if (!isNaN(parseInt(parLevelValue))) {
          setParLevel(parseInt(parLevelValue));
        } else {
          alert("PAR Level must be a number.");
          setShowSaving(false);
          return;
        }

        const locationValue = parent.querySelector(".location")?.textContent;
        //console.log(locationValue)
        if (locationValue) {
          setLocation(locationValue);
        }

        const descriptionValue =
          parent.querySelector(".description")?.textContent;
        if (descriptionValue) {
          setDescription(descriptionValue);
        }

        const nameValue = parent.querySelector(".name")?.textContent;
        if (nameValue) {
          setName(nameValue);
        }

        const manufacturerValue =
          parent.querySelector(".manufacturer")?.textContent;
        if (manufacturerValue) {
          setManufacturer(manufacturerValue);
        }

        const manufactPartNumValue =
          parent.querySelector(".manufactPartNum")?.textContent;
        if (manufactPartNumValue) {
          setManufactPartNum(manufactPartNumValue);
        }

        const leadTimeValue =
          parent.querySelector(".leadTime")?.textContent || "";
        if (!isNaN(parseInt(leadTimeValue))) {
          setLeadTime(parseInt(leadTimeValue));
        }

        let selectedBuyBuildValue = "";
        const selectElement = parent.querySelector(
          ".buyBuildSelect"
        ) as HTMLSelectElement;
        if (selectElement) {
          selectedBuyBuildValue = selectElement.value; // This gets the current selected value
          //console.log("buyBuild:" + selectedBuyBuildValue); // Use the selected value as needed
          // Proceed with your save logic here, using 'selectedValue'
        }

        let stockPartsSelectValue = "";
        const stockPartsSelectElement = parent.querySelector(
          ".stockPartsSelect"
        ) as HTMLSelectElement;
        if (stockPartsSelectElement) {
          stockPartsSelectValue = stockPartsSelectElement.value; // This gets the current selected value
          // Proceed with your save logic here, using 'selectedValue'
        }

        let publicFacingSelectValue = props.publicFacing;
        const publicFacingSelectElement = parent.querySelector(
          ".publicFacingSelect"
        ) as HTMLSelectElement;
        if (publicFacingSelectElement) {
          publicFacingSelectValue = publicFacingSelectElement.value; // This gets the current selected value
          // Proceed with your save logic here, using 'selectedValue'
        }
        let dynamicPricingSelectValue = props.dynamicPricing;
        const dynamicPricingSelectElement = parent.querySelector(
          ".dynamicPricing"
        ) as HTMLSelectElement;
        if (dynamicPricingSelectElement) {
          dynamicPricingSelectValue = dynamicPricingSelectElement.value; // This gets the current selected value
          // Proceed with your save logic here, using 'selectedValue'
        }

        const payload = {
          newContent: {
            vendors,
            type: selectedBuyBuildValue || props.type,
            partsInStock: stockPartsSelectValue,
            images: currentImageUrl,
            quantity: parseInt(quantityValue),
            retailPrice, //: parseFloat(retailPriceValue), //saved
            cost, //: parseFloat(costValue), //saved
            weight: parseFloat(weightValue), //saved
            location: locationValue, //saved
            description: descriptionValue, //saved
            leadTime: parseInt(leadTimeValue), //saved
            royalties,
            upsell,
            category, //partsUrl: partsUrlValue, //saved
            parLevel: parseInt(parLevelValue), //saved
            name: nameValue, //saved
            editDateTime: newTime(),
            editor: nameCheck(),
            manufacturer, //saved
            manufactPartNum, //saved
            publicFacing: publicFacingSelectValue,
            dynamicPricing: dynamicPricingSelectValue,
            uploadedFiles,
            items,
            breakdownInProgress,
            rAndD,
          },
          partNumber,
        };
        console.log(payload);

        const params: InvokeCommandInput = {
          FunctionName: "boretec_update_item",
          Payload: JSON.stringify(payload),
        };

        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);

        const applicationResponse = JSON.parse(
          new TextDecoder().decode(response.Payload)
        );
        //console.log(applicationResponse)
        setIsEditing(false);

        if (
          applicationResponse.status === 200 ||
          applicationResponse.status === 207
        ) {
          console.log("Update successful.");
          setEditDateTime(newTime());
          setChangesSaved(true);
          setUnsavedChanges(false);
          setShowVendors(false);
        } else if (applicationResponse.status === 500) {
          const responseBody = JSON.parse(applicationResponse.body);
          alert("Item didn't update" + responseBody.error);
          console.error("Update failed.", applicationResponse);
        }
      } catch (error) {
        console.error("Error invoking Lambda function", error);
        alert("Item didn't update" + error);
      }
    }
    setShowSaving(false);
  };

  const handleHidePdfUpload = useCallback((fileName: string) => {
    setDocFileName(fileName); // Use the setter function to update docFileName
    //console.log(docFileName)
  }, []);

  const hideAll = () => {
    setDelete(false);
    setShowCard(true);
  };

  const onHideDelete = () => {
    setDelete(false);
  };

  const handleFileUpload = (newFiles: { name: string; url: string }[]) => {
    setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeUrl = (urlToRemove: string) => {
    // Filter out the file object to be removed based on its url
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file.url !== urlToRemove)
    );
  };

  const downloadFile = async (fileName: string) => {
    // Ensure fileName is passed as an object to the Lambda function
    const payload = {
      fileName, // Shorthand for fileName: fileName
    };

    const params: InvokeCommandInput = {
      FunctionName: "boretec_fetch_file_from_s3_sends_link",
      Payload: JSON.stringify(payload), // Corrected to pass an object
    };

    try {
      const command = new InvokeCommand(params);
      const response = await lambdaClient.send(command);

      // Assuming response.Payload can be directly parsed into JSON
      const applicationResponse = JSON.parse(
        new TextDecoder().decode(response.Payload)
      );

      if (applicationResponse.statusCode === 200) {
        // Redirect user to the presigned URL to start the download
        window.location.href = applicationResponse.url;
      } else {
        console.error("No URL returned from Lambda");
        alert("File didn't download.");
      }
    } catch (error) {
      console.error("Error fetching presigned URL:", error);
      alert("Error occurred while fetching the file.");
    }
  };

  const handleInventoryClick = (items: InventoryItem[]) => {
    // Create a new array that includes all existing items plus the new item

    // Update the state with the new array
    setItems(items);
    setShowBreakdownSave(true);
    setShowEditBreakdown(false);
    setUnsavedChanges(true);
    scrollUp();
    //console.log(items);

    // Optionally, log the updated items array to the console
    //console.log(items)
  };

  const onClose = () => {
    setShowBreakdown(false);
    setShowEditBreakdown(false);
    scrollUp();
    if (items.length > 0) {
      setItems([]);
      setUnsavedChanges(true);
      setShowBreakdownSave(true);
    }
  };

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
      {showOrderBuild && (
        <div>
          {type === "build" ? (
            <AddToToBuildList
              description={description}
              partNumber={partNumber}
              imageUrl={imageUrl}
              location={location}
              items={items || []}
              docFileName={docFileName}
              onHide={() => setShowOrderBuild(false)}
            />
          ) : (
            <AddToToOrderList
              description={description}
              partNumber={partNumber}
              images={imageUrl}
              vendors={vendorsString}
              location={location}
              cost={cost}
              manufacturer={manufacturer}
              manufactPartNum={manufactPartNum}
              onHide={() => setShowOrderBuild(false)}
            />
          )}
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
          showDelete || showFullImage || showCard || showOrderBuild
            ? "hidden"
            : ""
        }`}
      >
        {unsavedChanges && (
          <div>
            <p
              className={`text-center p-1 ${
                breakdownInProgress || rAndD ? "border-b border-white" : ""
              } ${
                isEditing
                  ? "bg-blue-100 text-blue-600"
                  : "bg-purple-700 text-white"
              }`}
            >
              Unsaved Changes
            </p>
          </div>
        )}
        {breakdownInProgress && !rAndD && (
          <div>
            <p
              className={`text-center p-1 bg-cyan-700 text-white ${
                rAndD && "border-b border-white"
              }`}
            >
              Breakdown in Progress
            </p>
          </div>
        )}
        {rAndD && (
          <div>
            <p className={`text-center p-1 bg-cyan-700 text-white`}>R & D</p>
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
              <p className="text-center">&nbsp;@&nbsp;</p>
              {isEditing && (
                <p className="text-left text-sm font-normal">Location:</p>
              )}
              <p
                contentEditable={isEditing}
                onInput={() => setUnsavedChanges(true)}
                suppressContentEditableWarning={true}
                className={`location ${
                  isEditing
                    ? "bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600"
                    : ""
                }`}
              >
                {location}
              </p>
            </div>
            {isEditing && <p className="text-left text-sm">Description:</p>}
            <p
              contentEditable={isEditing}
              onInput={() => setUnsavedChanges(true)}
              suppressContentEditableWarning={true}
              className={`description ${
                isEditing
                  ? "bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600"
                  : ""
              }`}
            >
              {description}
            </p>
          </div>
          <div>
            {currentImageUrl !== "#" && (
              <div id={`images-${partNumber}`} className="flex justify-end">
                <img
                  src={currentImageUrl}
                  alt="Part"
                  className={`max-h-48 object-contain overflow-hidden ${
                    isEditing ? "" : "rounded-bl-lg"
                  }`}
                  onClick={() => setShowImageFull(true)}
                />
              </div>
            )}
            {isEditing && (
              <ImageUploadInventory
                partNumber={partNumber}
                setCurrentImageUrl={setCurrentImageUrl}
                setUnsavedChanges={setUnsavedChanges}
                handleSave={handleSave}
              />
            )}
          </div>
        </div>
        {isEditing && publicFacing === "yes" && (
          <div className="p-2 mt-5 text-gray-700 text-left">
            <p className="text-sm font-normal">Public-facing description:</p>

            <p
              contentEditable={isEditing && admin}
              onInput={() => setUnsavedChanges(true)}
              suppressContentEditableWarning={true}
              className={`name ${
                isEditing && admin
                  ? "bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600"
                  : ""
              }`}
            >
              {name}
            </p>
          </div>
        )}

        {isEditing && admin && (
          <div className="p-2 mt-2 text-gray-700 text-left">
            <div className="flex">
              <p>Category:</p>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setUnsavedChanges(true);
                }}
                className="outline-none font-bold focus:outline-none focus:ring-0 mx-1"
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}{" "}
                    {/* Capitalize the first letter */}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {isEditing && admin && (
          <div className="p-2 mt-2 text-gray-700 text-left">
            <div className="flex">
              <p>Is this public-facing inventory?</p>
              <select
                value={publicFacing}
                onChange={(e) => {
                  setPublicFacing(e.target.value);
                  setUnsavedChanges(true);
                }}
                className="publicFacingSelect outline-none font-bold focus:outline-none focus:ring-0 mx-1"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        )}
        {isEditing && admin && (
          <div className="p-2 mt-2 text-gray-700 text-left">
            <div className="flex">
              <p>Do we pay royalties on this?</p>
              <select
                value={royalties.toString()}
                onChange={(e) => {
                  const value = e.target.value === "true";
                  setRoyalties(value);
                  setUnsavedChanges(true);
                }}
                className="publicFacingSelect outline-none font-bold focus:outline-none focus:ring-0 mx-1"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="p-2 mt-2 text-gray-700 text-left">
            <div className="flex">
              <p>This is something that we</p>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setUnsavedChanges(true);
                }}
                className="buyBuildSelect outline-none font-bold focus:outline-none focus:ring-0 mx-1"
              >
                <option value="build">Build</option>
                <option value="buy">Buy</option>
              </select>
            </div>
          </div>
        )}
        {isEditing && type === "build" && (
          <div className="flex p-2 my-2 text-gray-700 text-left">
            <p>Stock the parts of this build?</p>
            <select
              value={partsInStock}
              onChange={(e) => {
                setStockParts(e.target.value.toLowerCase());
                setUnsavedChanges(true);
              }}
              className="stockPartsSelect outline-none font-bold focus:outline-none focus:ring-0 mx-1"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        )}

        <div
          className="grid grid-cols-3 px-2 mt-5"
          onDoubleClick={() => setIsEditing(true)}
        >
          <div className="p-2 text-gray-700 text-center border-r border-gray-100">
            <div>
              <b>Quantity</b>
            </div>
            <p
              contentEditable={isEditing}
              onInput={() => setUnsavedChanges(true)}
              suppressContentEditableWarning={true}
              className={`quantity ${
                isEditing
                  ? "bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600"
                  : ""
              }`}
            >
              {quantity}
            </p>
          </div>
          <div className="p-2 text-gray-700 text-center border-r border-gray-100">
            <div>
              <b>PAR level</b>
            </div>
            <p
              contentEditable={isEditing}
              onInput={() => setUnsavedChanges(true)}
              suppressContentEditableWarning={true}
              className={`parLevel ${
                isEditing
                  ? "bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600"
                  : ""
              }`}
            >
              {parLevel}
            </p>
          </div>
          <div className="p-2 text-gray-700 text-center">
            <div>
              <div>
                <b>Cost</b>
              </div>
              {isEditing && type === "buy" ? (
                <div className="flex justify-center items-center">
                  <p>$</p>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => {
                      setCost(parseFloat(e.target.value)); // Assuming you have a function to update the price
                      setUnsavedChanges(true);
                    }}
                    disabled={!isEditing || !admin}
                    className="bg-blue-100 text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <p>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(cost)}
                  </p>
                </div>
              )}
              {isEditing && type === "build" && (
                <p className="text-xs font-light text-center">from Breakdown</p>
              )}
            </div>
          </div>
          {category !== "Raw Material" ? (
            <div className="p-2 text-gray-700 text-center border-r border-t border-gray-100">
              <div>
                <b>Retail Price</b>
              </div>
              {isEditing && admin ? (
                <div className="flex justify-center items-center">
                  <p>$</p>
                  <input
                    type="number"
                    step="0.01"
                    value={retailPrice}
                    onChange={(e) => {
                      setRetailPrice(parseFloat(e.target.value)); // Assuming you have a function to update the price
                      setUnsavedChanges(true);
                    }}
                    disabled={!isEditing || !admin}
                    className="bg-blue-100 text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <p>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(retailPrice)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <RawMaterialsDiv measurements={measurements} isEditing={isEditing}/>
          )}
          {category !== "Raw Material" && (
            <div className="p-2 text-gray-700 text-center border-r border-t border-gray-100">
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
                      ? "bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 flex-grow"
                      : ""
                  }`}
                >
                  {weight}
                </p>
                <p>lbs</p>
              </div>
            </div>
          )}
          {category !== "Raw Material" && (
            <div className="p-2 text-gray-700 text-center border-t border-gray-100">
              <div>
                <b>Lead Time</b>
              </div>
              <div className="flex justify-center items-center">
                <p
                  contentEditable={isEditing}
                  onInput={() => setUnsavedChanges(true)}
                  suppressContentEditableWarning={true}
                  className={`leadTime ${
                    isEditing
                      ? "bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600 flex-grow"
                      : ""
                  }`}
                >
                  {leadTime}
                </p>
                <p>&nbsp;days</p>
              </div>
            </div>
          )}
        </div>

        {isEditing && admin && category !== "Raw Material" && (
          <div>
            <div className="text-center text-gray-700 p-2">
              Dynamic Retail Price: <b>${(cost * 3.5).toFixed(2)}</b>
            </div>

            <div className="p-2 text-gray-700 flex justify-center items-center">
              <div className="flex">
                <p>Set the Retail Price</p>
                <select
                  value={dynamicPricing}
                  onChange={(e) => {
                    setDynamicPricing(e.target.value);
                    setUnsavedChanges(true);
                  }}
                  className="dynamicPricing outline-none font-bold focus:outline-none focus:ring-0 mx-1"
                >
                  <option value="dynamic">dynamically</option>
                  <option value="manual">manually</option>
                </select>
              </div>
            </div>
          </div>
        )}


        {isEditing && (
          <div className="col-span-3">
            <div className="border-t border-gray-100 text-gray-700 p-2 text-center">
              <PdfUploadEdit
                partNumber={partNumber}
                onHide={(fileName) => handleHidePdfUpload(fileName)}
              />
              {docFileName && <p>File: {docFileName}</p>}
            </div>
          </div>
        )}
        {isEditing && (
          <div className="border-t border-gray-100 py-2">
            <p className="text-center font-bold tracking-tight">
              Additional Files
            </p>
            <p className="text-center w-full p-2 italic text-gray-500">
              Note: you can add multiple files at once.
            </p>

            <ul className="p-2">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="space-x-2 py-1">
                  <button onClick={() => downloadFile(file.name)}>
                    {file.name}
                  </button>

                  <button
                    onClick={() => removeUrl(file.url)}
                    className="py-1 px-2 text-sm bg-gray-600 text-white rounded-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <FileUpload
              partNumber={partNumber}
              onFilesUpdated={handleFileUpload}
            />
          </div>
        )}
        {type.toLowerCase() === "buy" && showVendors && (
          <div className="text-gray-700 text-center">
            <div>
              <div className="font-medium">
                <div
                  className="flex justify-center items-center px-2 text-gray-600 border-b border-t border-gray-100 py-1"
                  onDoubleClick={() => setIsEditing(true)}
                >
                  <div>
                    <div className="md:flex">
                      <p className="font-light">Manufacturer:&nbsp;</p>
                      <input
                        type="text"
                        value={manufacturer}
                        disabled={isEditing === false}
                        onChange={(e) => setManufacturer(e.target.value)}
                        className={`mb-1 rounded-md ${
                          isEditing &&
                          "bg-blue-100 border border-blue-300 text-blue-600 rounded-lg px-1"
                        }`}
                      />
                    </div>
                    <div className="md:flex">
                      <p className="font-light">
                        Manufacturer part number:&nbsp;
                      </p>
                      <input
                        type="text"
                        value={manufactPartNum}
                        disabled={!isEditing}
                        onChange={(e) => setManufactPartNum(e.target.value)}
                        className={`rounded-md ${
                          isEditing &&
                          "bg-blue-100 border border-blue-300 text-blue-600 rounded-lg px-1"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full vendorParent bg-gray-50">
                  {vendors.map((vendor, index) => (
                    <div key={index} className="vendor">
                      <div
                        className={`p-2 border-b border-gray-200 bg-white`}
                        onDoubleClick={() => setEditableVendorIndex(index)}
                      >
                        <div className="grid grid-cols-3 gap-1">
                          <div className="flex justify-center items-center">
                            <CompanyLogoOrder
                              companyName={vendor.vUrl?.split("/")[2] || ""}
                            />
                          </div>
                          <div className="flex justify-start text-left items-center font-light text-sm col-span-2">
                            <div
                              className={`w-full ${
                                editableVendorIndex === index ? "space-y-1" : ""
                              }`}
                            >
                              <h3 className="font-semibold">{vendor.vName}</h3>
                              {editableVendorIndex === index && (
                                <p>Link, email or phone:</p>
                              )}
                              {editableVendorIndex === index && (
                                <input
                                  type="tet"
                                  value={vendor.vUrl}
                                  onChange={(e) => {
                                    handleVendorChange(
                                      index,
                                      "vUrl",
                                      e.target.value
                                    );
                                    setIsEditing(true);
                                  }}
                                  className="bg-blue-100 text-blue-600 border-blue-300 border px-1 rounded-lg w-full"
                                />
                              )}
                              {editableVendorIndex === index && (
                                <p>Vendor&apos;s part number:</p>
                              )}
                              {editableVendorIndex === index ? (
                                <input
                                  type="text"
                                  value={vendor.vPartNumber}
                                  onChange={(e) => {
                                    handleVendorChange(
                                      index,
                                      "vPartNumber",
                                      e.target.value
                                    );
                                    setIsEditing(true);
                                  }}
                                  className="bg-blue-100 text-blue-600 border-blue-300 border px-1 rounded-lg w-full"
                                />
                              ) : (
                                <p>{vendor?.vPartNumber}</p>
                              )}
                              <div className="flex pt-1">
                                <p>Cost: $</p>
                                {editableVendorIndex === index ? (
                                  <input
                                    type="number"
                                    value={vendor.vCost}
                                    onChange={(e) => {
                                      handleVendorChange(
                                        index,
                                        "vCost",
                                        parseFloat(e.target.value)
                                      );
                                      setIsEditing(true);
                                    }}
                                    className="bg-blue-100 text-blue-600 border-blue-300 border px-1 rounded-lg flex-grow"
                                  />
                                ) : (
                                  <p>{vendor?.vCost}</p>
                                )}
                              </div>
                              <div className="flex pt-1">
                                <p className="pr-1">Lead time:</p>
                                {editableVendorIndex === index ? (
                                  <input
                                    type="number"
                                    value={vendor.vLeadTime}
                                    onChange={(e) => {
                                      handleVendorChange(
                                        index,
                                        "vLeadTime",
                                        parseInt(e.target.value)
                                      );
                                      setIsEditing(true);
                                    }}
                                    className="bg-blue-100 text-blue-600 border-blue-300 border px-1 rounded-lg flex-grow"
                                  />
                                ) : (
                                  <p>{vendor?.vLeadTime}</p>
                                )}
                                <p className="px-1">days</p>
                              </div>

                              {editableVendorIndex === index && (
                                <div>
                                  <p>Preferred payment method:</p>
                                  <select
                                    className="vPaymentMethod bg-blue-100 text-blue-600 focus:outline-blue-600 rounded-md px-2 py-1 border border-blue-600"
                                    value={vendor.vPaymentMethod}
                                    onChange={(e) => {
                                      handleVendorChange(
                                        index,
                                        "vPaymentMethod",
                                        e.target.value
                                      );
                                      setIsEditing(true);
                                    }}
                                  >
                                    <option value="Credit Card">
                                      Credit Card
                                    </option>
                                    <option value="Account">Account</option>
                                    <option value="Cash or Check">
                                      Cash or Check
                                    </option>
                                    <option value="ACH or Wire">
                                      ACH or Wire
                                    </option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {editableVendorIndex === index && !removeButton && (
                        <div>
                          {!isEditing && (
                            <button
                              onClick={() => {
                                setEditableVendorIndex(null);
                              }}
                              className="w-full bg-purple-600 text-white text-center py-px"
                            >
                              Exit without saving
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setRemoveButton(true);
                            }}
                            className="w-full bg-rose-600 text-white text-center py-px"
                          >
                            Remove Vendor
                          </button>
                        </div>
                      )}
                      {editableVendorIndex === index && removeButton && (
                        <p className="w-full text-center py-1 font-light">
                          Do you really want to remove {vendor.vName}?
                        </p>
                      )}
                      {editableVendorIndex === index && removeButton && (
                        <div className="grid grid-cols-2 border-t border-b border-gray-200">
                          <button
                            className="py-px"
                            onClick={() => setRemoveButton(false)}
                          >
                            No
                          </button>
                          <button
                            className="bg-rose-600 text-white py-px"
                            onClick={() => {
                              setIsEditing(true);
                              setRemoveButton(false);
                              setEditableVendorIndex(null);
                              removeVendor(index);
                            }}
                          >
                            Yes
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    className="py-1 bg-white w-full"
                    onClick={() => toggleShowAddVendorDiv()}
                  >
                    {showAddVendorDiv ? "Hide Vendor list" : "+ Vendor"}
                  </button>

                  {showAddVendorDiv && (
                    <div className="border-t bg-white border-gray-200">
                      <VendorSearch handleAddVendor={handleAddVendor} />
                      <div className="text-center bg-gray-50 text-gray-600 space-y-2 py-4">
                        <p className="font-light px-2">
                          If you can&apos;t find a Vendor on the list, with
                          chatGPT, or Google&apos;s reverse image search, try
                          emailing
                        </p>
                        <p>
                          <a href="mailto:dave@boretec.com">Dave Gasmovic</a>
                        </p>
                        <p>
                          <a href="mailto:pheath@vermeer.com">Phillip at McL</a>
                        </p>
                        <p>
                          <a href="mailto:lsims@carolinabelting.com, shall@carolinabelting.com">
                            Lemar at Carolina Belting
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex text-xs px-1 justify-end text-gray-500 mt-2 font-thin">
            {admin ? (
              <p>
                <span className="font-normal">{editorToDisplay()}</span> made
                changes on <span className="font-normal">{editDateTime}</span>
              </p>
            ) : (
              <p>
                Updated <span className="font-normal">{editDateTime}</span>
              </p>
            )}
          </div>
        )}

        {isEditing && (
          <div>
            <div
              className="bg-blue-600 text-white border-b border-white text-center px-2 py-4 cursor-pointer"
              onClick={() => handleSave()}
            >
              Save
            </div>
            <div
              className="bg-purple-700 text-white border-b border-white text-center px-2 py-3 cursor-pointer"
              onClick={() => {
                setIsEditing(false);
                setShowBreakdownSave(false);
                setShowBreakdown(false);
                scrollUp();
                setShowVendors(false);
              }}
            >
              Exit Without Saving
            </div>
            {admin && (
              <div
                className="admin bg-rose-600 text-center text-white px-2 py-2 border-b border-white cursor-pointer"
                onClick={verifyDelete}
              >
                <p>Remove Item</p>
              </div>
            )}
          </div>
        )}
        {uploadedFiles.length > 0 && (
          <div className="bg-black text-white text-center font-medium w-full py-1 border-b border-white">
            {!showAdditionalFiles && (
              <button onClick={() => setShowAdditionalFiles(true)}>
                Additional Files
              </button>
            )}
            {showAdditionalFiles && (
              <button onClick={() => setShowAdditionalFiles(false)}>
                Hide Additional Files
              </button>
            )}
          </div>
        )}
        {showAdditionalFiles && (
          <div>
            <ul className="p-2">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="py-1">
                  <button onClick={() => downloadFile(file.name)}>
                    {file.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {showBreakdownSave && !isEditing && (
          <div>
            <div
              className="bg-blue-600 text-white border-b border-white text-center px-2 py-4 cursor-pointer"
              onClick={() => {
                handleSave();
                setShowBreakdownSave(false);
              }}
            >
              Save Breakdown Changes
            </div>
            <div
              className="bg-purple-700 text-white border-b border-white text-center px-2 py-3 cursor-pointer"
              onClick={() => {
                setUnsavedChanges(false);
                setShowBreakdownSave(false);
              }}
            >
              Exit without saving
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 bg-black text-white text-center font-medium">
          {type === "build" ? (
            <div>
              {items.length > 0 ? (
                <div
                  className={`w-full py-1 border-r border-gray-50 cursor-pointer`}
                  onClick={() => {
                    setShowBreakdown(!showBreakdown);
                  }}
                >
                  {!showBreakdown ? "Breakdown" : "Hide Breakdown"}
                </div>
              ) : (
                <div
                  className="w-full py-1 bg-gray-500 border-r border-gray-50 cursor-pointer"
                  onClick={() => {
                    setShowBreakdown(true);
                    setShowEditBreakdown(true);
                  }}
                >
                  Breakdown
                </div>
              )}
            </div>
          ) : (
            <div
              className={`w-full py-1 ${
                vendors.length === 0 ? "bg-gray-500" : "cursor-pointer"
              } ${
                docFileName && docFileName.toLowerCase().includes(".pdf")
                  ? "border-r border-gray-50"
                  : "col-span-2"
              }`}
            >
              <button
                className="w-full"
                onClick={() => setShowVendors(!showVendors)}
              >
                {showVendors ? "Hide Vendors" : "Show Vendors"}
              </button>
            </div>
          )}

          <div
            className={`w-full py-1 cursor-pointer ${
              docFileName === null ? "bg-gray-500" : ""
            } ${docFileName === null && type === "buy" ? "hidden" : ""}`}
          >
            {docFileName ? (
              <PdfViewer fileName={docFileName} />
            ) : (
              <div onClick={() => setIsEditing(true)}>Add Drawings</div>
            )}
          </div>
          <div className="col-span-2">
            {showBreakdown && (
              <div>
                {!showEditBreakdown && items.length > 0 && (
                  <div
                    className="bg-white text-gray-600 py-1 border-t border-gray-200"
                    onDoubleClick={() => setShowEditBreakdown(true)}
                  >
                    <div className="flex justify-between px-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox accent-black"
                          checked={breakdownInProgress}
                          onChange={handleProgressToggle}
                        />
                        <span className="ml-2 font-light text-xs text-center py-1">
                          Breakdown in Progress
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox accent-black"
                          checked={rAndD}
                          onChange={handleRAndDToggle}
                        />
                        <span className="ml-2 font-light text-xs text-center py-1">
                          R&D
                        </span>
                      </label>
                    </div>
                    <p className="font-light text-xs text-center py-1">
                      Double click to edit.
                    </p>
                    <table className="leading-normal w-full text-center mt-2 py-4">
                      <thead>
                        <tr className="text-center">
                          <th>Needed</th>
                          <th>Stock</th>
                          {/*<th></th>*/}
                          <th>Part Number - Description</th>
                          <th>Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => {
                          return (
                            <tr
                              className={`h-12 border-gray-200 border-t `}
                              key={index}
                            >
                              <td className="px-1">{item.quantityNeeded}</td>
                              <td
                                className={`px-1 ${
                                  item.quantityNeeded > item.quantity
                                    ? "bg-purple-700 text-white"
                                    : "bg-gray-100"
                                }`}
                              >
                                {item.quantity}
                              </td>
                              {/* <td className="px-1 w-20">
                                {item.images !==
                                  'https://boretec.com/images/image-coming-soon.png' && (
                                  <img
                                    className="rounded-md h-12"
                                    src={item.images}
                                  />
                                )}
                              </td>*/}
                              <td className="px-1">
                                {item.partNumber} - {item.description}
                              </td>
                              <td className="px-1">
                                {!item.partNumber.includes("Shop") && (
                                  <p>
                                    {new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                    }).format(item.cost * item.quantityNeeded)}
                                  </p>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="text-right font-bold w-full py-1 border-t border-gray-200 px-2">
                      Total cost:{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(breakdownCost)}
                    </p>
                  </div>
                )}

                {showEditBreakdown && (
                  <InventorySearchBreakdown
                    handleAddItems={handleInventoryClick}
                    itemsProp={items}
                    allItems={allItems}
                    onClose={onClose}
                    excludePartNumber={partNumber}
                  />
                )}
              </div>
            )}
          </div>
          {!showEditBreakdown && (
            <div
              className="w-full py-1 border-t col-span-2 border-gray-50 cursor-pointer"
              onClick={() => setShowOrderBuild(true)}
            >
              {type === "build" ? (
                <button>Add to Build List</button>
              ) : (
                <button>Add to Order List</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCardEditable;
