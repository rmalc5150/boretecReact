import React, { useState } from 'react';

interface CheckBoxesProps<T> {
  handleToggleCheck: (equipment: T[]) => void;
  equipment: T[];
}

const CheckBoxes = <T extends { id: number; name: string; checked: boolean }>({
  handleToggleCheck,
  equipment,
}: CheckBoxesProps<T>) => {
  const findEquipmentCheckedState = (id: number): boolean => {
    // Find the equipment item by id
    const item = equipment.find(equip => equip.id === id);
    // Return the checked state if found, otherwise false
    return item ? item.checked : false;
  };
  const [machines, setMachines] = useState<T[]>([
    { id: 1, name: `McL 10H`, checked: findEquipmentCheckedState(1) } as T,
    { id: 2, name: `McL 20 & 20B`, checked: false } as T,
    { id: 3, name: `McL 24B & C`, checked: false } as T,
    { id: 4, name: `McL 36/42B & C`, checked: false } as T,
    { id: 5, name: `McL 48 CBM`, checked: false } as T,
    { id: 6, name: `McL 54/60`, checked: false } as T,
    { id: 7, name: `McL Workhorse`, checked: false } as T,
  ]);

  const [steeringHeads, setSteeringHeads] = useState<T[]>([
    { id: 8, name: `12"`, checked: false } as T,
    { id: 9, name: `16"`, checked: false } as T,
    { id: 10, name: `18"`, checked: false } as T,
    { id: 11, name: `20"`, checked: false } as T,
    { id: 12, name: `24"`, checked: false } as T,
    { id: 13, name: `30"`, checked: false } as T,
    { id: 14, name: `36"`, checked: false } as T,
    { id: 15, name: `42"`, checked: false } as T,
    { id: 16, name: `48"`, checked: false } as T,
    { id: 17, name: `54"`, checked: false } as T,
    { id: 18, name: `60"`, checked: false } as T,
    { id: 19, name: `RUSH`, checked: false } as T,
  ]);

  const [cuttingHeads, setCuttingHeads] = useState<T[]>([
    { id: 20, name: `Combo`, checked: false } as T,
    { id: 21, name: `Rock`, checked: false } as T,
    { id: 22, name: `XTRM`, checked: false } as T,
    { id: 23, name: `Roller`, checked: false } as T,
    { id: 24, name: `Disc`, checked: false } as T,

  ]);

  const [otsCuttingHeads, setOtsCuttingHeads] = useState<T[]>([
    { id: 25, name: `Combo`, checked: false } as T,
    { id: 26, name: `Rock`, checked: false } as T,
    { id: 27, name: `XTRM`, checked: false } as T,
    { id: 28, name: `Roller`, checked: false } as T,
    { id: 29, name: `Disc`, checked: false } as T,

  ]);
  const [tbms, setTbms] = useState<T[]>([
    { id: 30, name: `54"`, checked: false } as T,
    { id: 31, name: `60"`, checked: false } as T,
    { id: 32, name: `66"`, checked: false } as T,
    { id: 33, name: `72"`, checked: false } as T,
    { id: 34, name: `84"`, checked: false } as T,

  ]);
  const [allItems, setAllItems] = useState<T[]>(equipment)

  const handleCheckboxChange = (id: number, type: string) => {
    let updatedState = [];
    switch (type) {
      case 'machines':
        updatedState = machines.map((machine) =>
          machine.id === id ? { ...machine, checked: !machine.checked } : machine
        );
        setMachines(updatedState);
        break;
      case 'steeringHeads':
        updatedState = steeringHeads.map((steeringHead) =>
          steeringHead.id === id ? { ...steeringHead, checked: !steeringHead.checked } : steeringHead
        );
        setSteeringHeads(updatedState);
        break;
      case 'cuttingHeads':
        updatedState = cuttingHeads.map((cuttingHead) =>
          cuttingHead.id === id ? { ...cuttingHead, checked: !cuttingHead.checked } : cuttingHead
        );
        setCuttingHeads(updatedState);
        break;
      case 'otsCuttingHeads':
        updatedState = otsCuttingHeads.map((otsCuttinghead) =>
          otsCuttinghead.id === id ? { ...otsCuttinghead, checked: !otsCuttinghead.checked } : otsCuttinghead
        );
        setOtsCuttingHeads(updatedState);
        break;
      case 'tbms':
        updatedState = tbms.map((tbm) =>
          tbm.id === id ? { ...tbm, checked: !tbm.checked } : tbm
        );
        setTbms(updatedState);
        break;
      default:
        break;
    }
    const compiledItems = [...machines, ...steeringHeads, ...cuttingHeads, ...otsCuttingHeads, ...tbms];
    const allIds = compiledItems.map(item => ({ id: item.id, checked: item.checked }));
    setAllItems(compiledItems);
    console.log(allIds);
    handleToggleCheck(allIds as T[]);
  };
  
  
  



  return (
    <div className="checkBoxes grid sm:grid-cols-2 md:grid-cols-5 bg-white border-t border-gray-300 py-2">
      <div className="flex justify-center">
      <div className="">
        <b>Machines</b>
        {machines.map((machine) => (
          <div className="pl-2" key={machine.id}>
            <input
              type="checkbox"
              checked={machine.checked}
              onChange={() => handleCheckboxChange(machine.id, 'machines')}
              className="mx-1 accent-blue-500 stroke-blue-500"
            />
            {machine.name}
          </div>
        ))}
      </div>
      </div>
      <div className="flex justify-center">
      <div className="">
        OTS Steering Heads
        {steeringHeads.map((steeringHead) => (
          <div className="pl-2" key={steeringHead.id}>
            <input
              type="checkbox"
              checked={steeringHead.checked}
              onChange={() => handleCheckboxChange(steeringHead.id, 'steeringHeads')}
              className="mx-1"
            />
            {steeringHead.name}
          </div>
        ))}
      </div>
      </div>
      <div className="flex justify-center">
      <div className="">
        OTS Cutting Heads
        {otsCuttingHeads.map((otsCuttinghead) => (
          <div className="pl-2" key={otsCuttinghead.id}>
            <input
              type="checkbox"
              checked={otsCuttinghead.checked}
              onChange={() => handleCheckboxChange(otsCuttinghead.id, 'otsCuttingHeads')}
              className="mx-1"
            />
            {otsCuttinghead.name}
          </div>
        ))}
      </div>
      </div>
      <div className="flex justify-center">
      <div className="text-center">
        Cutting Heads
        {cuttingHeads.map((cuttingHead) => (
          <div className="pl-2" key={cuttingHead.id}>
            <input
              type="checkbox"
              checked={cuttingHead.checked}
              onChange={() => handleCheckboxChange(cuttingHead.id, 'cuttingHeads')}
              className="mx-1"
            />
            {cuttingHead.name}
          </div>
        ))}
      </div>
      </div>

      <div className="flex justify-center">
      <div className="text-center">
        TBMs
        {tbms.map((tbm) => (
          <div className="pl-2" key={tbm.id}>
            <input
              type="checkbox"
              checked={tbm.checked}
              onChange={() => handleCheckboxChange(tbm.id, 'tbms')}
              className="mx-1"
            />
            {tbm.name}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default CheckBoxes;
