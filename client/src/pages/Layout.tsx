import { Outlet, Link } from "react-router-dom";
import LogginButton from "../components/LoginButton";
import LogoutButton from "../components/LogoutButton";
import { isLoggedIn } from "../raffleApi";
import "./Layout.css";
import TedYee from "../assets/images/tedYee.png";
import React from "react";
import { sendToClip } from "../util/util";

const Layout = () => {
  return (
    <>
      <nav>
        {isLoggedIn() && (
          <div>
            <ul>
              <li>
                <img src={TedYee} alt="" />
              </li>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/raffle">Raffle</Link>
              </li>
              <li>
                <Link to="/history">History</Link>
              </li>
              <li>
                <LogoutButton />
              </li>
            </ul>
          </div>
        )}
        {!isLoggedIn() && <LogginButton />}

        <span
          className="text-3xl font-bold underline cursor-copy hover:bg-sky-700 "
          title="Copy To Clipboard"
          onClick={() => {
            sendToClip("https://www.againstmalaria.com/destiny");
          }}
        >
          https://www.againstmalaria.com/destiny
        </span>
        <span
          title="Copy To Clipboard"
          className="linkSpan"
          onClick={() => {
            sendToClip(
              "https://docs.google.com/spreadsheets/d/e/2PACX-1vT02jloyxs18l0kZa3v216iIpRVfIO339nwWXAgPnFVlipoTTVo3x6XkN74NFMhwJok2IC5ccb2749v/pubhtml?gid=1688478255&single=true"
            );
          }}
        >
          Full Stats
        </span>
      </nav>

      <Outlet />

      <span className="footer">
        Maintained by <br />
        StrawWaffle
      </span>
    </>
  );
};

export default Layout;
