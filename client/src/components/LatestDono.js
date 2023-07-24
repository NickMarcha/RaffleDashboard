import React, { useState, useEffect } from "react";
import { latestDono } from "../raffleApi";
import DonoPane from "./DonoPane";
const LatestDono = () => {
  const [data, setData] = useState([]);

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
