import { JWT } from "google-auth-library";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import {
  base25stringToNumber,
  numberToBase25String,
  fromSerialDate,
  toSerialDate,
} from "./utils";
import logger from "./logger";

import "dotenv/config";
/**
 * Permissions needed for Google Spreadsheet API access
 */
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

const jwtFromEnv = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: SCOPES,
});

/**
 * The Database doc
 */
const doc = new GoogleSpreadsheet(
  process.env.SHEETS_DB_ID as string,
  jwtFromEnv
);

/**
 * The Authorization doc
 */
const accessCodeDoc = new GoogleSpreadsheet(
  process.env.SHEETS_AUTHDB_ID as string,
  jwtFromEnv
);

let APICallsSheet: GoogleSpreadsheetWorksheet;
let accessCodeSheet: GoogleSpreadsheetWorksheet;
let proccessedSheet: GoogleSpreadsheetWorksheet;
let sortByRaffleTime: GoogleSpreadsheetWorksheet;
let rawDataSheet: GoogleSpreadsheetWorksheet;
/**
 * To allow for lazy updates, used with saveUpdated
 */
let wasUpdated = {
  APICalls: false,
  accessCode: false,
  proccessed: false,
  sortByRaffleTime: false,
  rawData: false,
};
/**
 * Save local cache updates to Google Spreadsheet DB after lazy updates
 */
async function saveUpdated() {
  logger.info(JSON.stringify(wasUpdated));
  if (wasUpdated.APICalls) {
    await APICallsSheet.saveUpdatedCells();
    wasUpdated.APICalls = false;
  }
  if (wasUpdated.accessCode) {
    await accessCodeSheet.saveUpdatedCells();
    wasUpdated.accessCode = false;
  }
  if (wasUpdated.proccessed) {
    await proccessedSheet.saveUpdatedCells();
    wasUpdated.proccessed = false;
  }
  if (wasUpdated.sortByRaffleTime) {
    await sortByRaffleTime.saveUpdatedCells();
    wasUpdated.sortByRaffleTime = false;
  }
  if (wasUpdated.rawData) {
    await rawDataSheet.saveUpdatedCells();
    wasUpdated.rawData = false;
  }
  logger.info("Saved Updated Cells");
}

/**
 * Loads all sheets to cache sequentially
 */
const loadAllSheets = async () => {
  await APICallsSheet.loadCells();
  logger.info(APICallsSheet.title);
  await accessCodeSheet.loadCells();
  logger.info(accessCodeDoc.title);
  await proccessedSheet.loadCells();
  logger.info(proccessedSheet.title);
  await sortByRaffleTime.loadCells();
  await rawDataSheet.loadCells();
  logger.info(sortByRaffleTime.title);
  logger.info("Loaded All Sheets");
};

/**
 * Has first sheets load finished
 */
let instantiated = false;
/**
 * Has first sheets load finished
 * @returns has instantiated
 */
const getInstantiated = () => {
  return instantiated;
};

/**
 * Instantiates sheet properties and loads them to cache
 */
const instantiate = async () => {
  await accessCodeDoc.loadInfo();
  await doc.loadInfo(); // loads document properties and worksheets
  logger.info(doc.title);

  APICallsSheet = doc.sheetsByTitle["APICalls"];
  accessCodeSheet = accessCodeDoc.sheetsByTitle["AccessCode"];
  proccessedSheet = doc.sheetsByTitle["Proccessed"];
  sortByRaffleTime = doc.sheetsByTitle["SortByRaffleTime"];

  rawDataSheet = doc.sheetsByTitle["Raw Data"];
  logger.info(rawDataSheet.title);
  await loadAllSheets();
  instantiated = true;
};

///// API Fetch ranges
const fetchRange = "A2:D2";
const topRange = "A5:E8";
const yeeAndPepeRange = "A10:A12";
const latestRange = "A15:F15";
const todaysTopRange = "A19:E19";
const todaysTotalRange = "A24:A26";
const accessCodeRange = "A2:D50";
const latest50Range = "B29:F78";

/**
 * Fetches DB Totals
 * @returns
 */
