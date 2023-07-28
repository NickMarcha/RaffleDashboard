import { doScrape } from "../raffleApi";
import { useState } from "react";
import "./ScrapeButton.css";
import hmemote from "../assets/images/hackerman.png";
import React from "react";

const ScrapeButton = () => {
  const [statusStr, setStatusstr] = useState<string | null>(null);
  const handleScrape = async () => {
    setStatusstr("Scraping...");
    let result = await doScrape();
    if (result) {
      setStatusstr(result.message);
    } else {
      setStatusstr("chill, probably rate limited MMMM");
    }
  };

  return (
    <div>
      <button className="carefulButton" onClick={handleScrape}>
        Scrape
      </button>{" "}
      {statusStr && (
        <p>
          Status: {statusStr} <img src={hmemote} alt="" />
        </p>
      )}
    </div>
  );
};

export default ScrapeButton;
