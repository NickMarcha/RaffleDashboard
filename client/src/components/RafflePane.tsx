import ScrapeButton from "./ScrapeButton";
import RaffleRoll from "./RaffleRoll";
import { fetchOverallTotals, isLoggedIn } from "../raffleApi";
import { useEffect, useState } from "react";

import "./RafflePane.css";
import React from "react";

const RafflePane = () => {
  const [data, setData] = useState<{
    donationCount: number;
    donationTotal: number;
    raffleTotal: number;
    raffleDonationCount: number;
  } | null>(null);

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchOverallTotals();
      if (result === undefined) return;
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
        <div className="RP-Header z-10">
          <ScrapeButton />
          <RaffleRoll />
        </div>
      )}
      <div className="RP-Body z-0">
        <iframe
          className="animate-[spin_40s_linear_infinite]	w-96 h-96 transition-opacity hover:animate-none"
          title="AgainstMalaria"
          scrolling="no"
          src="https://docs.google.com/spreadsheets/d/e/2PACX-1vTFxw9_v0kDrfF7ffiNMXGTnLDOBk42slQhfKCH_zmkp4T7XT7tdfJ6Cfu_0pDCYCYh7-nWub1JhgYS/pubchart?oid=2101655783&amp;format=interactive"
        />
        <div style={{ float: "right" }}>
          {data !== null && (
            <>
              <p style={{ fontSize: 30, textAlign: "right" }}>
                Raffle Pool:
                <br /> ${Math.round(data.raffleTotal)}
              </p>

              <div style={{ paddingLeft: 60 }}>
                <p style={{ fontSize: 20, textAlign: "right" }}>
                  Raffle Pool Donos:
                  <br /> {data.raffleDonationCount}/{data.donationCount}
                </p>

                <p style={{ fontSize: 20, textAlign: "right" }}>
                  Total: <br />
                  <span style={{ color: "red" }}>
                    ${Math.round(data.donationTotal)}
                  </span>
                  /
                  <span className="bounce-span" style={{ color: "green" }}>
                    ${Math.round(data.donationTotal + 1)}
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RafflePane;
