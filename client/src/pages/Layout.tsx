import { Outlet, Link } from "react-router-dom";
import LogginButton from "../components/LoginButton";
import LogoutButton from "../components/LogoutButton";
import { isLoggedIn } from "../raffleApi";
import "./Layout.css";
import TedYee from "../assets/images/tedYee.png";
import TedPepe from "../assets/images/tedPepe.png";
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
              {/* <li>
                <Link to="/rafflemore">RaffleMore</Link>{" "}
              </li> */}
              <li>
                <Link to="/history">History</Link>
              </li>
              <li>
                <Link to="/yeeVSpepe">
                  <div className="inline-flex	 h-5">
                    <img className="flex-1" src={TedYee} alt="" />
                    <span className="flex-1">vs</span>
                    <img className="flex-1" src={TedPepe} alt="" />
                  </div>
                </Link>
              </li>
              <li>
                <LogoutButton />
              </li>
            </ul>
          </div>
        )}
        {!isLoggedIn() && <LogginButton />}

        <div className="flex flex-row justify-center items-center max-h-8">
          <a
            className="text-2xl font-bold underline hover:bg-sky-700 "
            title="https://www.againstmalaria.com/destiny"
            href="https://www.againstmalaria.com/destiny"
          >
            https://www.againstmalaria.com/destiny
          </a>
          <button
            data-tooltip-target="button-payment-example-copy-clipboard-tooltip"
            data-tooltip-placement="bottom"
            title="Copy: https://www.againstmalaria.com/destiny"
            onClick={() => {
              sendToClip("https://www.againstmalaria.com/destiny");
            }}
            type="button"
            data-copy-state="copy"
            className="flex items-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 border-l border-gray-200 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-800 hover:text-blue-700 dark:hover:text-white copy-to-clipboard-button"
          >
            <svg
              className="w-3.5 h-3.5 mr-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 20"
            >
              <path d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"></path>
              <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z"></path>
            </svg>
          </button>
        </div>

        <div className="flex flex-row justify-center items-center max-h-8">
          <a
            className="text-2xl font-bold underline hover:bg-sky-700 "
            title="https://docs.google.com/spreadsheets/d/14tc3e6rPawCfjkVUiCW5QObgRsYM26Yzqd8Nhx2VL90"
            href="https://docs.google.com/spreadsheets/d/14tc3e6rPawCfjkVUiCW5QObgRsYM26Yzqd8Nhx2VL90"
          >
            Full Stats
          </a>
          <button
            title="Copy: https://docs.google.com/spreadsheets/d/14tc3e6rPawCfjkVUiCW5QObgRsYM26Yzqd8Nhx2VL90"
            data-tooltip-target="button-payment-example-copy-clipboard-tooltip"
            data-tooltip-placement="bottom"
            onClick={() => {
              sendToClip(
                "https://docs.google.com/spreadsheets/d/14tc3e6rPawCfjkVUiCW5QObgRsYM26Yzqd8Nhx2VL90"
              );
            }}
            type="button"
            data-copy-state="copy"
            className="flex items-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 border-l border-gray-200 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-800 hover:text-blue-700 dark:hover:text-white copy-to-clipboard-button"
          >
            <svg
              className="w-3.5 h-3.5 mr-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 20"
            >
              <path d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"></path>
              <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z"></path>
            </svg>
          </button>
        </div>
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
