import ScrapeButton from "./ScrapeButton";
import RaffleRoll from "./RaffleRoll";
import { fetchOverallTotals, isLoggedIn } from "../raffleApi";
import { useEffect, useState } from "react";

import "./RafflePane.css";
import React from "react";

const RafflePane = () => {
  const [data, setData] = useState<any>({ donoTotal: 0 });

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchOverallTotals();
      setData(result);
    }
    setFetchData();

    const interval = setInterval(setFetchData, 180000); // Fetch data every 3 minutes (180000 milliseconds)

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="RP">
      {isLoggedIn() && (
        <div className="RP-Header">
          <ScrapeButton />
          <RaffleRoll />
        </div>
      )}
      <div className="RP-Body">
        <iframe
          title="AgainstMalaria"
          style={{
            height: "380px",
            width: "380px",
            borderColor: "transparent",
          }}
          scrolling="no"
          src="https://docs.google.com/spreadsheets/d/e/2PACX-1vT02jloyxs18l0kZa3v216iIpRVfIO339nwWXAgPnFVlipoTTVo3x6XkN74NFMhwJok2IC5ccb2749v/pubchart?oid=546257356&format=interactive"
        />
        <div style={{ float: "right" }}>
          <p style={{ fontSize: 30, textAlign: "right" }}>
            Raffle Pool:
            <br /> ${Math.round(data.raffleTotal)}
          </p>

          <div style={{ paddingLeft: 60 }}>
            <p style={{ fontSize: 20, textAlign: "right" }}>
              Raffle Pool Donos:
              <br /> {data.raffleDonoCount}/{data.donoCount}
            </p>

            <p style={{ fontSize: 20, textAlign: "right" }}>
              Total: <br />
              <span style={{ color: "red" }}>
                ${Math.round(data.donoTotal)}
              </span>
              /
              <span className="bounce-span" style={{ color: "green" }}>
                ${Math.round(data.donoTotal + 1)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RafflePane;
