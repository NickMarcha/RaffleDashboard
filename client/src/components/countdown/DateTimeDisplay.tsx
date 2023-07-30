import React from "react";

const DateTimeDisplay: React.FC<{
  value: number;
  type: string;
  isDanger: boolean;
}> = ({ value, type, isDanger }) => {
  const styles = [
    "text-white text-5xl animate-pulse ",
    "text-red font-bold drop-shadow-md text-5xl",
    "text-white font-bold drop-shadow-md text-5xl",
  ];

  return (
    <div className={value < 1 ? styles[0] : isDanger ? styles[1] : styles[2]}>
      {value}
      <span>{type}</span>
    </div>
  );
};

export default DateTimeDisplay;
