import React, { useState, useEffect } from "react";
import { fetchTodaysTopDonation } from "../raffleApi";
import DonationPane from "./DonationPane";
import { ProcessedDonation } from "../types/Donation";

const TopDonations = () => {
  const [data, setData] = useState<ProcessedDonation | null>(null);

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchTodaysTopDonation();
      if (result === undefined) return;
      if (result.length > 0) {
        setData(result[0]);
      }
    }
    setFetchData();

    const interval = setInterval(setFetchData, 180000); // Fetch data every 3 minutes (180000 milliseconds)

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <h2>Todays Top Dono</h2>
      <DonationPane donation={data} />
    </div>
  );
};

export default TopDonations;
