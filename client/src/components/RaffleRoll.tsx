import React, { useState } from "react";
import {
  rollRaffle,
  fetchOverallTotals,
  removeFromRaffle,
  broadcastMessage,
} from "../raffleApi";
import "./RaffleRoll.css";
import DonationPane from "./DonationPane";
import { ProcessedDonation } from "../types/Donation";
import LoaderAnimation from "../util/loader";
import { FindYoutubeVideoIdFromParagraph } from "../util/util";

const RaffleRoll = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [error, setError] = useState(null);
  const [item, setItem] = useState<ProcessedDonation | null>(null);

  const [raffling, setRaffling] = useState(false);

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
    setRaffling(true);
    let result = await rollRaffle();
    if (result !== undefined) {
      //this is a hack to prevent the lastUpdated field from being displayed
      //last updated is set just before this so a timestamp is not needed
      result.lastUpdated = undefined;

      setRaffling(false);
      setItem(result);
      setHasSentResults(false);
      let totalResult = await fetchOverallTotals();
      console.log("totalResult");

      if (totalResult === undefined) {
        console.log("totalResult is undefined");
        setSuggestedSkipGoal(0);
      } else {
        let suggestion =
          20 + (250 - 20) / Math.pow(1.01, totalResult.raffleDonationCount);
        setSuggestedSkipGoal(
          Math.max(result.amount + aFactor, Math.round(suggestion))
        );
      }
    }

    setRaffling(false);
  };

  const [hasSentResults, setHasSentResults] = useState(false);

  const sendResults = async () => {
    if (item === null) {
      return;
    }
    setHasSentResults(true);
    let emote = "WEOW";
    switch (item.yeeOrPepe) {
      case "YEE":
        emote = "comfYEE";
        break;
      case "PEPE":
        emote = "PepoComfy";
        break;
      default:
        break;
    }

    const message = `Up next ${emote} , ${item.sponsor} won the raffle with a donation: ${item.message}}`;
    const result = await broadcastMessage({ message: message });
    console.log(`Sent Announcement: ${result}`);
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
              <div className="flex">
                <div className="displayRaffleResult flex-auto">
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
                  <button
                    disabled={hasSentResults}
                    title="Sends results to DGG chat"
                    onClick={sendResults}
                  >
                    Announce Winner
                  </button>
                </div>
                {FindYoutubeVideoIdFromParagraph(item.message) !== null && (
                  <div className="flex-auto">
                    <iframe
                      width="560"
                      height="315"
                      src={`https://www.youtube.com/embed/${FindYoutubeVideoIdFromParagraph(
                        item.message
                      )}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            )}
            {raffling && (
              <div className="max-w-lg">
                <LoaderAnimation />
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
