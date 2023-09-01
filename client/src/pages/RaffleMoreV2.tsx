import React, { useRef, useState } from "react";
import { ProcessedDonation } from "../types/Donation";
import RaffleMoreCardV2 from "../components/RaffleMoreCardV2";
import {
  broadcastMessage,
  removeFromRaffle,
  rollRaffleMore,
  saveUpdated,
} from "../raffleApi";
import useArray from "../hooks/useArray";
import StrawPollAPI, { ResultEntry } from "../util/StrawPollAPI";
import { RenderClickableMessage, sendToClip } from "../util/util";
import LoaderAnimation from "../util/loader";
import CountdownTimer from "../components/countdown/CountDownTimer";
const RaffleMoreV2 = () => {
  const [pollID, setPollID] = React.useState<string>("");
  const [raffleAmount, setRaffleAmount] = React.useState(3);
  const [deadline, setDeadline] = React.useState(150);
  const [pollWinner, setPollWinner] = React.useState<ResultEntry | null>(null);
  const [removingEntries, setRemovingEntries] = React.useState<boolean>(false);
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

  const {
    array: toggleArray,
    set: setToggleArray,
    update: updateToggle,
    clear: clearToggle,
  } = useArray<boolean>([]);

  const [raffling, setRaffling] = React.useState(false);

  const [countDownDate, setCountDownDate] = React.useState(new Date());

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

  /*
  const [pollButtonResultsEnabled, setPollButtonResultsEnabled] =
    React.useState(false);*/

  let getResultsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleCreatePollButton() {
    clearResults();
    setPollWinner(null);
    //setPollButtonResultsEnabled(false);
    const newPollID = await StrawPollAPI.createPoll(deadline, donos);
    const newCountdownDate = new Date(Date.now() + deadline * 1000);
    setHasSentResults(false);

    setCountDownDate(newCountdownDate);
    setPollID(newPollID);

    if (getResultsTimer.current) {
      clearTimeout(getResultsTimer.current);
    }
    getResultsTimer.current = setTimeout(() => {
      //setPollButtonResultsEnabled(true);
      getPollResults(newPollID);
    }, 1000 * deadline + 10000);
  }

  async function getPollResults(fpollID: string = pollID) {
    const results = await StrawPollAPI.getPollResultsArray(fpollID);
    setResults(results);
    const winner = results?.sort((a, b) => b.vote_points - a.vote_points)[0];
    console.log(winner);
    setPollWinner(winner);
  }
  /*setHasSentResults
  async function handlePollResultsButton() {
    getPollResults();
  }*/
  function countToggles() {
    return toggleArray.reduce((a, item) => a + (item ? 1 : 0), 0);
  }
  async function RemoveRaffleEntries() {
    setRemovingEntries(true);
    let c = countToggles();

    let ps = [];
    for (let i = 0; i < toggleArray.length; i++) {
      if (toggleArray[i]) {
        ps.push(removeFromRaffle(donos[i].NR, true));
      }
    }
    await Promise.all(ps);
    await saveUpdated();

    const result = await rollRaffleMore(c);
    for (let i = 0; i < toggleArray.length; i++) {
      if (toggleArray[i]) {
        updateDonos(i, result.pop());
      }
      updateToggle(i, false);
    }

    setRemovingEntries(false);
  }

  const [hasSentResults, setHasSentResults] = useState(false);

  const sendResults = async () => {
    if (pollWinner === null) {
      return;
    }

    const item = donos.find((pd) => {
      return pd.message === pollWinner.value;
    });

    if (item === null || item == undefined) {
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
        const comfyEmotes = [
          "ComfyAYA",
          "ComfyCat",
          "ComfyDan",
          "ComfyDog",
          "ComfyFerret",
          "ComfyMel",
          "coMMMMfy",
        ];
        emote = comfyEmotes[Math.floor(Math.random() * comfyEmotes.length)];
        break;
    }
    const message = `Up next ${emote} ${item.sponsor} won the raffle with: ${item.message}`;
    const result = await broadcastMessage({ message: message });
    console.log(`Sent Announcement: ${result}`);
  };

  return (
    <div className="m-10">
      <div className="flex flex-row">
        <div
          className="relative mb-3 mr-3 text-black w-24"
          data-te-input-wrapper-init
        >
          <input
            type="number"
            className="text peer block min-h-[auto] text-right w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0 disabled:text-grey"
            id="countRaffle"
            value={raffleAmount}
            onChange={(e) => setRaffleAmount(parseInt(e.target.value))}
            disabled={false}
          />

          <label
            htmlFor="countRaffle"
            className="pointer-events-none text-grey absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out "
          >
            count
          </label>
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
              disabled={raffling || donos.length === 0}
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
            {/*
            <button
              disabled={pollID === "" || !pollButtonResultsEnabled}
              onClick={handlePollResultsButton}
            >
              Get Poll Results
            </button>{" "}
            */}
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
            <button
              disabled={
                pollWinner === null ||
                pollWinner === undefined ||
                hasSentResults
              }
              onClick={sendResults}
            >
              Announce Winner
            </button>
            {raffling && <LoaderAnimation />}
          </div>

          {/*/////////////   RAFFLE RESULTS  ///////////////////*/}
          {donos?.map((dono, index) => (
            <div key={index} className="mb-2">
              <RaffleMoreCardV2
                key={dono.NR}
                isChecked={toggleArray[index]}
                setToggleState={(newValue) => updateToggle(index, newValue)}
                removing={removingEntries && toggleArray[index]}
                disabled={removingEntries}
                dono={dono}
              />
            </div>
          ))}
        </div>

        {/*/////////////   POLL COUNTDOWN  ///////////////////*/}
        {countDownDate > new Date(Date.now()) && (
          <div className="flex-1 ml-10  border-4 p-10 border-blue rounded-3xl min-h-584">
            <div className="flex items-center justify-center flex-col">
              <h1 className="text-3xl font-bold flex-1">Voting Closes in:</h1>
              <div className="flex-1" />
              <div className="flex-1">
                <CountdownTimer targetDate={countDownDate}></CountdownTimer>
              </div>
            </div>
          </div>
        )}
        {/*/////////////   POLL RESULTS  ///////////////////*/}
        {pollWinner && (
          <div className="flex-1 ml-10 border-4 p-10 border-blue rounded-3xl min-h-584">
            <h1 className="text-3xl font-bold mb-10  ">
              {"Winner: "}
              {[
                donos.find((dono) => dono.message === pollWinner.value)
                  ?.sponsor,
              ]}
              <br />
              {RenderClickableMessage({ message: pollWinner.value })}{" "}
              <hr className="border-blue border-4" />
            </h1>

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
          </div>
        )}
      </div>
    </div>
  );
};

export default RaffleMoreV2;
