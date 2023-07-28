import React, { useState, useEffect } from "react";
import { fetchOverallTopDonos } from "../raffleApi";
import DonoPane from "./DonoPane";
import { Dono } from "../types/DataTypes";

const TopDonos = () => {
  const [data, setData] = useState<Dono[]>([]);

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchOverallTopDonos();
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
      <h2>Overall Top Donos</h2>
      <div className="horizontal-container">
        {data.map((item, index) => (
          <DonoPane key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default TopDonos;
