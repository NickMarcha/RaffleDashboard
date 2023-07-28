import React, { useState, useEffect } from "react";
import { fetchLatestFiftydonos } from "../raffleApi";
import "./LatestFiftyDonos.css";
import { Dono } from "../types/DataTypes";

const LatestFiftyDonos = () => {
  const [data, setData] = useState<Dono[]>([]);

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchLatestFiftydonos();
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
      <h2>Latest 50 Donos</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <div className="horizontal-container" style={{ height: "auto" }}>
              <div>
                <strong>Sponsor:</strong> {item.sponsor}
                <br />
                <strong>Date:</strong> {item.date}
                <br />
                <strong>Location:</strong> {item.location}
                <br />
                <strong>Amount:</strong> ${item.amount}
                <br />
                <br />
                <strong>Message:</strong>
              </div>
              <div style={{ marginLeft: "40px", alignSelf: "center" }}>
                <p className="message">{item.message}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LatestFiftyDonos;
