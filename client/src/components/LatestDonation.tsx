import React, { useState, useEffect } from "react";
import { latestDonation } from "../raffleApi";
import DonationPane from "./DonationPane";
import { ProcessedDonation } from "../types/Donation";
const LatestDonation = () => {
  const [data, setData] = useState<ProcessedDonation | null>(null);

  useEffect(() => {
    async function setFetchData() {
      const result = await latestDonation();
      if (result !== undefined) {
        setData(result);
      } else {
        setData(null);
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
      <h2>Latest Donation</h2>
      <DonationPane donation={data} />
    </div>
  );
};

export default LatestDonation;
