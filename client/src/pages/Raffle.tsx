import RafflePane from "../components/RafflePane";
import LatestDono from "../components/LatestDono";
import TodaysTopDono from "../components/TodaysTopDonos";
import TodaysTotals from "../components/TodaysTotals";
import DonoSiteIframe from "../components/DonoSiteIframe";
import "./Raffle.css";
import React from "react";

const Raffle = () => {
  return (
    <div id="Raffle" className="Raffle">
      <div className="Raffle-left">
        <div className="horizontal-container" style={{ flex: 2 }}>
          <h1 className="vertical-header">RAFFLE</h1>
          <RafflePane />
        </div>
        <div className="horizontal-container" style={{ flex: 1 }}>
          <h1 className="vertical-header">LATEST</h1>
          <LatestDono />
        </div>
        <div className="horizontal-container" style={{ flex: 1 }}>
          <h1 className="vertical-header">TODAY</h1>
          <div className="horizontal-items">
            <TodaysTopDono />
            <TodaysTotals />
          </div>
        </div>
      </div>
      <div className="Raffle-right">
        <DonoSiteIframe />
      </div>
    </div>
  );
};

export default Raffle;
