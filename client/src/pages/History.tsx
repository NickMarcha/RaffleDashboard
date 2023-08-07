import React, { useEffect, useState } from "react";
import DonationPane from "../components/DonationPane";
import { fetchRaffledEntries } from "../raffleApi";
import "./History.css";
import { ProcessedDonation } from "../types/Donation";
const History = () => {
  const [donations, setDonations] = useState<null | ProcessedDonation[]>(null);

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchRaffledEntries();
      if (result === undefined) return;

      setDonations(result);
    }
    setFetchData();

    const interval = setInterval(setFetchData, 180000); // Fetch data every 3 minutes (180000 milliseconds)

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="">
      <div className="donations-container">
        {donations === null && <div className="loading">Loading...</div>}

        {donations !== null && donations.length !== 0 && (
          <>
            {donations
              .filter((dono) => dono.lastUpdated !== undefined)
              .sort((a, b) => {
                if (
                  a.lastUpdated === undefined ||
                  b.lastUpdated === undefined
                ) {
                  throw new Error("This should never happen");
                }
                console.log(a.lastUpdated);
                return (
                  new Date(b.lastUpdated).getTime() -
                  new Date(a.lastUpdated).getTime()
                );
              })
              .map((donation, index) => (
                <DonationPane key={donation.NR} donation={donation} />
              ))}
            <div className="inline-flex items-center justify-center w-full">
              <hr className="w-5/6 h-6 my-8 bg-blue border-0  rounded-sm" />
              <span className="  text-xl absolute px-3 h-10 rounded-lg font-extrabold text-grey  bg-blue -translate-x-1/2 translate-y-1/2">
                Before History (sorted by donation date)
              </span>
            </div>
            {donations
              .filter((dono) => dono.lastUpdated === undefined)
              .sort((a, b) => b.date - a.date)
              .map((donation, index) => (
                <DonationPane key={donation.NR} donation={donation} />
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
