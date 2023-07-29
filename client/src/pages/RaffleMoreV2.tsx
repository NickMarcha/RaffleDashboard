import React, { useRef } from "react";
import { Dono } from "../types/DataTypes";
import RaffleMoreCardV2 from "../components/RaffleMoreCardV2";
import { removeFromRaffle, rollRaffleMore, saveUpdated } from "../raffleApi";
import useArray from "../hooks/useArray";
import StrawPollAPI, { ResultEntry } from "../util/StrawPollAPI";
import { RenderClickableMessage, sendToClip } from "../util/util";
import LoaderAnimation from "../util/loader";
const RaffleMoreV2 = () => {
  const [pollID, setPollID] = React.useState<string>("");
  const [raffleAmount, setRaffleAmount] = React.useState(3);
  const [deadline, setDeadline] = React.useState(90);
  const [pollWinner, setPollWinner] = React.useState<ResultEntry | null>(null);
  const [removingEntries, setRemovingEntries] = React.useState<boolean>(false);
  const {
    array: donos,
    set: setDonos,
    update: updateDonos,
    clear: clearDonos,
  } = useArray<Dono>([]);
  const {
    array: pollResults,
    set: setResults,
    clear: clearResults,
  } = useArray<ResultEntry>([]);

  const {
    array: toggleArray,
    set: setToggleArray,
    update: updateToggle,
    clear: clearToggle,
  } = useArray<boolean>([]);

  const [raffling, setRaffling] = React.useState(false);

  async function handleRaffleMoreButton() {
    setRaffling(true);
    clearDonos();
    clearToggle();
    setPollWinner(null);
    setPollID("");
    clearResults();
    const result = await rollRaffleMore(raffleAmount);
    setDonos(result);
    setToggleArray(new Array(result.length).fill(false));
    setRaffling(false);
  }

  const [pollButtonResultsEnabled, setPollButtonResultsEnabled] =
    React.useState(false);

  async function handleCreatePollButton() {
    clearResults();
    setPollButtonResultsEnabled(false);
    const newPollID = await StrawPollAPI.createPoll(deadline, donos);
    setPollID(newPollID);

    setTimeout(() => {
      setPollButtonResultsEnabled(true);
      getPollResults(newPollID);
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
  function countToggles() {
    return toggleArray.reduce((a, item) => a + (item ? 1 : 0), 0);
  }
  async function RemoveRaffleEntries() {
    setRemovingEntries(true);
    let c = countToggles();

    let ps = [];
    for (let i = 0; i < toggleArray.length; i++) {
      if (toggleArray[i]) {
        ps.push(removeFromRaffle(donos[i].entryID, true));
      }
    }
    await Promise.all(ps);
    await saveUpdated();

    const result = await rollRaffleMore(raffleAmount);
    for (let i = 0; i < toggleArray.length; i++) {
      if (toggleArray[i]) {
        updateDonos(i, result.pop());
      }
      updateToggle(i, false);
    }

    setRemovingEntries(false);
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
      <div className="flex flex-row justify-between ">
        <div>
          <div className="mb-5">
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
              onContextMenu={(event) => {
                event.preventDefault();
                sendToClip(`https://strawpoll.com/${pollID}`);
              }}
              className="bg-red"
            >
              Open Poll
            </button>
            <button
              disabled={pollID === "" || !pollButtonResultsEnabled}
              onClick={handlePollResultsButton}
            >
              Get Poll Results
            </button>{" "}
            <br />
            <button
              disabled={countToggles() < 1 || removingEntries}
              onClick={() => RemoveRaffleEntries()}
            >
              Remove Entries
              {removingEntries && (
                <div className="h-5 w-5 inline-block">
                  <LoaderAnimation />
                </div>
              )}
            </button>
            {raffling && <LoaderAnimation />}
          </div>
          {/*/////////////   RAFFLE RESULTS  ///////////////////*/}
          {donos?.map((dono, index) => (
            <div key={index} className="mb-2">
              <RaffleMoreCardV2
                key={dono.entryID}
                isChecked={toggleArray[index]}
                setToggleState={(newValue) => updateToggle(index, newValue)}
                removing={removingEntries && toggleArray[index]}
                disabled={removingEntries}
                dono={dono}
              />
            </div>
          ))}
        </div>
        {/*/////////////   POLL RESULTS  ///////////////////*/}
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

export default RaffleMoreV2;