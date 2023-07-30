import React, { useState, useEffect } from "react";
import { rollRaffle, fetchOverallTotals, removeFromRaffle } from "../raffleApi";
import { fromSerialDate } from "../util/util";
import "./RaffleRoll.css";
import DonoPane from "./DonoPane";
import { Dono, emptyDono, rollingDono } from "../types/DataTypes";

const RaffleRoll = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [error, setError] = useState(null);
  const [item, setItem] = useState<Dono>(emptyDono);
  const [suggestedSkipGoal, setSuggestedSkipGoal] = useState(0);
  const aFactor = 15;
  const explanation = `MAX(dono amount +${aFactor}, f(donosInPool)) \nf(x) = 20+((250-20)/1.01^x)`;

  useEffect(() => {
    getSuggestedSkip();
  }, [item]);

  //f(x) = 20+((250-20)/1.01^x
  const getSuggestedSkip = async () => {
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
    setItem(emptyDono);
  };

  const handleRollRaffle = async () => {
    setItem(rollingDono);

    let result = await rollRaffle();

    result.date = fromSerialDate(result.date);
    setItem(result);
  };
  const handleRemoveFromRaffle = async () => {
    await removeFromRaffle(item.entryID);
    setIsModalOpen(false);
    setItem(emptyDono);
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

      {/*{error && <p>error: {error}</p>}*/}
    </div>
  );
};

export default RaffleRoll;
