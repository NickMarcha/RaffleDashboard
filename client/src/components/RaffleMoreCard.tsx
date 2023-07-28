import React from "react";
import { Dono } from "../types/DataTypes";
import { RenderClickableMessage, fromSerialDate } from "../util/util";
import { useEffect, useState } from "react";

interface RMProps {
  reroll: () => void;
  remove: () => void;
  dono: Dono;
}

const RaffleMoreCard: React.FC<RMProps> = ({ dono, reroll, remove }) => {
  let fdate;
  if (dono.date) fdate = fromSerialDate(dono.date);
  let [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    setIsDisabled(false);
  }, [dono.entryID]);

  return (
    <div
      className={`max-w-sm p-6 ${
        isDisabled ? "bg-red" : "bg-black"
      } border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700`}
    >
      <a href="#">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {dono.sponsor}
        </h5>
      </a>
      <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
        {RenderClickableMessage({ message: dono.message })}
      </p>
      <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
        {dono.amount} USD | {dono.location}
      </p>
      <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
        {fdate}
      </p>
      <button
        disabled={isDisabled}
        onClick={() => {
          setIsDisabled(true);
          reroll();
        }}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:cursor-not-allowed"
      >
        Reroll
        <svg
          className="w-3.5 h-3.5 ml-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 10"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M1 5h12m0 0L9 1m4 4L9 9"
          />
        </svg>
      </button>
      <button
        disabled={isDisabled}
        onClick={() => {
          setIsDisabled(true);
          remove();
        }}
        className="ml-5 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:cursor-not-allowed"
      >
        remove from raffle
      </button>
    </div>
  );
};

export default RaffleMoreCard;
