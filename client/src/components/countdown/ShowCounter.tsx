import React from "react";
import DateTimeDisplay from "./DateTimeDisplay";

const ShowCounter: React.FC<{
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}> = ({ days, hours, minutes, seconds }) => {
  return (
    <div>
      {days > 0 && (
        <div className=" inline-block ml-2">
          <DateTimeDisplay value={days} type={"Days"} isDanger={days <= 1} />
        </div>
      )}
      {hours > 0 && (
        <div className=" inline-block ml-2">
          <DateTimeDisplay value={hours} type={"Hours"} isDanger={hours <= 1} />
        </div>
      )}
      <div className=" inline-block ml-2">
        <DateTimeDisplay value={minutes} type={"m "} isDanger={minutes <= 1} />
      </div>
      <div className=" inline-block ml-2  animate-wiggle">
        <DateTimeDisplay
          value={seconds}
          type={"s"}
          isDanger={minutes < 1 && seconds < 20}
        />
      </div>
    </div>
  );
};

export default ShowCounter;
