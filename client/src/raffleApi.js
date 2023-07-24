import Cookies from "js-cookie";

const baseApiUrl = "/api";

export async function login(accessCode) {
  try {
    const response = await fetch(`${baseApiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessCode }),
    });

    if (response.ok) {
      const data = await response.json();
      const token = data.token; // Assuming the API response has a field named "token"
      console.log("Login successful");
      Cookies.set("bearerToken", token, { expires: 1, path: "" });
      return { success: true };
    } else {
      // Handle login error
      console.log("Login failed");
      const message = await response.json().message;

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

export async function fetchData() {}

export async function fetchOverallTopDonos() {
  try {
    const response = await fetch(`${baseApiUrl}/top`);
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchTodaysTopDono() {
  try {
    const response = await fetch(`${baseApiUrl}/todaysTop`);
    const jsonData = await response.json();
    return jsonData;
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
    const response = await fetch(`${baseApiUrl}/rollRaffle`, {
      headers: getAuthHeader(),
    });
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function latestDono() {
  try {
    const response = await fetch(`${baseApiUrl}/latest`);
    const jsonData = await response.json();
    return jsonData;
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

export async function removeFromRaffle(id) {
  try {
    const response = await fetch(`${baseApiUrl}/setEntryToPlayed`, {
      method: "POST",
      headers: getAuthHeaderJSONPayload(),
      body: JSON.stringify({ entryID: id }),
    });
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function doScrape() {
  try {
    const response = await fetch(`${baseApiUrl}/runScrape`, {
      headers: getAuthHeader(),
    });
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchOverallTotals() {
  try {
    const response = await fetch(`${baseApiUrl}/total`);
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchYeeAndPepeTotal() {
  try {
    const response = await fetch(`${baseApiUrl}/yeeandpepe`);
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchTodaysTotals() {
  try {
    const response = await fetch(`${baseApiUrl}/todaysTotal`);
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchLatestFiftydonos() {
  try {
    const response = await fetch(`${baseApiUrl}/latestfifty`);
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function fetchSortedByRaffleTime() {
  try {
    const response = await fetch(`${baseApiUrl}/sortedByRaffleTime`);
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
