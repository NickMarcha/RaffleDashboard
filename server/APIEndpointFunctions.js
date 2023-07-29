import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import {
  base25stringToNumber,
  numberToBase25String,
  fromSerialDate,
  toSerialDate,
} from "./utils.js";
import logger from "./logger.js";

import "dotenv/config";
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

const jwtFromEnv = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: SCOPES,
});

const doc = new GoogleSpreadsheet(process.env.SHEETS_DB_ID, jwtFromEnv);

const accessCodeDoc = new GoogleSpreadsheet(
  process.env.SHEETS_AUTHDB_ID,
  jwtFromEnv
);

await accessCodeDoc.loadInfo();
await doc.loadInfo(); // loads document properties and worksheets
logger.info(doc.title);

const APICallsSheet = doc.sheetsByTitle["APICalls"];
logger.info(APICallsSheet.title);

const accessCodeSheet = accessCodeDoc.sheetsByTitle["AccessCode"];
logger.info(accessCodeDoc.title);

const proccessedSheet = doc.sheetsByTitle["Proccessed"];
logger.info(proccessedSheet.title);

const sortByRaffleTime = doc.sheetsByTitle["SortByRaffleTime"];
logger.info(sortByRaffleTime.title);

const rawDataSheet = doc.sheetsByTitle["Raw Data"];
logger.info(rawDataSheet.title);

const loadAllSheets = () => {
  APICallsSheet.loadCells();
  accessCodeSheet.loadCells();
  proccessedSheet.loadCells();
  sortByRaffleTime.loadCells();
  rawDataSheet.loadCells();
  logger.info("Loaded All Sheets");
};
await loadAllSheets();

const fetchRange = "A2:D2";
const topRange = "A5:E8";
const yeeAndPepeRange = "A10:A12";
const latestRange = "A15:F15";
const todaysTopRange = "A19:E19";
const todaysTotalRange = "A24:A26";
const accessCodeRange = "A2:D50";
const latest50Range = "B29:F78";

async function fetchTotal() {
  let result = await APIfetch(fetchRange, APICallsSheet, true);
  result = {
    donoCount: result[0][0],
    donoTotal: result[1][0],
    raffleTotal: result[2][0],
    raffleDonoCount: result[3][0],
  };
  return result;
}

async function fetchTop() {
  let result = await APIfetch(topRange, APICallsSheet, true);
  let data = [];
  for (let i = 0; i < result[0].length && result[0][i] != null; i++) {
    data.push({
      sponsor: result[0][i],
      date: fromSerialDate(result[1][i]),
      location: result[2][i],
      amount: result[3][i],
      message: result[4][i],
    });
  }
  return data;
}

async function fetchYeeAndPepe() {
  let result = await APIfetch(yeeAndPepeRange, APICallsSheet, true);
  let data = { yeeDonoTotal: result[0][0], pepeDonoTotal: result[0][1] };
  return data;
}

async function fetchLatest() {
  let result = await APIfetch(latestRange, APICallsSheet, true);
  let data = {
    isActive: result[0][0],
    sponsor: result[1][0],
    date: fromSerialDate(result[2][0]),
    location: result[3][0],
    amount: result[4][0],
    message: result[5][0],
  };
  return data;
}

async function fetchTodaysTop() {
  let result = await APIfetch(todaysTopRange, APICallsSheet, true);
  let data = {
    sponsor: result[0][0],
    date: fromSerialDate(result[1][0]),
    location: result[2][0],
    amount: result[3][0],
    message: result[4][0],
  };
  return data;
}

async function fetchTodaysTotal() {
  let result = await APIfetch(todaysTotalRange, APICallsSheet, true);
  let data = {
    yeeTotal: result[0][0],
    pepeTotal: result[0][1],
    total: result[0][2],
  };
  return data;
}

async function APIfetch(range, sheet, lazy) {
  const patt1 = /[0-9]/g;
  const patt2 = /[a-zA-Z]/g;

  if (!lazy) {
    logger.info("Not Lazy");
    await sheet.loadCells(range);
  } else {
    logger.info("Lazy");
  }
  let [left, right] = range.split(":");

  let leftNum = parseInt(left.match(patt1).join(""));
  let leftAlpha = "" + left.match(patt2);
  let rightNum = parseInt(right.match(patt1).join(""));
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

async function fetchAccessCodes() {
  let result = await APIfetch(accessCodeRange, accessCodeSheet, true);
  let data = [];
  for (let i = 0; i < result[0].length && result[0][i] != null; i++) {
    data.push({
      isActive: result[0][i],
      accessCode: result[1][i],
      alias: result[2][i],
      note: result[3][i],
    });
  }
  return data;
}

async function fetchValidRaffleEntries() {
  await proccessedSheet.loadCells();
  let validRaffleEntries = [];
  let i = 2;

  while (proccessedSheet.getCellByA1(`B${i}`).value !== null) {
    if (proccessedSheet.getCellByA1(`A${i}`).value === false) {
      let prevSum =
        validRaffleEntries.length > 0
          ? validRaffleEntries[validRaffleEntries.length - 1].rollingSum
          : 0;

      validRaffleEntries.push({
        index: i,
        rollingSum: proccessedSheet.getCellByA1(`E${i}`).value + prevSum,
      });
    }
    i++;
    //logger.info(i);
    //logger.info(proccessedSheet.getCellByA1(`B${i}`).value);
  }

  return validRaffleEntries;
}

async function fetchEntryByID(entryID, lazy) {
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
  };
  return entryData;
}

async function setEntryToPlayed(entryID, updatedBy) {
  await proccessedSheet.loadCells(`A${entryID}:J${entryID}`);
  const hasbeenplayedcell = proccessedSheet.getCellByA1(`A${entryID}`);
  const lastUpdatedCell = proccessedSheet.getCellByA1(`I${entryID}`);
  const updatedByCell = proccessedSheet.getCellByA1(`J${entryID}`);
  hasbeenplayedcell.value = true;

  lastUpdatedCell.value = new Date(Date.now()).toISOString();
  updatedByCell.value = updatedBy;
  await proccessedSheet.saveUpdatedCells();
}

async function setEntryTimeStamp(entryID, updatedBy) {
  try {
    await proccessedSheet.loadCells(`I${entryID}:J${entryID}`);
    const lastUpdatedCell = proccessedSheet.getCellByA1(`I${entryID}`);
    const updatedByCell = proccessedSheet.getCellByA1(`J${entryID}`);

    lastUpdatedCell.value = new Date(Date.now()).toISOString();
    updatedByCell.value = updatedBy;
    await proccessedSheet.saveUpdatedCells();
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
      date: fromSerialDate(result[1][i]),
      location: result[2][i],
      amount: result[3][i],
      message: result[4][i],
    });
  }

  data = data.reverse();
  return data;
}

async function fetchEntriesSortedByRaffleTime(lazy) {
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
      date: fromSerialDate(sortByRaffleTime.getCellByA1(`B${i}`).value),
      location: sortByRaffleTime.getCellByA1(`C${i}`).value,
      amount: sortByRaffleTime.getCellByA1(`D${i}`).value,
      message: sortByRaffleTime.getCellByA1(`E${i}`).value,
      timeStamp: sortByRaffleTime.getCellByA1(`F${i}`).value,
    });

    i++;
  }

  return raffleEntries;
}

async function updateLatest(scrapedEntries, scrapedTotalDonos, lazy) {
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
};
export default APIEndPoint;
