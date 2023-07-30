import React from "react";
import LoaderAnimation from "../../util/loader";

const ExpiredNotice: React.FC<{}> = () => {
  return (
    <div className="text-4xl">
      <span>Loading poll results </span>
      <div className="h-5 w-5 inline-block">
        <LoaderAnimation />
      </div>
    </div>
  );
};

export default ExpiredNotice;