async function fetchTotal() {
  let fetchResult = await APIfetch(fetchRange, APICallsSheet, true);
  const statTotals = {
    donoCount: fetchResult[0][0],
    donoTotal: fetchResult[1][0],
    raffleTotal: fetchResult[2][0],
    raffleDonoCount: fetchResult[3][0],
  } as StatTotals;
  return statTotals;
}

/**
 * Fetches overall top donation(s) as an array
 * @returns
 */
async function fetchTop() {
  let result = await APIfetch(topRange, APICallsSheet, true);
  let data: DonationData[] = [];
  for (let i = 0; i < result[0].length && result[0][i] != null; i++) {
    data.push({
      sponsor: result[0][i],
      date: fromSerialDate(result[1][i] as number),
      location: result[2][i],
      amount: result[3][i],
      message: result[4][i],
    } as DonationData);
  }
  return data;
}

/**
 * Fetches Yee and Pepe overall totals
 * @returns
 */
async function fetchYeeAndPepe() {
  let result = await APIfetch(yeeAndPepeRange, APICallsSheet, true);
  let data = {
    yeeDonoTotal: result[0][0],
    pepeDonoTotal: result[0][1],
  } as YeeAndPepeTotal;
  return data;
}
/**
 * Fetch latest Donation from cache
 * @returns
 */
async function fetchLatest() {
  let result = await APIfetch(latestRange, APICallsSheet, true);
  let data = {
    isActive: result[0][0],
    sponsor: result[1][0],
    date: fromSerialDate(result[2][0] as number),
    location: result[3][0],
    amount: result[4][0],
    message: result[5][0],
  } as DonationData;
  return data;
}

/**
 * Fetches Todays top donation
 * @returns
 */
async function fetchTodaysTop() {
  let result = await APIfetch(todaysTopRange, APICallsSheet, true);
  let data = {
    sponsor: result[0][0],
    date: fromSerialDate(result[1][0] as number),
    location: result[2][0],
    amount: result[3][0],
    message: result[4][0],
  } as DonationData;
  return data;
}

/**
 * Fetches latest donation day's totals
 * @returns
 */
async function fetchTodaysTotal() {
  let result = await APIfetch(todaysTotalRange, APICallsSheet, true);
  let data = {
    yeeTotal: result[0][0],
    pepeTotal: result[0][1],
    total: result[0][2],
  } as TodaysTotals;
  return data;
}
/**
 * Generalized Sheet fetch function using A1 notation
 * @param range i.e. "A1:C4"
 * @param sheet sheet to fetch from
 * @param lazy lazy use cache only, !lazy query Google Sheets
 * @returns
 */
async function APIfetch(
  range: string,
  sheet: GoogleSpreadsheetWorksheet,
  lazy: boolean
) {
  const patt1 = /[0-9]/g;
  const patt2 = /[a-zA-Z]/g;

  if (!lazy) {
    logger.info("Not Lazy");
    await sheet.loadCells(range);
  } else {
    logger.info("Lazy");
  }
  let [left, right] = range.split(":");
  let leftNumStr = left.match(patt1);
  let rightNumStr = right.match(patt1);
  if (leftNumStr == null || rightNumStr == null) {
    throw new Error("No Num Str");
  }

  let leftNum = parseInt(leftNumStr.join(""));
  let leftAlpha = "" + left.match(patt2);
  let rightNum = parseInt(rightNumStr.join(""));
  let rightAlpha = "" + right.match(patt2);

  let result = [];

  for (
    let i = base25stringToNumber(leftAlpha);
    i <= base25stringToNumber(rightAlpha);
    i++
  ) {
    let row = [];
    for (let j = leftNum; j <= rightNum; j++) {
      let cellA1 = `${numberToBase25String(i)}${j}`;

      let cell = sheet.getCellByA1(cellA1);
      row.push(cell.value);
    }
    result.push(row);
  }
  return result;
}

/**
 * Fetch access codes from Authorization sheet
 * @returns
 */
async function fetchAccessCodes() {
  let result = await APIfetch(accessCodeRange, accessCodeSheet, true);
  let data: AuthorizationEntry[] = [];
  for (let i = 0; i < result[0].length && result[0][i] != null; i++) {
    data.push({
      isActive: result[0][i],
      accessCode: result[1][i],
      alias: result[2][i],
      note: result[3][i],
    } as AuthorizationEntry);
  }
  return data;
}

