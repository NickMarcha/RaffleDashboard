import React, { useState, useEffect } from "react";
import { fetchRaffledEntries } from "../raffleApi";
import { ProcessedDonation } from "../types/Donation";
import "./AnimatedRaffle.css";

const AnimatedRaffle = () => {
  let colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
  // Format the timestamp
  let formattedTimeStamp = "";

  const [data, setData] = useState<ProcessedDonation[] | undefined>([])
  const handleSpinClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    let message = (e.currentTarget.previousSibling?.firstChild as HTMLElement)

    message.classList.add("animate-scroll")


  }

  let currentMovie = 0
  let resolved = false

  const swapText = (e: React.AnimationEvent<HTMLElement>) => {
    e.preventDefault()
    currentMovie = Math.floor(Math.random() * 50)
    if (!resolved) {
      e.currentTarget.classList.remove("animate-scroll")

      if (data) {
        e.currentTarget.innerHTML = data[currentMovie]['message']
      }

      if (currentMovie > 20) {

        e.currentTarget.classList.add("animate-last-scroll")
        resolved = true
      } else {
        // needed to trigger document reflow to restart animation
        void (e.currentTarget.offsetHeight)
        e.currentTarget.classList.add("animate-scroll")
      }
    }
  }

  useEffect(() => {
    async function fetchData() {
      const res = await fetchRaffledEntries()
      if (res != undefined) {
        const top50 = res.slice(0, 50)
        setData(top50)
        console.log(data)
      }
    }
    fetchData()
  }, [])


  return (
    <div className="holder">
      <div className="flex justify-center">

        <h1>
          Click to decide your fate.
          <img className="inline-block" src="https://cdn.frankerfacez.com/emoticon/502507/4" />
        </h1>

      </div>
      <div className="spin-container overflow-hidden mx-auto">

        <h1 className="justify-center self-start -translate-y-10" onAnimationEnd={swapText}> {data != undefined && data.length > 0 ? `${data[0]['message']}` : "loading"}</h1>

      </div>
      <button className="mx-auto block mt-3" onClick={handleSpinClick}>
        Spin
      </button>
    </div>
  );
};

export default AnimatedRaffle;
