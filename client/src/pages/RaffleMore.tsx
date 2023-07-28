import React from "react";
import { Dono, emptyDono } from "../types/DataTypes";
import RaffleMoreCard from "../components/RaffleMoreCard";
import { removeFromRaffle, rollRaffleMore } from "../raffleApi";
import useArray from "../hooks/useArray";
import axios from "axios";
import StrawPollEmbed from "../components/StrawPollEmbed";
const RaffleMore = () => {
  let pollOps: any = {
    title: "What is up next?",
    media: {
      id: "poy9NPNwnJr",
      type: "image",
      url: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Against_Malaria_Foundation.svg/1200px-Against_Malaria_Foundation.svg.png",
      width: 640,
      height: 480,
    },
    poll_options: [],
    poll_config: {
      is_private: true,
      vote_type: "default",
      allow_comments: true,
      allow_indeterminate: false,
      allow_other_option: false,
      custom_design_colors: "{}",
      deadline_at: 1649671274,
      duplication_checking: "ip",
      allow_vpn_users: false,
      edit_vote_permissions: "admin",
      force_appearance: "auto",
      hide_participants: false,

      number_of_winners: 1,
      randomize_options: true,
      require_voter_names: false,
      results_visibility: "always",
      use_custom_design: false,
    },

    type: "ranked_choice",
  };
  const strawpollAPIKey = "826b1c16-2cc3-11ee-a06d-d2b19cbdc231";

  const starPollClient = axios.create({
    baseURL: "https://api.strawpoll.com/v3",
    headers: {
      "X-API-Key": strawpollAPIKey,
    },
  });
  const [pollID, setPollID] = React.useState<string>("");
  const [raffleAmount, setRaffleAmount] = React.useState(5);
  const {
    array: donos,
    set: setDonos,
    push,
    remove,
    filter,
    update,
    clear,
  } = useArray<Dono>([]);

  async function handleRaffleMore() {
    const result = await rollRaffleMore(raffleAmount);
    setDonos(result);
  }

  async function handleCreatePoll() {
    pollOps.poll_config.deadline_at = Math.floor(
      new Date(Date.now() + 3 * 60 * 1000).getTime() / 1000
    );
    pollOps.poll_options = donos.map((dono) => {
      return {
        id: dono.entryID,
        type: "text",
        position: 0,
        vote_count: 0,
        max_votes: 0,
        description: dono.message,
        is_write_in: false,
        value: dono.message,
      };
    });
    starPollClient.post("/polls", pollOps).then((res) => {
      const pollId = res.data.id;
      setPollID(pollId);
    });
  }

  async function handleReroll(index: number) {
    console.log("handleReroll");
    const result = await rollRaffleMore(1);
    update(index, result[0]);
  }
  async function handleRemove(index: number) {
    console.log("handleRemove");
    console.log(await removeFromRaffle(donos[index].entryID));
    const result = await rollRaffleMore(1);
    update(index, result[0]);
  }
  return (
    <div className="m-10">
      <div className="relative mb-3 text-black w-40" data-te-input-wrapper-init>
        <input
          type="number"
          className="text peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0 disabled:text-grey"
          id="exampleFormControlInputNumber"
          value={raffleAmount}
          onChange={(e) => setRaffleAmount(parseInt(e.target.value))}
        />
        {/*
        <label
          htmlFor="exampleFormControlInputNumber"
          className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
        >
          Amount of raffles
        </label>
  */}
      </div>
      <div className="flex flex-row justify-between">
        <div>
          <div>
            <button onClick={handleRaffleMore}>Rafflemore</button>
            <button onClick={handleCreatePoll}>Create Poll</button>
            {pollID && (
              <a href={`https://strawpoll.com/${pollID}`} target="_blank">
                Open Poll
              </a>
            )}
          </div>
          {donos.map((dono, index) => (
            <RaffleMoreCard
              key={index}
              reroll={() => handleReroll(index)}
              remove={() => handleRemove(index)}
              dono={dono}
            />
          ))}
        </div>
        {pollID && <StrawPollEmbed strawPollID={pollID} />}
      </div>
    </div>
  );
};

export default RaffleMore;