/**
 * Fetches indexID's of valid Raffle entries, prepares for rolling raffle
 * @param lazy lazy use cache only, !lazy query Google Sheets
 * @returns "{index:indexid, rollingSum:for weighted lookup}[]"
 */
async function fetchValidRaffleEntries(lazy: boolean) {
  logger.info("Fetching Valid Raffle Entries " + lazy ? "Lazy" : "Not Lazy");
  if (!lazy) await proccessedSheet.loadCells();

  let validRaffleEntries = [];
  let i = 2;

  while (proccessedSheet.getCellByA1(`B${i}`).value !== null) {
    if (proccessedSheet.getCellByA1(`A${i}`).value === false) {
      let prevSum: number =
        validRaffleEntries.length > 0
          ? validRaffleEntries[validRaffleEntries.length - 1].rollingSum
          : 0;

      validRaffleEntries.push({
        index: i,
        rollingSum:
          (proccessedSheet.getCellByA1(`E${i}`).value as number) + prevSum,
      });
    }
    i++;
  }
  return validRaffleEntries;
}

/**
 *
 * @param entryID IndexID
 * @param lazy lazy use cache only, !lazy query Google Sheets
 * @returns
 */
async function fetchEntryByID(entryID: number, lazy: boolean) {
  if (!lazy) await proccessedSheet.loadCells(`A${entryID}:J${entryID}`);
  const hasbeenplayedcell = proccessedSheet.getCellByA1(`A${entryID}`);
  const hasbeenplayed = hasbeenplayedcell.value;
  const sponsor = proccessedSheet.getCellByA1(`B${entryID}`).value;
  const date = proccessedSheet.getCellByA1(`C${entryID}`).value;
  const location = proccessedSheet.getCellByA1(`D${entryID}`).value;
  const amount = proccessedSheet.getCellByA1(`E${entryID}`).value;
  const message = proccessedSheet.getCellByA1(`F${entryID}`).value;
  const entryData = {
    entryID,
    hasbeenplayed,
    sponsor,
    date,
    location,
    amount,
    message,
  } as DonationData;
  return entryData;
}

async function setEntryToPlayed(
  entryID: number,
  updatedBy: string,
  lazy: boolean
) {
  if (!lazy) {
    await proccessedSheet.loadCells(`A${entryID}:J${entryID}`);
  }
  const hasbeenplayedcell = proccessedSheet.getCellByA1(`A${entryID}`);
  const lastUpdatedCell = proccessedSheet.getCellByA1(`I${entryID}`);
  const updatedByCell = proccessedSheet.getCellByA1(`J${entryID}`);
  hasbeenplayedcell.value = true;

  lastUpdatedCell.value = new Date(Date.now()).toISOString();
  updatedByCell.value = updatedBy;
  wasUpdated.proccessed = true;
}

async function setEntryTimeStamp(
  entryID: number,
  updatedBy: string,
  lazy: boolean
) {
  try {
    if (!lazy) {
      await proccessedSheet.loadCells(`I${entryID}:J${entryID}`);
    }
    const lastUpdatedCell = proccessedSheet.getCellByA1(`I${entryID}`);
    const updatedByCell = proccessedSheet.getCellByA1(`J${entryID}`);

    lastUpdatedCell.value = new Date(Date.now()).toISOString();
    updatedByCell.value = updatedBy;
    wasUpdated.proccessed = true;
    return;
  } catch (error) {
    logger.error(error);
  }
}

async function fetchLatest50() {
  let result = await APIfetch(latest50Range, APICallsSheet, true);
  let data = [];
  for (let i = 0; i < result[0].length && result[0][i] != null; i++) {
    data.push({
      sponsor: result[0][i],
      date: fromSerialDate(result[1][i] as number),
      location: result[2][i],
      amount: result[3][i],
      message: result[4][i],
    });
  }

  data = data.reverse();
  return data;
}

