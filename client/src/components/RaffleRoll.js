import React, { useState } from "react";
import { rollRaffle, removeFromRaffle } from "../raffleApi";
import { fromSerialDate } from "../utils";
import "./RaffleRoll.css";
import { renderClickableMessage } from "../util/util";

const RaffleRoll = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [item, setItem] = useState({});

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
                <strong>Sponsor:</strong> {item.sponsor}
                <br />
                <strong>Date:</strong> {item.date}
                <br />
                <strong>Location:</strong> {item.location}
                <br />
                <strong>Amount:</strong> ${item.amount}
                <br />
                <strong>Message:</strong> {renderClickableMessage(item.message)}
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
