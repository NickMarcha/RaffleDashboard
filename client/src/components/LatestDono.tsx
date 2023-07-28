import React, { useState, useEffect } from "react";
import { latestDono } from "../raffleApi";
import DonoPane from "./DonoPane";
import { Dono, emptyDono } from "../types/DataTypes";
const LatestDono = () => {
  const [data, setData] = useState<Dono>(emptyDono);

  useEffect(() => {
    async function setFetchData() {
      const result = await latestDono();
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
      <h2>Latest Dono</h2>
      <DonoPane {...data} />
    </div>
  );
};

export default LatestDono;