async function fetchEntriesSortedByRaffleTime(lazy: boolean) {
  if (!lazy) {
    logger.info("Not Lazy");
    await sortByRaffleTime.loadCells();
  } else {
    logger.info("Lazy");
  }
  let i = 2;
  let raffleEntries = [];

  while (sortByRaffleTime.getCellByA1(`A${i}`).value !== null) {
    raffleEntries.push({
      sponsor: sortByRaffleTime.getCellByA1(`A${i}`).value,
      date: fromSerialDate(
        sortByRaffleTime.getCellByA1(`B${i}`).value as number
      ),
      location: sortByRaffleTime.getCellByA1(`C${i}`).value,
      amount: sortByRaffleTime.getCellByA1(`D${i}`).value,
      message: sortByRaffleTime.getCellByA1(`E${i}`).value,
      timeStamp: sortByRaffleTime.getCellByA1(`F${i}`).value,
    });

    i++;
  }

  return raffleEntries;
}

async function getAllRaffleEntries(donoPattern: any) {
  let validRaffleEntries = [];
  let i = 2;

  while (proccessedSheet.getCellByA1(`B${i}`).value !== null) {
    if (proccessedSheet.getCellByA1(`A${i}`).value === false) {
      let obj: any = {};
      if (donoPattern.entryID) {
        obj.entryID = i;
      }
      if (donoPattern.sponsor) {
        obj.sponsor = proccessedSheet.getCellByA1(`B${i}`).value;
      }
      if (donoPattern.date) {
        obj.date = proccessedSheet.getCellByA1(`C${i}`).value;
      }
      if (donoPattern.location) {
        obj.location = proccessedSheet.getCellByA1(`D${i}`).value;
      }
      if (donoPattern.amount) {
        obj.amount = proccessedSheet.getCellByA1(`E${i}`).value;
      }
      if (donoPattern.message) {
        obj.message = proccessedSheet.getCellByA1(`F${i}`).value;
      }

      validRaffleEntries.push(obj);
    }
    i++;
  }

  return validRaffleEntries;
}

async function updateLatest(
  scrapedEntries: any[],
  scrapedTotalDonos: number,
  lazy: boolean
) {
  let start = scrapedTotalDonos - scrapedEntries.length + 2;
  if (!lazy)
    await rawDataSheet.loadCells(`A${start}:I${scrapedTotalDonos + 1}`);
  logger.info(
    `Loaded cells in Spreadsheet from A${start}:I${scrapedTotalDonos + 1}`
  );

  scrapedEntries.reverse().forEach((entry, index) => {
    const row = index + start;
    rawDataSheet.getCellByA1(`A${row}`).value = entry["Sponsor"];
    rawDataSheet.getCellByA1(`B${row}`).numberValue = toSerialDate(
      entry["Date"]
    );
    rawDataSheet.getCellByA1(`C${row}`).value = entry["Location"];
    rawDataSheet.getCellByA1(`D${row}`).value = entry["Amount"];
    rawDataSheet.getCellByA1(`E${row}`).value = entry["US$"];
    rawDataSheet.getCellByA1(`F${row}`).value = entry["Gift Aid"];
    rawDataSheet.getCellByA1(`G${row}`).value = entry["Message"];
    rawDataSheet.getCellByA1(`H${row}`).value = entry["Nets"];
    rawDataSheet.getCellByA1(`I${row}`).value = entry["People Saved"];
  });
  logger.info("Prepared cells for update");

  rawDataSheet
    .saveUpdatedCells()
    .then(() => {
      logger.info("Cells updated");
      loadAllSheets();
    })
    .catch((error) => {
      logger.error(error);
    });
}

const APIEndPoint = {
  fetchTotal,
  fetchTop,
  fetchYeeAndPepe,
  fetchLatest,
  fetchTodaysTop,
  fetchTodaysTotal,
  fetchAccessCodes,
  fetchValidRaffleEntries,
  fetchEntryByID,
  setEntryToPlayed,
  fetchLatest50,
  fetchEntriesSortedByRaffleTime,
  setEntryTimeStamp,
  updateLatest,
  getAllRaffleEntries,
  instantiate,
  getInstantiated,
  saveUpdated,
};
export default APIEndPoint;
