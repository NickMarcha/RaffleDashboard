import Cookies from "js-cookie";
import axios from "axios";
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

export async function fetchOverallTopDonos() {
  try {
    return await raffleClient.get("/top").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchTodaysTopDono() {
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

export async function rollRaffle() {
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

export async function latestDono() {
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
  id: string | undefined,
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

export async function fetchOverallTotals() {
  try {
    return await raffleClient.get("/total").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchYeeAndPepeTotal() {
  try {
    return await raffleClient.get("/yeeandpepe").then((response) => {
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

export async function fetchLatestFiftydonos() {
  try {
    return await raffleClient.get("/latestfifty").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchSortedByRaffleTime() {
  try {
    return await raffleClient.get("/sortedByRaffleTime").then((response) => {
      return response.data;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
export async function getAllRaffleEntries(donoB: any) {
  try {
    return await raffleClient
      .post("/getAllRaffleEntries", donoB, {
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
