import "./util.css";

export function renderClickableMessage(message) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = message.split(urlRegex);

  return parts.map((part, index) => {
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
}
