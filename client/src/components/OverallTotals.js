import React, { useState, useEffect } from "react";
import { fetchOverallTotals } from "../raffleApi";

const OverallTotals = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchOverallTotals();
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
      <ul>
        <strong>Dono Count:</strong> {data.donoCount}
        <br />
        <strong>Dono Total:</strong> ${Math.round(data.donoTotal)}
        <br />
        <strong>Raffle Total:</strong> ${Math.round(data.raffleTotal)}
      </ul>
    </div>
  );
};

export default OverallTotals;
