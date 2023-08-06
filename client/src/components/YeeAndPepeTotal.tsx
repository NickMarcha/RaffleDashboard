import React, { useState, useEffect } from "react";
import { fetchYeeAndPepeTotal } from "../raffleApi";

const YeeAndPepeTotal = () => {
  const [data, setData] = useState<{
    yeeDonationTotal: number;
    pepeDonationTotal: number;
  } | null>(null);

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchYeeAndPepeTotal();
      if (result === undefined) return;
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
      <h2>Yee and Pepe Total</h2>
      {data !== null && (
        <ul>
          <strong>Yee Total:</strong> ${Math.round(data.yeeDonationTotal)}
          <br />
          <strong>Pepe Total:</strong> ${Math.round(data.pepeDonationTotal)}
        </ul>
      )}
    </div>
  );
};

export default YeeAndPepeTotal;
