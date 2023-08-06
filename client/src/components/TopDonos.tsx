import React, { useState, useEffect } from "react";
import { fetchOverallTopDonations } from "../raffleApi";
import DonationPane from "./DonationPane";
import { ProcessedDonation } from "../types/Donation";

const TopDonations = () => {
  const [data, setData] = useState<ProcessedDonation[]>([]);

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchOverallTopDonations();

      if (result !== undefined) {
        setData(result);
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
      <h2>Overall Top Donations</h2>
      <div className="horizontal-container">
        {/* {error && <div className="error">{error}</div>} */}

        {data?.length !== 0 &&
          data?.map((item, index) => (
            <DonationPane key={index} donation={item} />
          ))}
      </div>
    </div>
  );
};

export default TopDonations;
