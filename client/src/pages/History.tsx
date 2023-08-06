import React, { useEffect, useState } from "react";
import DonationPane from "../components/DonationPane";
import { fetchSortedByRaffleTime } from "../raffleApi";
import "./History.css";
import { ProcessedDonation } from "../types/Donation";
const History = () => {
  const [donations, setDonations] = useState<null | ProcessedDonation[]>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchSortedByRaffleTime();
      if (result.error) {
        console.log("ER", result.error);
        setError(result.error);
        return;
      } else {
        console.log("RES", result);
        setError("");
        setDonations(result);
      }
    }
    setFetchData();

    const interval = setInterval(setFetchData, 180000); // Fetch data every 3 minutes (180000 milliseconds)

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="donations-container">
      {error && <div className="error">{error}</div>}
      {donations === null && <div className="loading">Loading...</div>}

      {donations?.length !== 0 &&
        donations?.map((donation, index) => (
          <DonationPane key={donation.NR} donation={donation} />
        ))}
    </div>
  );
};

export default History;
