import React from "react";

const StrawPollEmbed: React.FC<{ strawPollID: string }> = ({ strawPollID }) => {
  return (
    <div
      className="strawpoll-embed"
      id={"strawpoll_" + strawPollID}
      style={{
        height: "608px",
        maxWidth: "640px",
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <iframe
        title="StrawPoll Embed"
        id={"strawpoll_iframe_" + strawPollID}
        src={"https://strawpoll.com/embed/" + strawPollID}
        style={{
          position: "static",
          visibility: "visible",
          display: "block",
          width: "100%",
          flexGrow: 1,
        }}
        allowFullScreen
        allowTransparency
      >
        Loading...
      </iframe>
      <script async src="https://cdn.strawpoll.com/dist/widgets.js"></script>
    </div>
  );
};

export default StrawPollEmbed;
