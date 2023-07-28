import TopDonos from "../components/TopDonos";
import TodaysTopDono from "../components/TodaysTopDonos";
import OverallTotals from "../components/OverallTotals";
import YeeAndPepeTotal from "../components/YeeAndPepeTotal";
import TodaysTotals from "../components/TodaysTotals";
import LatestDono from "../components/LatestDono";
import React from "react";
const Home = () => {
  return (
    <div id="Home">
      <div className="horizontal-container">
        <h1 className="vertical-header">LATEST</h1>
        <LatestDono />
        <h1 className="vertical-header">TODAY</h1>
        <div className="horizontal-items">
          <TodaysTopDono />
          <TodaysTotals />
        </div>
      </div>

      <div className="horizontal-container">
        <h1 className="vertical-header">OVERALL</h1>
        <div className="horizontal-items">
          <div>
            <YeeAndPepeTotal />
            <OverallTotals />
          </div>
          <TopDonos />
        </div>
      </div>
    </div>
  );
};

export default Home;
