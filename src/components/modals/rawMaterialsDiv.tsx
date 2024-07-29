

import { InvokeCommand, type InvokeCommandInput } from "@aws-sdk/client-lambda";
import { lambdaClient } from "../../lib/amazon";
import React, { useState, useEffect } from "react";

interface Measurements {
  manufacturedLength: number | null;
  manufacturedWidth: number | null;
  manufacturedHeight: number | null;
  manufacturedThickness: number | null;
  manufacturedDiameter: number | null;
  manufacturedLeg1: number | null;
  manufacturedLeg2: number | null;
  rawMaterialType: string | null;
  supplierUnit: string | null;
  manufacturedUnit: string | null;
  convertedItemNumber: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  thickness: number | null;
  diameter: number | null;
  leg1: number | null;
  leg2: number | null;
}

interface InheritedProps {
  measurements: string;
  isEditing: boolean;
}

const RawMaterialsDiv: React.FC<InheritedProps> = ({ measurements, isEditing }) => {
  const [length, setLength] = useState<number | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [thickness, setThickness] = useState<number | null>(null);
  const [diameter, setDiameter] = useState<number | null>(null);
  const [leg1, setLeg1] = useState<number | null>(null);
  const [leg2, setLeg2] = useState<number | null>(null);
  const [manufacturedLength, setManufacturedLength] = useState<number | null>(null);
  const [manufacturedWidth, setManufacturedWidth] = useState<number | null>(null);
  const [manufacturedHeight, setManufacturedHeight] = useState<number | null>(null);
  const [manufacturedThickness, setManufacturedThickness] = useState<number | null>(null);
  const [manufacturedDiameter, setManufacturedDiameter] = useState<number | null>(null);
  const [manufacturedLeg1, setManufacturedLeg1] = useState<number | null>(null);
  const [manufacturedLeg2, setManufacturedLeg2] = useState<number | null>(null);
  const [rawMaterialType, setRawMaterialType] = useState<string>("rectangular plate");
  const [supplierUnit, setSupplierUnit] = useState<string>("in");
  const [manufacturedUnit, setManufacturedUnit] = useState<string>("in");
  const [convertedItemNumber, setConvertedItemNumber] = useState<number | null>(null);
  const [manufacturedCalculatedWeight, setManufacturedCalculatedWeight] = useState<number | null>(null);
  const [calculatedWeight, setCalculatedWeight] = useState<number | null>(null);

  useEffect(() => {
    if (measurements) {
      const measurementsJSON: Measurements = JSON.parse(measurements);

      setLength(measurementsJSON.length ?? null);
      setWidth(measurementsJSON.width ?? null);
      setHeight(measurementsJSON.height ?? null);
      setThickness(measurementsJSON.thickness ?? null);
      setDiameter(measurementsJSON.diameter ?? null);
      setLeg1(measurementsJSON.leg1 ?? null);
      setLeg2(measurementsJSON.leg2 ?? null);
      setManufacturedLength(measurementsJSON.manufacturedLength ?? null);
      setManufacturedWidth(measurementsJSON.manufacturedWidth ?? null);
      setManufacturedHeight(measurementsJSON.manufacturedHeight ?? null);
      setManufacturedThickness(measurementsJSON.manufacturedThickness ?? null);
      setManufacturedDiameter(measurementsJSON.manufacturedDiameter ?? null);
      setManufacturedLeg1(measurementsJSON.manufacturedLeg1 ?? null);
      setManufacturedLeg2(measurementsJSON.manufacturedLeg2 ?? null);
      setRawMaterialType(measurementsJSON.rawMaterialType ?? "rectangular plate");
      setSupplierUnit(measurementsJSON.supplierUnit ?? "in");
      setManufacturedUnit(measurementsJSON.manufacturedUnit ?? "in");
      setConvertedItemNumber(measurementsJSON.convertedItemNumber ?? null);
    }
  }, [measurements]);

  useEffect(() => {
    const STEEL_DENSITY = 0.2836; // pounds per cubic inch
  
    const calculateVolume = (
      type: string,
      length: number | null,
      width: number | null,
      thickness: number | null,
      diameter: number | null,
      leg1: number | null,
      leg2: number | null
    ) => {
      switch (type) {
        case "rectangular plate":
          return length && width && thickness ? length * width * thickness : null;
        case "round tubing":
          return diameter && thickness && length
            ? Math.PI * Math.pow(diameter / 2, 2) * length * thickness
            : null;
        case "rectangular tubing":
          return length && width && thickness ? (2 * length + 2 * width) * thickness : null;
        case "angle iron":
          return leg1 && leg2 && thickness ? leg1 * thickness + leg2 * thickness : null;
        default:
          return null;
      }
    };
  
    const convertToInches = (value: number | null, unit: string) => {
      if (value === null) return null;
      switch (unit) {
        case "ft":
          return value * 12;
        case "cm":
          return value * 0.393701;
        case "m":
          return value * 39.3701;
        default:
          return value;
      }
    };
  
    const convertToCubicInches = (volume: number | null, unit: string) => {
      if (volume === null) return null;
      switch (unit) {
        case "ft":
          return volume * Math.pow(12, 3); // cubic feet to cubic inches
        case "cm":
          return volume * Math.pow(0.393701, 3); // cubic centimeters to cubic inches
        case "m":
          return volume * Math.pow(39.3701, 3); // cubic meters to cubic inches
        default:
          return volume;
      }
    };
  
    const supplierLength = convertToInches(length, supplierUnit);
    const supplierWidth = convertToInches(width, supplierUnit);
    const supplierThickness = convertToInches(thickness, supplierUnit);
    const supplierDiameter = convertToInches(diameter, supplierUnit);
    const supplierLeg1 = convertToInches(leg1, supplierUnit);
    const supplierLeg2 = convertToInches(leg2, supplierUnit);
  
    const manufacturedLengthInches = convertToInches(manufacturedLength, manufacturedUnit);
    const manufacturedWidthInches = convertToInches(manufacturedWidth, manufacturedUnit);
    const manufacturedThicknessInches = convertToInches(manufacturedThickness, manufacturedUnit);
    const manufacturedDiameterInches = convertToInches(manufacturedDiameter, manufacturedUnit);
    const manufacturedLeg1Inches = convertToInches(manufacturedLeg1, manufacturedUnit);
    const manufacturedLeg2Inches = convertToInches(manufacturedLeg2, manufacturedUnit);
  
    let supplierVolume = calculateVolume(
      rawMaterialType,
      supplierLength,
      supplierWidth,
      supplierThickness,
      supplierDiameter,
      supplierLeg1,
      supplierLeg2
    );
  
    let manufacturedVolume = calculateVolume(
      rawMaterialType,
      manufacturedLengthInches,
      manufacturedWidthInches,
      manufacturedThicknessInches,
      manufacturedDiameterInches,
      manufacturedLeg1Inches,
      manufacturedLeg2Inches
    );
  
    // Convert volumes to cubic inches if needed
    supplierVolume = convertToCubicInches(supplierVolume, supplierUnit);
    manufacturedVolume = convertToCubicInches(manufacturedVolume, manufacturedUnit);
  
    if (supplierVolume && manufacturedVolume) {
      setConvertedItemNumber(supplierVolume / manufacturedVolume);
      setCalculatedWeight(supplierVolume * STEEL_DENSITY);
      setManufacturedCalculatedWeight(manufacturedVolume * STEEL_DENSITY);
    } else {
      setConvertedItemNumber(null);
      setCalculatedWeight(null);
      setManufacturedCalculatedWeight(null);
    }
  }, [
    rawMaterialType,
    length,
    width,
    thickness,
    diameter,
    leg1,
    leg2,
    manufacturedLength,
    manufacturedWidth,
    manufacturedThickness,
    manufacturedDiameter,
    manufacturedLeg1,
    manufacturedLeg2,
    supplierUnit,
    manufacturedUnit,
  ]);


  return (
    <div className="col-span-3">
      {isEditing ? (
        <div className="border-gray-100 text-gray-700">
          <p className="text-center py-1 bg-gray-100 rounded-md mb-2">
            Raw material type
          </p>
          <select
            value={rawMaterialType}
            onChange={(e) => setRawMaterialType(e.target.value)}
            className="text-center outline-none font-bold focus:outline-none focus:ring-0 w-full mb-4"
          >
            <option value="rectangular plate">Rectangular Plate</option>
            <option value="round tubing">Round Tubing</option>
            <option value="rectangular tubing">Rectangular Tubing</option>
            <option value="angle iron">Angle Iron</option>
          </select>
  
          <p className="text-center py-1 bg-gray-100 rounded-md">
            Supplier measurements
          </p>
          <div className={`grid ${rawMaterialType === "rectangular tubing" ? "grid-cols-4" : rawMaterialType === "round tubing" ? "grid-cols-3" : "grid-cols-3"}`}>
            {rawMaterialType === "rectangular plate" && (
              <>
                <div className="p-2 text-center font-bold">
                  Length
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={length !== null ? length.toString() : ""}
                    onChange={(e) => setLength(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Width
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={width !== null ? width.toString() : ""}
                    onChange={(e) => setWidth(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Thickness
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={thickness !== null ? thickness.toString() : ""}
                    onChange={(e) => setThickness(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </>
            )}
            {rawMaterialType === "round tubing" && (
              <>
                <div className="p-2 text-center font-bold">
                  Diameter
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={diameter !== null ? diameter.toString() : ""}
                    onChange={(e) => setDiameter(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Length
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={length !== null ? length.toString() : ""}
                    onChange={(e) => setLength(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Thickness
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={thickness !== null ? thickness.toString() : ""}
                    onChange={(e) => setThickness(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </>
            )}
            {rawMaterialType === "rectangular tubing" && (
              <>
                <div className="p-2 text-center font-bold">
                  Length
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={length !== null ? length.toString() : ""}
                    onChange={(e) => setLength(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Width
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={width !== null ? width.toString() : ""}
                    onChange={(e) => setWidth(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Height
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={height !== null ? height.toString() : ""}
                    onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Thickness
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={thickness !== null ? thickness.toString() : ""}
                    onChange={(e) => setThickness(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </>
            )}
            {rawMaterialType === "angle iron" && (
              <>
                <div className="p-2 text-center font-bold">
                  Leg1
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={leg1 !== null ? leg1.toString() : ""}
                    onChange={(e) => setLeg1(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Leg2
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={leg2 !== null ? leg2.toString() : ""}
                    onChange={(e) => setLeg2(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Thickness
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={thickness !== null ? thickness.toString() : ""}
                    onChange={(e) => setThickness(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex space-x-2 mb-4">
            <p className="px-2 text-sm text-nowrap">
              calculated weight:{" "}{calculatedWeight?.toFixed(2)} lbs.
            </p>
            <select
              value={supplierUnit}
              onChange={(e) => setSupplierUnit(e.target.value)}
              className="text-right outline-none font-bold focus:outline-none focus:ring-0 w-full"
            >
              <option value="in">measured in inches (in)</option>
              <option value="ft">measured in feet (ft)</option>
              <option value="cm">measured in centimeters (cm)</option>
              <option value="m">measured in meters (m)</option>
            </select>
          </div>
  
          <p className="text-center py-1 bg-gray-100 rounded-md">
            Boretec measurements
          </p>
          <div className={`grid ${rawMaterialType === "rectangular tubing" ? "grid-cols-4" : rawMaterialType === "round tubing" ? "grid-cols-3" : "grid-cols-3"}`}>
            {rawMaterialType === "rectangular plate" && (
              <>
                <div className="p-2 text-center font-bold">
                Length
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedLength !== null ? manufacturedLength.toString() : ""}
                    onChange={(e) => setManufacturedLength(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Width
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedWidth !== null ? manufacturedWidth.toString() : ""}
                    onChange={(e) => setManufacturedWidth(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Thickness
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedThickness !== null ? manufacturedThickness.toString() : ""}
                    onChange={(e) => setManufacturedThickness(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </>
            )}
            {rawMaterialType === "round tubing" && (
              <>
                <div className="p-2 text-center font-bold">
                  Diameter
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedDiameter !== null ? manufacturedDiameter.toString() : ""}
                    onChange={(e) => setManufacturedDiameter(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Length
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedLength !== null ? manufacturedLength.toString() : ""}
                    onChange={(e) => setManufacturedLength(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Thickness
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedThickness !== null ? manufacturedThickness.toString() : ""}
                    onChange={(e) => setManufacturedThickness(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </>
            )}
            {rawMaterialType === "rectangular tubing" && (
              <>
                <div className="p-2 text-center font-bold">
                  Length
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedLength !== null ? manufacturedLength.toString() : ""}
                    onChange={(e) => setManufacturedLength(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Width
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedWidth !== null ? manufacturedWidth.toString() : ""}
                    onChange={(e) => setManufacturedWidth(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Height
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedHeight !== null ? manufacturedHeight.toString() : ""}
                    onChange={(e) => setManufacturedHeight(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Thickness
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedThickness !== null ? manufacturedThickness.toString() : ""}
                    onChange={(e) => setManufacturedThickness(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </>
            )}
            {rawMaterialType === "angle iron" && (
              <>
                <div className="p-2 text-center font-bold">
                  Leg1
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedLeg1 !== null ? manufacturedLeg1.toString() : ""}
                    onChange={(e) => setManufacturedLeg1(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Leg2
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedLeg2 !== null ? manufacturedLeg2.toString() : ""}
                    onChange={(e) => setManufacturedLeg2(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="p-2 text-center font-bold">
                  Thickness
                  <input
                    className="bg-blue-100 font-normal text-blue-600 focus:outline-blue-600 text-center rounded-md px-2 py-1 border border-blue-600 w-full"
                    type="number"
                    value={manufacturedThickness !== null ? manufacturedThickness.toString() : ""}
                    onChange={(e) => setManufacturedThickness(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </>
            )}
          </div>
        
        <div className="flex space-x-2 mb-4">
          <p className="px-2 text-sm text-nowrap">
            calculated weight:{" "}{manufacturedCalculatedWeight?.toFixed(2)} lbs.
          </p>
          <select
            value={manufacturedUnit}
            onChange={(e) => setManufacturedUnit(e.target.value)}
            className="text-right outline-none font-bold focus:outline-none focus:ring-0 w-full"
          >
            <option value="in">measured in inches (in)</option>
            <option value="ft">measured in feet (ft)</option>
            <option value="cm">measured in centimeters (cm)</option>
            <option value="m">measured in meters (m)</option>
          </select>
        </div>
        
      </div>
    ) : (
      <div className="text-center">
        <p className="py-1 bg-gray-100 rounded-md">
          Supplier measurements
        </p>
        <div className={`grid ${rawMaterialType === "rectangular tubing" ? "grid-cols-4" : rawMaterialType === "round tubing" ? "grid-cols-3" : "grid-cols-3"}`}>
          {rawMaterialType === "rectangular plate" && (
            <>
              <div className="border-r p-2">
                <p className="font-bold">Length</p>
                <p>{length} {supplierUnit}</p>
              </div>
              <div className="border-r p-2">
                <p className="font-bold">Width</p>
                <p>{width} {supplierUnit}</p>
              </div>
              <div className="p-2">
                <p className="font-bold">Thickness</p>
                <p>{thickness} {supplierUnit}</p>
              </div>
            </>
          )}
          {rawMaterialType === "round tubing" && (
            <>
              <div className="border-r p-2">
                <p className="font-bold">Diameter</p>
                <p>{diameter} {supplierUnit}</p>
              </div>
              <div className="border-r p-2">
                <p className="font-bold">Length</p>
                <p>{length} {supplierUnit}</p>
              </div>
              <div className="p-2">
                <p className="font-bold">Thickness</p>
                <p>{thickness} {supplierUnit}</p>
              </div>
            </>
          )}
          {rawMaterialType === "rectangular tubing" && (
            <>
              <div className="border-r p-2">
                <p className="font-bold">Length</p>
                <p>{length} {supplierUnit}</p>
              </div>
              <div className="border-r p-2">
                <p className="font-bold">Width</p>
                <p>{width} {supplierUnit}</p>
              </div>
              <div className="border-r p-2">
                <p className="font-bold">Height</p>
                <p>{height} {supplierUnit}</p>
              </div>
              <div className="p-2">
                <p className="font-bold">Thickness</p>
                <p>{thickness} {supplierUnit}</p>
              </div>
            </>
          )}
          {rawMaterialType === "angle iron" && (
            <>
              <div className="border-r p-2">
                <p className="font-bold">Leg1</p>
                <p>{leg1} {supplierUnit}</p>
              </div>
              <div className="border-r p-2">
                <p className="font-bold">Leg2</p>
                <p>{leg2} {supplierUnit}</p>
              </div>
              <div className="p-2">
                <p className="font-bold">Thickness</p>
                <p>{thickness} {supplierUnit}</p>
              </div>
            </>
          )}
        </div>

        <p className="text-center py-1 bg-gray-100 rounded-md">
          Boretec measurements
        </p>
        <div className={`grid ${rawMaterialType === "rectangular plate" || rawMaterialType === "rectangular tubing" ? "grid-cols-3" : rawMaterialType === "round tubing" ? "grid-cols-3" : "grid-cols-3"}`}>
          {rawMaterialType === "rectangular plate" && (
            <>
              <div className="border-r p-2">
                <p className="font-bold">Length</p>
                <p>{manufacturedLength} {manufacturedUnit}</p>
              </div>
              <div className="border-r p-2">
                <p className="font-bold">Width</p>
                <p>{manufacturedWidth} {manufacturedUnit}</p>
              </div>
              <div className="p-2">
                <p className="font-bold">Thickness</p>
                <p>{manufacturedThickness} {manufacturedUnit}</p>
              </div>
            </>
          )}
          {rawMaterialType === "round tubing" && (
            <>
              <div className="border-r p-2">
                <p className="font-bold">Diameter</p>
                <p>{manufacturedDiameter} {manufacturedUnit}</p>
              </div>
              <div className="border-r p-2">
                <p className="font-bold">Length</p>
                <p>{manufacturedLength} {manufacturedUnit}</p>
              </div>
              <div className="p-2">
                <p className="font-bold">Thickness</p>
                <p>{manufacturedThickness} {manufacturedUnit}</p>
              </div>
            </>
          )}
          {rawMaterialType === "rectangular tubing" && (
            <>
              <div className="border-r p-2">
                <p className="font-bold">Length</p>
                <p>{manufacturedLength} {manufacturedUnit}</p>
              </div>
              <div className="border-r p-2">
                <p className="font-bold">Width</p>
                <p>{manufacturedWidth} {manufacturedUnit}</p>
              </div>
              <div className="border-r p-2">
                <p className="font-bold">Height</p>
                <p>{manufacturedHeight} {manufacturedUnit}</p>
              </div>
              <div className="p-2">
                <p className="font-bold">Thickness</p>
                <p>{manufacturedThickness} {manufacturedUnit}</p>
              </div>
            </>
          )}
          {rawMaterialType === "angle iron" && (
            <>
              <div className="border-r p-2">
                <p className="font-bold">Leg1</p>
                <p>{manufacturedLeg1} {manufacturedUnit}</p>
              </div>
              <div className="border-r p-2">
                <p className="font-bold">Leg2</p>
                <p>{manufacturedLeg2} {manufacturedUnit}</p>
              </div>
              <div className="p-2">
                <p className="font-bold">Thickness</p>
                <p>{manufacturedThickness} {manufacturedUnit}</p>
              </div>
            </>
          )}
        </div>

      </div>
    )}
    <p className="py-1 px-2 text-center bg-gray-100 rounded-md mb-2">
      1 supplier item &rarr; {convertedItemNumber?.toFixed(2)} Boretec items
    </p>
  </div>
);
}


export default RawMaterialsDiv;