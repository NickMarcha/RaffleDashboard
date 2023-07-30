import React from "react";
import useCountdown from "../../hooks/useCountdown";
import ExpiredNotice from "./ExpiredNotice";
import ShowCounter from "./ShowCounter";

const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    return <ExpiredNotice />;
  } else {
    return (
      <ShowCounter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    );
  }
};

export default CountdownTimer;
