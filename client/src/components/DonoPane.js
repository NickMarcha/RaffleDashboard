import React from "react";
import "./DonoPane.css";
import { renderClickableMessage } from "../util/util";

const DonoPane = ({ sponsor, date, location, amount, message, timeStamp }) => {
  // Format the timestamp
  const formattedTimeStamp = new Date(timeStamp).toLocaleString();

  return (
    <div className="dono-pane">
      <div className="dono-pane-left">
        <div>
          <strong>Sponsor:</strong>
          <br /> {sponsor}
        </div>
        <div>
          <strong>Location:</strong> <br />
          {location}
        </div>
        <div>
          <strong>Amount:</strong> <br />$ {amount}
        </div>

        {timeStamp === undefined && (
          <div>
            {" "}
            <strong>Date:</strong>
            <br /> {date}
          </div>
        )}

        {timeStamp !== undefined && (
          <div>
            {" "}
            <strong>Timestamp:</strong> <br />
            {formattedTimeStamp}
          </div>
        )}
      </div>
      <div className="dono-pane-right">
        {message !== undefined && renderClickableMessage(message)}
      </div>
    </div>
  );
};

export default DonoPane;
