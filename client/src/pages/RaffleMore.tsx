import React, { useRef } from "react";
import { ProcessedDonation } from "../types/Donation";
import RaffleMoreCard from "../components/RaffleMoreCard";
import { removeFromRaffle, rollRaffleMore } from "../raffleApi";
import useArray from "../hooks/useArray";
import StrawPollEmbed from "../components/StrawPollEmbed";
import StrawPollAPI, { ResultEntry } from "../util/StrawPollAPI";
import { RenderClickableMessage } from "../util/util";
const RaffleMore = () => {
  //const pollIDRef = useRef<string>("");
  const [pollID, setPollID] = React.useState<string>("");
  const [raffleAmount, setRaffleAmount] = React.useState(3);
  const [deadline, setDeadline] = React.useState(90);
  const [pollWinner, setPollWinner] = React.useState<ResultEntry | null>(null);
  const {
    array: donos,
    set: setDonos,

    update: updateDonos,
    clear: clearDonos,
  } = useArray<ProcessedDonation>([]);
  const {
    array: pollResults,
    set: setResults,
    clear: clearResults,
  } = useArray<ResultEntry>([]);

  const [raffling, setRaffling] = React.useState(false);

  async function handleRaffleMoreButton() {
    setRaffling(true);
    clearDonos();
    setPollWinner(null);
    //pollIDRef.current = "";
    setPollID("");
    clearResults();
    const result = await rollRaffleMore(raffleAmount);
    setDonos(result);
    setRaffling(false);
  }

  const [pollButtonResultsEnabled, setPollButtonResultsEnabled] =
    React.useState(false);

  async function handleCreatePollButton() {
    clearResults();
    setPollButtonResultsEnabled(false);
    const newPollID = await StrawPollAPI.createPoll(deadline, donos);
    //pollIDRef.current = newPollID;
    setPollID(newPollID);

    setTimeout(() => {
      setPollButtonResultsEnabled(true);
      getPollResults();
    }, 1000 * deadline + 5000);
  }

  async function getPollResults(fpollID: string = pollID) {
    const results = await StrawPollAPI.getPollResultsArray(fpollID);
    setResults(results);
    const winner = results?.sort((a, b) => b.vote_points - a.vote_points)[0];
    console.log(winner);
    setPollWinner(winner);
  }
  async function handlePollResultsButton() {
    getPollResults();
  }

  async function handleReroll(index: number) {
    console.log("handleReroll");
    const result = await rollRaffleMore(1);
    updateDonos(index, result[0]);
  }
  async function handleRemove(index: number) {
    console.log("handleRemove");
    console.log(await removeFromRaffle(donos[index].NR));
    const result = await rollRaffleMore(1);
    updateDonos(index, result[0]);
  }
  return (
    <div className="m-10">
      <div>
        <div
          className="relative mb-3 text-black w-20"
          data-te-input-wrapper-init
        >
          {false && (
            <input
              type="number"
              className="text peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0 disabled:text-grey"
              id="exampleFormControlInputNumber"
              value={raffleAmount}
              onChange={(e) => setRaffleAmount(parseInt(e.target.value))}
              disabled={true}
            />
          )}
        </div>
        <div
          className="relative mb-3 text-black w-40"
          data-te-input-wrapper-init
        >
          <input
            type="number"
            className="text peer block min-h-[auto] text-right w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0 disabled:text-grey"
            id="deadlineMinutesCIN"
            value={deadline}
            onChange={(e) => setDeadline(parseInt(e.target.value))}
          />
          <label
            htmlFor="deadlineMinutesCIN"
            className="pointer-events-none text-grey absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out "
          >
            deadline (s)
          </label>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div>
          <div>
            <button disabled={raffling} onClick={handleRaffleMoreButton}>
              Rafflemore
            </button>
            <button
              disabled={raffling || donos.length == 0}
              onClick={handleCreatePollButton}
            >
              Create Poll
            </button>
            <button
              disabled={pollID === ""}
              onClick={() => window.open(`https://strawpoll.com/${pollID}`)}
            >
              Open Poll
            </button>
            {/*}
            {pollID && (
              <a href={`https://strawpoll.com/${pollID}`} target="_blank">
                Open Poll
              </a>
            )}*/}
            <button
              disabled={pollID === "" || !pollButtonResultsEnabled}
              onClick={handlePollResultsButton}
            >
              Get Poll Results
            </button>
          </div>
          {donos?.map((dono, index) => (
            <RaffleMoreCard
              key={index}
              reroll={() => handleReroll(index)}
              remove={() => handleRemove(index)}
              dono={dono}
            />
          ))}
        </div>
        <div className="flex-1 ml-10">
          {pollWinner && (
            <h1 className="text-3xl font-bold mb-10  ">
              {"Winner: "}
              {[
                donos.find((dono) => dono.message === pollWinner.value)
                  ?.sponsor,
              ]}
              <br />
              {RenderClickableMessage({ message: pollWinner.value })} <hr />
            </h1>
          )}

          {pollResults
            ?.sort((a, b) => {
              return b.vote_points - a.vote_points;
            })
            .map((result, index) => (
              <h1 className="text-1xl font-bold  break-normal ">
                {"[" + result.vote_points + "] "}
                {RenderClickableMessage({ message: result.value })}
              </h1>
            ))}

          {/*
          {pollID && <StrawPollEmbed strawPollID={pollID} />}
          */}
        </div>
      </div>
    </div>
  );
};

export default RaffleMore;
