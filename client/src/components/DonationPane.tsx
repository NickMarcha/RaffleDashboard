import React from "react";
import "./DonationPane.css";
import {
  RenderClickableMessage,
  fromSerialDate,
  getFlagUrl,
} from "../util/util";
import { ProcessedDonation } from "../types/Donation";
import backgroundYee from "../assets/images/YeeBackground.png";
import backgroundPepe from "../assets/images/PepeBackground.png";

const DonationPane: React.FC<{ donation: ProcessedDonation | null }> = ({
  donation,
}) => {
  // Format the timestamp
  let formattedTimeStamp = undefined;
  if (donation?.lastUpdated !== undefined) {
    //.log(donation.lastUpdated);
    formattedTimeStamp = new Date(donation.lastUpdated).toLocaleString();
  }
  //console.log(formattedTimeStamp);
  //console.log(donation);

  return (
    <div className="flex rounded overflow-hidden m-2 w-96 border-2 bg-grey">
      {donation !== null && (
        <>
          <div className="donation-pane-left">
            <div>
              <strong>Sponsor:</strong>
              <br /> {donation?.sponsor}
            </div>
            <div>
              <strong>Location:</strong> <br />
              <span className="flex">
                <img
                  className="h-4 w-5"
                  alt="location flag"
                  title={`${donation.flag} - ${donation.location}`}
                  src={getFlagUrl(donation.flag)}
                ></img>{" "}
                {donation.location}
              </span>
            </div>
            <div>
              <strong>Amount:</strong> <br />$ {donation.amount}
            </div>

            {formattedTimeStamp === undefined && (
              <div>
                <strong>Date:</strong>
                <br /> {fromSerialDate(donation.date)}
              </div>
            )}

            {formattedTimeStamp !== undefined && (
              <div>
                <strong>Timestamp:</strong> <br />
                {formattedTimeStamp}
              </div>
            )}
          </div>
          <div className="bg-gray-900 p-2 border-l-2 relative flex-1">
            <div className="z-10 absolute">
              {<RenderClickableMessage message={donation.message} />}
            </div>
            {donation.yeeOrPepe !== "NONE" && (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${
                    donation.yeeOrPepe === "YEE"
                      ? backgroundYee
                      : backgroundPepe
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  filter: "invert(80%)",
                  opacity: "0.4",

                  userSelect: "none",
                  //opacity: "0.5",
                  //backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DonationPane;
