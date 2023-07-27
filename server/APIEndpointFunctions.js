import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import {
  base25stringToNumber,
  numberToBase25String,
  fromSerialDate,
} from "./utils.js";

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
console.log(doc.title);
console.log(accessCodeDoc.title);

const APICallsSheet = doc.sheetsByTitle["APICalls"];

const accessCodeSheet = accessCodeDoc.sheetsByTitle["AccessCode"];

console.log(APICallsSheet.title);

const fetchRange = "A2:D2";
const topRange = "A5:E8";
const yeeAndPepeRange = "A10:A12";
const latestRange = "A15:F15";
const todaysTopRange = "A19:E19";
const todaysTotalRange = "A24:A26";

export async function fetchTotal() {
  let result = await APIfetch(fetchRange, APICallsSheet);
  result = {
    donoCount: result[0][0],
    donoTotal: result[1][0],
    raffleTotal: result[2][0],
    raffleDonoCount: result[3][0],
  };
  return result;
}

export async function fetchTop() {
  let result = await APIfetch(topRange, APICallsSheet);
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

export async function fetchYeeAndPepe() {
  let result = await APIfetch(yeeAndPepeRange, APICallsSheet);
  let data = { yeeDonoTotal: result[0][0], pepeDonoTotal: result[0][1] };
  return data;
}

export async function fetchLatest() {
  let result = await APIfetch(latestRange, APICallsSheet);
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

export async function fetchTodaysTop() {
  let result = await APIfetch(todaysTopRange, APICallsSheet);
  let data = {
    sponsor: result[0][0],
    date: fromSerialDate(result[1][0]),
    location: result[2][0],
    amount: result[3][0],
    message: result[4][0],
  };
  return data;
}

export async function fetchTodaysTotal() {
  let result = await APIfetch(todaysTotalRange, APICallsSheet);
  let data = {
    yeeTotal: result[0][0],
    pepeTotal: result[0][1],
    total: result[0][2],
  };
  return data;
}

async function APIfetch(range, sheet) {
  const patt1 = /[0-9]/g;
  const patt2 = /[a-zA-Z]/g;

  await sheet.loadCells(range);
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

const accessCodeRange = "A2:D50";

export async function fetchAccessCodes() {
  let result = await APIfetch(accessCodeRange, accessCodeSheet);
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

const proccessedSheet = doc.sheetsByTitle["Proccessed"];

console.log(proccessedSheet.title);

export async function fetchValidRaffleEntries() {
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
    //console.log(i);
    //console.log(proccessedSheet.getCellByA1(`B${i}`).value);
  }

  return validRaffleEntries;
}

export async function fetchEntryByID(entryID) {
  await proccessedSheet.loadCells(`A${entryID}:J${entryID}`);
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

export async function setEntryToPlayed(entryID, updatedBy) {
  await proccessedSheet.loadCells(`A${entryID}:J${entryID}`);
  const hasbeenplayedcell = proccessedSheet.getCellByA1(`A${entryID}`);
  const lastUpdatedCell = proccessedSheet.getCellByA1(`I${entryID}`);
  const updatedByCell = proccessedSheet.getCellByA1(`J${entryID}`);
  hasbeenplayedcell.value = true;

  lastUpdatedCell.value = new Date(Date.now()).toISOString();
  updatedByCell.value = updatedBy;
  await proccessedSheet.saveUpdatedCells();
}

export async function setEntryTimeStamp(entryID, updatedBy) {
  await proccessedSheet.loadCells(`I${entryID}:J${entryID}`);
  const lastUpdatedCell = proccessedSheet.getCellByA1(`I${entryID}`);
  const updatedByCell = proccessedSheet.getCellByA1(`J${entryID}`);

  lastUpdatedCell.value = new Date(Date.now()).toISOString();
  updatedByCell.value = updatedBy;
  await proccessedSheet.saveUpdatedCells();
}

const latest50Range = "B29:F78";

export async function fetchLatest50() {
  let result = await APIfetch(latest50Range, APICallsSheet);
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

const sortByRaffleTime = doc.sheetsByTitle["SortByRaffleTime"];

console.log(sortByRaffleTime.title);

export async function fetchEntriesSortedByRaffleTime() {
  await sortByRaffleTime.loadCells();
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
