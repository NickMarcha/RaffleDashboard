import React from "react";
import { Dono } from "../types/DataTypes";
import { RenderClickableMessage, fromSerialDate } from "../util/util";
interface RMProps {
  setToggleState: (state: boolean) => void;
  isChecked: boolean;
  dono: Dono;
  disabled: boolean;
  removing: boolean;
}

const RaffleMoreCardV2: React.FC<RMProps> = ({
  dono,
  isChecked,
  setToggleState,
  disabled,
  removing,
}) => {
  let fdate;
  if (dono.date) fdate = fromSerialDate(dono.date);

  return (
    <div
      className={`max-w-sm p-6 ${
        removing ? "bg-red" : "bg-black"
      } border  rounded-lg shadow border-blue `}
    >
      <div className="flex flex-row justify-between">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">
          {dono.sponsor}
        </h5>
        <input
          id="bordered-checkbox-1"
          type="checkbox"
          checked={isChecked}
          name="bordered-checkbox"
          disabled={disabled}
          onChange={(event) => {
            //event.preventDefault();
            setToggleState(event.target.checked);
          }}
          className="w-10 h-10 accent-red text-red-100 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
        />
      </div>
      <hr />
      <p className="mb-1 font-normal text-gray-700  break-words bg-black mt-1">
        {RenderClickableMessage({ message: dono.message })}
      </p>
      <hr />
      <div className="flex flex-row justify-between">
        <p className="font-normal text-gray-700 ">{dono.amount} USD</p>
        <p className="font-normal text-gray-700 ">{dono.location}</p>
        <p className=" font-normal text-gray-700 ">{fdate}</p>
      </div>
    </div>
  );
};

export default RaffleMoreCardV2;
