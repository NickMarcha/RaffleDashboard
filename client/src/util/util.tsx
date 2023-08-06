import React from "react";

const FindYoutubeVideoId = (url: string) => {
  var regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match && match[2].length == 11) {
    return match[2];
  } else {
    return null;
  }
};

const FindYoutubeVideoIdFromParagraph = (paragraph: string) => {
  const strings = paragraph.split(" ");
  for (let i = 0; i < strings.length; i++) {
    const id = FindYoutubeVideoId(strings[i]);
    if (id != null) return id;
  }
  return null;
};

const RenderClickableMessage: React.FC<{ message: string }> = ({ message }) => {
  if (message == null) return <></>;
  try {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = message.split(urlRegex);

    const elements: (string | React.JSX.Element)[] = parts.map(
      (part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              className="text-blue hover:underline"
              title={part}
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
            >
              {<p className="w-60 truncate ...">{part}</p>}
            </a>
          );
        } else {
          return part;
        }
      }
    );

    return <> {elements}</>;
  } catch (e) {
    console.log(e);
    return <></>;
  }
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

const flagCdnURLStart = "https://flagcdn.com/48x36/";
const flagCdnURLEnd = ".png";
const flagLookup: Map<string, string> = new Map<string, string>([
  ["england", "https://flagcdn.com/48x36/gb-eng.png"],
  ["wales", "https://flagcdn.com/48x36/gb-wls.png"],
  ["ww", "https://i.imgur.com/vJXGYCI.png"],
  ["scotland", "https://flagcdn.com/48x36/gb-sct.png"],
]);

function getFlagUrl(flagCode: string) {
  if (flagLookup.has(flagCode)) {
    return flagLookup.get(flagCode);
  } else {
    return flagCdnURLStart + flagCode + flagCdnURLEnd;
  }
}

export {
  RenderClickableMessage,
  sendToClip,
  fromSerialDate,
  getFlagUrl,
  FindYoutubeVideoIdFromParagraph,
};
