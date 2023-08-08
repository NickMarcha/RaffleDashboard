import React from "react";

const DonationSiteIframe = () => {
  const [iframeKey, setIframeKey] = React.useState(Math.random());
  return (
    <div className="flex-1 flex flex-col z-20 relative">
      <button
        type="button"
        className="w-10 h-10 absolute top-0 left-0 bg-blue justify-center items-center  rounded-full"
        onClick={() => setIframeKey(Math.random)}
        title="Refresh"
      >
        <svg
          className="animate-[spin_10s_linear_infinite] -ml-1 mr-3 h-5 w-5  text-white"
          fill="#000000"
          height="200px"
          width="200px"
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 489.645 489.645"
          xmlSpace="preserve"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <g>
              <path d="M460.656,132.911c-58.7-122.1-212.2-166.5-331.8-104.1c-9.4,5.2-13.5,16.6-8.3,27c5.2,9.4,16.6,13.5,27,8.3 c99.9-52,227.4-14.9,276.7,86.3c65.4,134.3-19,236.7-87.4,274.6c-93.1,51.7-211.2,17.4-267.6-70.7l69.3,14.5 c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-122.8-25c-20.6-2-25,16.6-23.9,22.9l15.6,123.8 c1,10.4,9.4,17.7,19.8,17.7c12.8,0,20.8-12.5,19.8-23.9l-6-50.5c57.4,70.8,170.3,131.2,307.4,68.2 C414.856,432.511,548.256,314.811,460.656,132.911z"></path>{" "}
            </g>
          </g>
        </svg>
        {/* <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg> */}
      </button>
      <iframe
        key={iframeKey}
        className="flex-1"
        src="https://www.againstmalaria.com/Fundraiser.aspx?FundraiserID=8960#MainContent_UcFundraiserSponsors1_grdDonors"
        title="Malaria Fundraiser"
      />
    </div>
  );
};

export default DonationSiteIframe;
