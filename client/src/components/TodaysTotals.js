import React, { useState, useEffect } from "react";
import { fetchTodaysTotals } from "../raffleApi";

const TodaysTotals = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchTodaysTotals();
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
      <h2>Todays Totals</h2>
      <ul>
        <strong>Yee Total:</strong> ${Math.round(data.yeeTotal)}
        <br />
        <strong>Pepe Total:</strong> ${Math.round(data.pepeTotal)}
        <br />
        <strong>Total:</strong> ${Math.round(data.total)}
      </ul>
    </div>
  );
};

export default TodaysTotals;
