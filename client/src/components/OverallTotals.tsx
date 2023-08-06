import React, { useState, useEffect } from "react";
import { fetchOverallTotals } from "../raffleApi";

const OverallTotals = () => {
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
    <div>
      <h2>Overall</h2>
      {data !== null && (
        <ul>
          <strong>Dono Count:</strong> {data.donationCount}
          <br />
          <strong>Dono Total:</strong> ${Math.round(data.donationTotal)}
          <br />
          <strong>Raffle Total:</strong> ${Math.round(data.raffleTotal)}
        </ul>
      )}
    </div>
  );
};

export default OverallTotals;
