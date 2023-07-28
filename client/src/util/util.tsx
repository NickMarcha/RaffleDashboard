import React from "react";
import "./util.css";

const RenderClickableMessage: React.FC<{ message: string }> = ({ message }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = message.split(urlRegex);

  const elements: (string | React.JSX.Element)[] = parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          className="aInMessageLink"
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      );
    } else {
      return part;
    }
  });

  return <> {elements}</>;
};

export default RenderClickableMessage;
