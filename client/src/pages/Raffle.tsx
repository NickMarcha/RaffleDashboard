import RafflePane from "../components/RafflePane";
import LatestDonation from "../components/LatestDonation";
import TopDonations from "../components/TodaysTopDonations";
import TodaysTotals from "../components/TodaysTotals";
import DonationSiteIframe from "../components/DonationSiteIframe";
import "./Raffle.css";
import React from "react";

const Raffle = () => {
  return (
    <div id="Raffle" className="Raffle  z-10">
      <div className="Raffle-left z-10">
        <div className="horizontal-container z-10" style={{ flex: 2 }}>
          <h1 className="vertical-header">RAFFLE</h1>
          <RafflePane />
        </div>
        <div className="horizontal-container  z-0" style={{ flex: 1 }}>
          <h1 className="vertical-header">LATEST</h1>
          <LatestDonation />
        </div>
        <div className="horizontal-container  z-0" style={{ flex: 1 }}>
          <h1 className="vertical-header">TODAY</h1>
          <div className="horizontal-items">
            <TopDonations />
            <TodaysTotals />
          </div>
        </div>
      </div>
      <div className="Raffle-right  z-0">
        <DonationSiteIframe />
      </div>
    </div>
  );
};

export default Raffle;
