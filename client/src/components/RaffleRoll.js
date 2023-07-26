import React, { useState, useEffect } from "react";
import { rollRaffle, removeFromRaffle, fetchOverallTotals } from "../raffleApi";
import { fromSerialDate } from "../utils";
import "./RaffleRoll.css";
import DonoPane from "./DonoPane";

const RaffleRoll = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [item, setItem] = useState({});
  const [suggestedSkipGoal, setSuggestedSkipGoal] = useState(0);
  const aFactor = 15;
  const explanation = `MAX(dono amount +${aFactor}, f(donosInPool)) \nf(x) = 20+((250-20)/1.01^x)`;

  useEffect(() => {
    getSuggestedSkip();
  }, [item]);

  //f(x) = 20+((250-20)/1.01^x
  const getSuggestedSkip = async () => {
    if (item === {}) return;
    if (item.amount === "rolling...") {
      setSuggestedSkipGoal("rolling...");
      return;
    }
    let result = await fetchOverallTotals();
    let suggestion = 20 + (250 - 20) / Math.pow(1.01, result.raffleDonoCount);
    setSuggestedSkipGoal(
      Math.max(item.amount + aFactor, Math.round(suggestion))
    );
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setItem({});
  };

  const rollingItem = {
    sponsor: "rolling...",
    date: "rolling...",
    location: "rolling...",
    amount: "rolling...",
    message: "rolling...",
  };
  const handleRollRaffle = async () => {
    setItem(rollingItem);

    let result = await rollRaffle();

    result.date = fromSerialDate(result.date);
    setItem(result);
  };
  const handleRemoveFromRaffle = async () => {
    const result = await removeFromRaffle(item.entryID);
    setIsModalOpen(false);
    setItem({});
  };

  return (
    <div>
      <button onClick={handleModalOpen}>Raffle</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={handleRollRaffle}>doRaffleRoll</button>
            <button onClick={handleModalClose}>Close</button>
            {item.sponsor && (
              <div className="displayRaffleResult">
                <DonoPane {...item} />
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

      {error && <p>error: {error}</p>}
    </div>
  );
};

export default RaffleRoll;
