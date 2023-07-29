import React from "react";

const RenderClickableMessage: React.FC<{ message: string }> = ({ message }) => {
  if (message == null) return <></>;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = message.split(urlRegex);

  const elements: (string | React.JSX.Element)[] = parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          className="text-blue hover:underline"
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
function sendToClip(str: string) {
  if (typeof navigator.clipboard == "undefined") {
    console.log("navigator.clipboard");
    var textArea = document.createElement("textarea");
    textArea.value = str;
    textArea.style.position = "fixed"; //avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "successful" : "unsuccessful";
      console.log(msg);
    } catch (err) {
      console.warn("Was not possible to copy te text: ", err);
    }

    document.body.removeChild(textArea);
    return;
  }
  navigator.clipboard.writeText(str).then(
    function () {
      console.info(`successful!`);
    },
    function (err) {
      console.warn("unsuccessful!", err);
    }
  );
}

function fromSerialDate(serialDate: number) {
  const epoch = new Date(1899, 11, 30);
  const daysSinceEpoch = serialDate;
  const dateInMilliseconds =
    epoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000;
  const date = new Date(dateInMilliseconds);

  const day = date.getDate();
  const month = getMonthName(date.getMonth());
  const year = date.getFullYear() % 100; // Convert YYYY to YY format

  const deserializedDate = `${day} ${month} ${year}`;

  return deserializedDate;
}

// Helper function to convert month numbers to names
function getMonthName(monthNumber: number) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months[monthNumber];
}

export { RenderClickableMessage, sendToClip, fromSerialDate };
