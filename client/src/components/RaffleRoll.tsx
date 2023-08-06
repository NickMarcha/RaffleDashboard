import React, { useState } from "react";
import { rollRaffle, fetchOverallTotals, removeFromRaffle } from "../raffleApi";
import "./RaffleRoll.css";
import DonationPane from "./DonationPane";
import { ProcessedDonation } from "../types/Donation";

const RaffleRoll = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [error, setError] = useState(null);
  const [item, setItem] = useState<ProcessedDonation | null>(null);
  const [suggestedSkipGoal, setSuggestedSkipGoal] = useState(0);
  const aFactor = 15;
  const explanation = `MAX(dono amount +${aFactor}, f(donosInPool)) \nf(x) = 20+((250-20)/1.01^x)`;

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setItem(null);
    setSuggestedSkipGoal(0);
  };

  const reset = async () => {
    setItem(null);
    setSuggestedSkipGoal(0);
  };

  const handleRollRaffle = async () => {
    await reset();

    let result = await rollRaffle();
    if (result !== undefined) {
      //this is a hack to prevent the lastUpdated field from being displayed
      //last updated is set just before this so a timestamp is not needed
      result.lastUpdated = undefined;

      setItem(result);
      let totalResult = await fetchOverallTotals();
      console.log("totalResult");

      if (totalResult === undefined) {
        console.log("totalResult is undefined");
        setSuggestedSkipGoal(0);
      } else {
        let suggestion =
          20 + (250 - 20) / Math.pow(1.01, totalResult.raffleDonationCount);
        console.log("result.raffleDonationCount");
        console.log(totalResult);
        console.log("suggestion");
        console.log(suggestion);
        setSuggestedSkipGoal(
          Math.max(result.amount + aFactor, Math.round(suggestion))
        );
      }
    }
  };
  const handleRemoveFromRaffle = async () => {
    setIsModalOpen(false);
    if (item === null) {
      return;
    }
    await removeFromRaffle(item.NR);
    setItem(null);
  };

  return (
    <div>
      <button onClick={handleModalOpen}>Raffle</button>

      {isModalOpen && (
        <div className="modal z-20">
          <div className="modal-content ">
            <button onClick={handleRollRaffle}>doRaffleRoll</button>
            <button onClick={handleModalClose}>Close</button>
            {item !== null && (
              <div className="displayRaffleResult">
                <DonationPane donation={item} />
                <span style={{ fontSize: "17px", fontWeight: "lighter" }}>
                  Suggested
                  <span title={explanation}>(?)</span> Minimum Skip Goal: $
                  {suggestedSkipGoal}
                </span>
                <br />
                <button
                  className="warningButton"
                  onClick={handleRemoveFromRaffle}
                >
                  Remove From Raffle
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/*{error && <p>error: {error}</p>}*/}
    </div>
  );
};

export default RaffleRoll;
