import Cookies from "js-cookie";
import axios from "axios";
import { ProcessedDonation } from "./types/Donation";
const baseRaffleApiUrl = "/api";

const raffleClient = axios.create({
  baseURL: baseRaffleApiUrl,
  headers: { "Content-Type": "application/json" },
});

export async function login(accessCode: string) {
  try {
    const response = await raffleClient.post("/login", { accessCode });

    if (response.status === 200) {
      const data = await response.data;
      const token = data.token; // Assuming the API response has a field named "token"
      console.log("Login successful");
      Cookies.set("bearerToken", token, { expires: 1, path: "" });
      return { success: true };
    } else {
      // Handle login error
      console.log("Login failed");
      const message = (await response.data).message;

      return { success: false, message };
    }
  } catch (error) {
    console.log("Error:", error);
    return { success: false, message: "Something wrong with request" };
  }
}

export function isLoggedIn() {
  const bearerToken = Cookies.get("bearerToken");

  if (bearerToken != null) {
    console.log("User is logged in");
    return true;
  } else {
    console.log("User is not logged in");
    return false;
  }
}

export function logout() {
  Cookies.remove("bearerToken", { path: "" });
  console.log("User logged out");
}

export async function fetchOverallTopDonations(): Promise<
  undefined | ProcessedDonation[]
> {
  try {
    return await raffleClient.get("/top").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchTodaysTopDonation(): Promise<
  undefined | ProcessedDonation[]
> {
  try {
    return await raffleClient.get("/todaysTop").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
function getAuthHeader() {
  const bearerToken = Cookies.get("bearerToken");
  return {
    Authorization: `Bearer ${bearerToken}`,
  };
}

export async function rollRaffle(): Promise<undefined | ProcessedDonation> {
  try {
    const response = await raffleClient.get(
      "/rollRaffle",

      { headers: getAuthHeader() }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function latestDonation(): Promise<undefined | ProcessedDonation> {
  try {
    return await raffleClient.get("/latest").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function getAuthHeaderJSONPayload() {
  const bearerToken = Cookies.get("bearerToken");
  return {
    Authorization: `Bearer ${bearerToken}`,
    "Content-Type": "application/json",
  };
}

export async function removeFromRaffle(
  id: number | undefined,
  lazy: boolean = false
) {
  if (id === undefined) {
    console.error("ID is undefined");
    return;
  }
  try {
    const response = await raffleClient.post(
      "/setEntryToPlayed",
      { entryID: id, lazy },
      { headers: getAuthHeaderJSONPayload() }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function doScrape() {
  try {
    const response = await raffleClient.get("/runScrape", {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchOverallTotals(): Promise<
  | undefined
  | {
      donationCount: number;
      donationTotal: number;
      raffleTotal: number;
      raffleDonationCount: number;
    }
> {
  try {
    const response = await raffleClient.get("/total");

    if (response.data.error) {
      throw new Error(response.data.error);
    } else {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchYeeAndPepeTotal(): Promise<
  | undefined
  | {
      yeeDonationTotal: number;
      pepeDonationTotal: number;
    }
> {
  try {
    return await raffleClient.get("/YeeAndPepe").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchTodaysTotals() {
  try {
    return await raffleClient.get("/todaysTotal").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchLatestFiftyDonations() {
  try {
    return await raffleClient.get("/latestFifty").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchRaffledEntries(): Promise<
  undefined | ProcessedDonation[]
> {
  try {
    return await raffleClient.get("/raffledEntries").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
export async function getAllRaffleEntries(donationPattern: any) {
  try {
    return await raffleClient
      .post("/getAllRaffleEntries", donationPattern, {
        headers: getAuthHeaderJSONPayload(),
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function saveUpdated() {
  try {
    return await raffleClient
      .get("/saveUpdated", {
        headers: getAuthHeader(),
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.error("Error saving updated data:", error);
  }
}

export async function rollRaffleMore(i: number) {
  try {
    const response = await raffleClient.post(
      "/rollRaffles",
      { amount: i },
      { headers: getAuthHeader() }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchYeeAndPepeLists(): Promise<
  | undefined
  | {
      yeeList: Map<string, { sum: number; count: number }>;
      pepeList: Map<string, { sum: number; count: number }>;
      otherList: Map<string, { sum: number; count: number }>;
    }
> {
  function reviver(key: any, value: any) {
    if (typeof value === "object" && value !== null) {
      if (value.dataType === "Map") {
        console.log("Map");
        return new Map(value.value);
      }
    }
    console.log("value");
    return value;
  }

  try {
    const data = (
      await raffleClient.get("/yeeAndPepeList", {
        transformResponse: [
          (data) => {
            let resp;
            try {
              resp = JSON.parse(data, reviver);
            } catch (e) {
              throw new Error("Error parsing JSON");
            }
            return resp;
          },
        ],
      })
    ).data;
    console.log(data);
    console.log("parsed");
    //console.log(JSON.parse(stringified, reviver));

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
