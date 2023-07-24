import React, { useEffect, useState } from "react";
import DonoPane from "../components/DonoPane";
import { fetchSortedByRaffleTime } from "../raffleApi";
import "./History.css";
const History = () => {
  const [donos, setDonos] = useState([]);

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchSortedByRaffleTime();
      setDonos(result);
    }
    setFetchData();

    const interval = setInterval(setFetchData, 180000); // Fetch data every 3 minutes (180000 milliseconds)

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="donos-container">
      {donos.map((dono, index) => (
        <DonoPane key={index} {...dono} />
      ))}
    </div>
  );
};

export default History;
