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
import { Donation, YeeOrPepe } from "types/Donation";
import { ProcessedDonation } from "./types/Donation";
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

if (!process.env.SHEETS_DB_ID || process.env.SHEETS_DB_ID === undefined) {
  throw new Error("SHEETS_DB_ID not set");
}
const doc = new GoogleSpreadsheet(
  process.env.SHEETS_DB_ID as string,
  jwtFromEnv
);

/**
 * The Authorization doc
 */
if (
  !process.env.SHEETS_AUTH_DB_ID ||
  process.env.SHEETS_AUTH_DB_ID === undefined
) {
  throw new Error("SHEETS_AUTH_DB_ID not set");
}
const accessCodeDoc = new GoogleSpreadsheet(
  process.env.SHEETS_AUTH_DB_ID as string,
  jwtFromEnv
);

let accessCodeSheet: GoogleSpreadsheetWorksheet;
let processedSheet: GoogleSpreadsheetWorksheet;
let rawDataSheet: GoogleSpreadsheetWorksheet;

/**
 * Ranges for each sheet
 */
const accessCodeRange = "A2:D50";

const processedSheetOffset = parseInt(
  process.env.PROCESSED_SHEET_OFFSET || "2"
);

/**
 * To allow for lazy updates, used with saveUpdated
 */
let wasUpdated = {
  //accessCode: false, Never updated from API
  processed: false,
  rawData: false,
};
/**
 * Save local cache updates to Google Spreadsheet DB after lazy updates
 */
async function saveUpdated() {
  logger.info(JSON.stringify(wasUpdated));

  await accessCodeSheet.saveUpdatedCells(); //Updates on any save

  if (wasUpdated.processed) {
    await processedSheet.saveUpdatedCells();
    wasUpdated.processed = false;
  }

  if (wasUpdated.rawData) {
    await rawDataSheet.saveUpdatedCells();
    wasUpdated.rawData = false;
  }
  logger.info("Saved Updated Sheets");
}

/**
 * Loads all sheets to cache sequentially
 */
const loadAllSheets = async () => {
  await accessCodeSheet.loadCells();
  logger.info("Loaded " + accessCodeDoc.title);
  await processedSheet.loadCells();
  logger.info("Loaded " + processedSheet.title);
  await rawDataSheet.loadCells();
  logger.info("Loaded " + rawDataSheet.title);
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

  accessCodeSheet = accessCodeDoc.sheetsByTitle["AccessCode"];
  if (accessCodeSheet === undefined) {
    throw new Error("AccessCode Sheet is undefined");
  }
  processedSheet = doc.sheetsByTitle["Processed"];
  if (processedSheet === undefined) {
    throw new Error("Processed Sheet is undefined");
  }
  rawDataSheet = doc.sheetsByTitle["RawData"];
  if (rawDataSheet === undefined) {
    throw new Error("Raw Data Sheet is undefined");
  }
  await loadAllSheets();

  instantiated = true;
};

/**
 * Fetches DB Totals
 * @returns
 */
async function fetchTotal(lazy: boolean = true) {
  const allProcessed = await fetchAllProcessed(lazy);

  const statTotals = {
    donationCount: allProcessed.length,
    donationTotal: allProcessed.map((d) => d.amount).reduce((a, b) => a + b, 0),
    raffleTotal: allProcessed
      .filter((d) => d.inRaffle)
      .map((d) => d.amount)
      .reduce((a, b) => a + b, 0),
    raffleDonationCount: allProcessed.filter((d) => d.inRaffle).length,
  };
  return statTotals;
}

async function fetchAllProcessed(
  lazy: boolean = false
): Promise<ProcessedDonation[]> {
  if (!lazy) {
    await processedSheet.loadCells();
  }

  let data: ProcessedDonation[] = [];

  for (let nr = 1; nr < processedSheet.rowCount; nr++) {
    const sheetIndex = nr + processedSheetOffset;
    //return trueNR incase something went wrong with lookup
    const nrCell = processedSheet.getCellByA1(`B${sheetIndex}`);
    if (nrCell.value === null) {
      break;
    }

    const trueNR = nrCell.value as number;

    if (trueNR !== nr) {
      logger.warn(`TrueNR ${trueNR} does not match lookup NR ${sheetIndex}`);
      break;
    }
    const inRaffle = processedSheet.getCellByA1(`A${sheetIndex}`)
      .value as boolean;
    const flag = processedSheet.getCellByA1(`C${sheetIndex}`).value as string;
    const sponsor = processedSheet.getCellByA1(`E${sheetIndex}`)
      .value as string;
    const date = processedSheet.getCellByA1(`F${sheetIndex}`)
      .numberValue as number;
    const location = processedSheet.getCellByA1(`G${sheetIndex}`)
      .value as string;
    const amount = processedSheet.getCellByA1(`H${sheetIndex}`)
      .numberValue as number;
    const message = processedSheet.getCellByA1(`I${sheetIndex}`)
      .value as string;
    const yeeOrPepe = processedSheet.getCellByA1(`J${sheetIndex}`)
      .value as YeeOrPepe;
    const lastUpdatedCell = processedSheet.getCellByA1(`K${sheetIndex}`);
    let lastUpdated = undefined;
    if (lastUpdatedCell.value !== null) {
      lastUpdated = new Date(lastUpdatedCell.value as string);
    }
    const updatedByCell = processedSheet.getCellByA1(`L${sheetIndex}`);
    let updatedBy = undefined;
    if (updatedByCell.value !== null) {
      updatedBy = updatedByCell.value as string;
    }

    const processedDonation: ProcessedDonation = new ProcessedDonation(
      trueNR,
      inRaffle,
      flag,
      sponsor,
      date,
      location,
      amount,
      message,
      yeeOrPepe,
      lastUpdated,
      updatedBy
    );
    data.push(processedDonation);
  }
  return data;
}

/**
 * Fetches overall top donation(s) as an array
 * @returns
 */
async function fetchTop(lazy: boolean = true) {
  const allProcessed = await fetchAllProcessed(lazy);

  const highestDonationAmount = allProcessed
    .map((d) => d.amount)
    .reduce((previousMax, current) => {
      return current > previousMax ? current : previousMax;
    }, 0);

  const topDonations = allProcessed.filter(
    (d) => d.amount === highestDonationAmount
  );
  return topDonations.map((d) => {
    return d.scrubConductor();
  });

  // for (let i = 0; i < result[0].length && result[0][i] != null; i++) {
  //   data.push({
  //     sponsor: result[0][i],
  //     date: fromSerialDate(result[1][i] as number),
  //     location: result[2][i],
  //     amount: result[3][i],
  //     message: result[4][i],
  //   });
  // }
  // return data;
}

/**
 * Fetches Yee and Pepe overall totals
 * @returns
 */
async function fetchYeeAndPepe(lazy = true) {
  const allProcessed = await fetchAllProcessed(lazy);
  const yeeDonationTotal = allProcessed
    .filter((d) => d.yeeOrPepe === "YEE")
    .reduce((a, b) => a + b.amount, 0);
  const pepeDonationTotal = allProcessed
    .filter((d) => d.yeeOrPepe === "PEPE")
    .reduce((a, b) => a + b.amount, 0);
  return {
    yeeDonationTotal,
    pepeDonationTotal,
  };
}

/**
 * Fetches Yee and Pepe overall totals
 * @returns
 */
async function fetchYeeAndPepeList(lazy = true): Promise<{
  yeeList: Map<string, { sum: number; count: number }>;
  pepeList: Map<string, { sum: number; count: number }>;
  otherList: Map<string, { sum: number; count: number }>;
}> {
  const allProcessed = (await fetchAllProcessed(lazy)).map((d) => {
    let newD = d.scrubConductor();
    newD.sponsor = newD.sponsor.toLowerCase();
    return newD;
  });
  const yeeDonations = allProcessed.filter((d) => d.yeeOrPepe === "YEE");
  const pepeDonations = allProcessed.filter((d) => d.yeeOrPepe === "PEPE");
  const otherDonations = allProcessed.filter((d) => d.yeeOrPepe === "NONE");
  const uniqueYeeSponsors: string[] = [
    ...new Set(yeeDonations.map((d) => d.sponsor)),
  ];
  const uniquePepeSponsors: string[] = [
    ...new Set(pepeDonations.map((d) => d.sponsor)),
  ];
  const uniqueOtherSponsors: string[] = [
    ...new Set(otherDonations.map((d) => d.sponsor)),
  ];

  let yeeList = new Map<string, { sum: number; count: number }>();

  uniqueYeeSponsors.forEach((sponsor) => {
    const donations = yeeDonations.filter((d) => d.sponsor === sponsor);
    const sum = donations.reduce((a, b) => a + b.amount, 0);
    yeeList.set(sponsor, { sum, count: donations.length });
  });

  let pepeList = new Map<string, { sum: number; count: number }>();

  uniquePepeSponsors.forEach((sponsor) => {
    const donations = pepeDonations.filter((d) => d.sponsor === sponsor);
    const sum = donations.reduce((a, b) => a + b.amount, 0);
    pepeList.set(sponsor, { sum, count: donations.length });
  });

  let otherList = new Map<string, { sum: number; count: number }>();

  uniqueOtherSponsors.forEach((sponsor) => {
    const donations = otherDonations.filter((d) => d.sponsor === sponsor);
    const sum = donations.reduce((a, b) => a + b.amount, 0);
    otherList.set(sponsor, { sum, count: donations.length });
  });

  return {
    yeeList,
    pepeList,
    otherList,
  };
}
/**
 * Fetch latest Donation from cache
 * @returns
 */
async function fetchLatest(lazy = true) {
  const allProcessed = await fetchAllProcessed(lazy);
  const latestDonation = allProcessed.reverse()[0];
  return latestDonation.scrubConductor();
  // let result = await APIfetch(latestRange, APICallsSheet, true);
  // let data = {
  //   isActive: result[0][0],
  //   sponsor: result[1][0],
  //   date: fromSerialDate(result[2][0] as number),
  //   location: result[3][0],
  //   amount: result[4][0],
  //   message: result[5][0],
  // };
  // return data;
}

/**
 * Fetches Todays top donation
 * @returns
 */
async function fetchTodaysTops(lazy = true): Promise<ProcessedDonation[]> {
  const allProcessed = await fetchAllProcessed(lazy);
  const lastDay = allProcessed.reverse()[0].date;
  const lastDaysTopDonationAmount = allProcessed
    .filter((d) => d.date === lastDay)
    .map((d) => d.amount)
    .reduce(
      (previousAmount, b) => (previousAmount > b ? previousAmount : b),
      0
    );
  const lastDaysTopDonations = allProcessed.filter(
    (d) => d.date === lastDay && d.amount === lastDaysTopDonationAmount
  );

  return lastDaysTopDonations.map((d) => d.scrubConductor());
  // let result = await APIfetch(todaysTopRange, APICallsSheet, true);
  // let data = {
  //   sponsor: result[0][0],
  //   date: fromSerialDate(result[1][0] as number),
  //   location: result[2][0],
  //   amount: result[3][0],
  //   message: result[4][0],
  // };
  // return data;
}

/**
 * Fetches latest donation day's totals
 * @returns
 */
async function fetchTodaysTotal(lazy = true) {
  const allProcessed = await fetchAllProcessed(lazy);
  const lastDay = allProcessed.reverse()[0].date;
  const lastDaysDonations = allProcessed.filter((d) => d.date === lastDay);

  return {
    yeeTotal: lastDaysDonations
      .filter((d) => d.yeeOrPepe === "YEE")
      .reduce((a, b) => a + b.amount, 0),
    pepeTotal: lastDaysDonations
      .filter((d) => d.yeeOrPepe === "PEPE")
      .reduce((a, b) => a + b.amount, 0),
    total: lastDaysDonations.reduce((a, b) => a + b.amount, 0),
  };
  throw new Error("Function not implemented.");
  // let result = await APIfetch(todaysTotalRange, APICallsSheet, true);
  // let data = {
  //   yeeTotal: result[0][0],
  //   pepeTotal: result[0][1],
  //   total: result[0][2],
  // };
  // return data;
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
  const patternOne = /[0-9]/g;
  const patternTwo = /[a-zA-Z]/g;

  if (!lazy) {
    logger.info("Not Lazy");
    await sheet.loadCells(range);
  } else {
    logger.info("Lazy");
  }
  let [left, right] = range.split(":");
  let leftNumStr = left.match(patternOne);
  let rightNumStr = right.match(patternOne);
  if (leftNumStr == null || rightNumStr == null) {
    throw new Error("No Num Str");
  }

  let leftNum = parseInt(leftNumStr.join(""));
  let leftAlpha = "" + left.match(patternTwo);
  let rightNum = parseInt(rightNumStr.join(""));
  let rightAlpha = "" + right.match(patternTwo);

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

/**
 * Fetches indexID's of valid Raffle entries, prepares for rolling raffle
 * @param lazy lazy use cache only, !lazy query Google Sheets
 * @returns
 * @returns "{index:NR, rollingSum:for weighted lookup}[]"
 */
async function fetchValidRaffleEntries(lazy: boolean) {
  logger.info("Fetching Valid Raffle Entries " + lazy ? "Lazy" : "Not Lazy");
  if (!lazy) await processedSheet.loadCells();

  let validRaffleEntries = [];
  let i = 1 + processedSheetOffset;

  while (processedSheet.getCellByA1(`B${i}`).value !== null) {
    if (processedSheet.getCellByA1(`A${i}`).value === true) {
      let prevSum: number =
        validRaffleEntries.length > 0
          ? validRaffleEntries[validRaffleEntries.length - 1].rollingSum
          : 0;

      validRaffleEntries.push({
        nr: processedSheet.getCellByA1(`B${i}`).value as number,
        rollingSum:
          (processedSheet.getCellByA1(`H${i}`).value as number) + prevSum,
      });
    }
    i++;
  }
  return validRaffleEntries;
}

/**
 *Fetch raffle entry by indexID
 * @param index IndexID
 * @param lazy lazy use cache only, !lazy query Google Sheets
 * @returns
 */
async function fetchEntryByID(
  nr: number,
  lazy: boolean
): Promise<ProcessedDonation> {
  const index = nr + processedSheetOffset;

  if (!lazy) await processedSheet.loadCells(`A${index}:J${index}`);

  const inRaffle = processedSheet.getCellByA1(`A${index}`).value as boolean;

  //return trueNR incase something went wrong with lookup
  const trueNR = processedSheet.getCellByA1(`B${index}`).value as number;

  if (trueNR !== nr) {
    logger.warn(`TrueNR ${trueNR} does not match lookup NR ${nr}`);
  }

  const flag = processedSheet.getCellByA1(`C${index}`).value as string;
  const sponsor = processedSheet.getCellByA1(`E${index}`).value as string;
  const date = processedSheet.getCellByA1(`F${index}`).numberValue as number;
  const location = processedSheet.getCellByA1(`G${index}`).value as string;
  const amount = processedSheet.getCellByA1(`H${index}`).numberValue as number;
  const message = processedSheet.getCellByA1(`I${index}`).value as string;
  const yeeOrPepe = processedSheet.getCellByA1(`J${index}`).value as YeeOrPepe;
  //TODO: Check Properly parse date
  const lastUpdatedCell = processedSheet.getCellByA1(`K${index}`);
  let lastUpdated = undefined;
  if (lastUpdatedCell.value !== null) {
    lastUpdated = new Date(lastUpdatedCell.value as string);
  }

  const updatedByCell = processedSheet.getCellByA1(`L${index}`);
  let updatedBy = undefined;
  if (updatedByCell.value !== null) {
    updatedBy = updatedByCell.value as string;
  }

  const processedDonation: ProcessedDonation = new ProcessedDonation(
    trueNR,
    inRaffle,
    flag,
    sponsor,
    date,
    location,
    amount,
    message,
    yeeOrPepe,
    lastUpdated,
    updatedBy
  );
  return processedDonation;
}

/**
 * Set Entry to played
 * @param entryID indexID
 * @param updatedBy Who updated the entry
 * @param lazy lazy use cache only, !lazy query Google Sheets
 */
async function setEntryToPlayed(nr: number, updatedBy: string, lazy: boolean) {
  const index = nr + processedSheetOffset;
  if (!lazy) {
    await processedSheet.loadCells(`A${index}:J${index}`);
  }

  //return trueNR incase something went wrong with lookup
  const trueNR = processedSheet.getCellByA1(`B${index}`).value as number;

  if (trueNR !== nr) {
    logger.warn(`TrueNR ${trueNR} does not match lookup NR ${nr}`);
  }

  const inRaffleCell = processedSheet.getCellByA1(`A${index}`);

  const lastUpdatedCell = processedSheet.getCellByA1(`K${index}`);
  const updatedByCell = processedSheet.getCellByA1(`L${index}`);

  lastUpdatedCell.value = new Date(Date.now()).toISOString();
  updatedByCell.value = updatedBy;
  inRaffleCell.value = false;

  wasUpdated.processed = true;
}

/**
 * Set Entry Timestamp to appear as rolled
 * @param entryID indexID
 * @param updatedBy Who updated the entry
 * @param lazy lazy use cache only, !lazy query Google Sheets
 * @returns void promise
 */
async function setEntryTimeStamp(nr: number, updatedBy: string, lazy: boolean) {
  try {
    const index = nr + processedSheetOffset;
    if (!lazy) {
      await processedSheet.loadCells(`A${index}:J${index}`);
    }

    //return trueNR incase something went wrong with lookup
    const trueNR = processedSheet.getCellByA1(`B${index}`).value as number;

    if (trueNR !== nr) {
      logger.warn(`TrueNR ${trueNR} does not match lookup NR ${nr}`);
    }

    const lastUpdatedCell = processedSheet.getCellByA1(`K${index}`);
    const updatedByCell = processedSheet.getCellByA1(`L${index}`);

    lastUpdatedCell.value = new Date(Date.now()).toISOString();
    updatedByCell.value = updatedBy;

    wasUpdated.processed = true;
    return;
  } catch (error) {
    logger.error(error);
  }
}

/**
 * Fetches latest 50 entries, lazy
 * @returns  50 entries sorted by date, newest first
 */
async function fetchLatest50() {
  throw new Error("Not implemented");
  // let result = await APIfetch(latest50Range, APICallsSheet, true);
  // let data = [];
  // for (let i = 0; i < result[0].length && result[0][i] != null; i++) {
  //   data.push({
  //     sponsor: result[0][i],
  //     date: fromSerialDate(result[1][i] as number),
  //     location: result[2][i],
  //     amount: result[3][i],
  //     message: result[4][i],
  //   });
  // }
  // // Reverse the array so it's in the correct order
  // data = data.reverse();
  // return data;
}

/**
 *  Fetch entries already raffled
 * @param lazy lazy use cache only, !lazy query Google Sheets
 * @returns
 */
async function fetchRaffledEntries(
  lazy: boolean
): Promise<ProcessedDonation[]> {
  const allProcessed = await fetchAllProcessed(lazy);
  const allRaffled = allProcessed
    .filter((entry) => !entry.inRaffle)
    .map((entry) => {
      entry.scrubConductor();
      return entry;
    });

  return allRaffled;
}

/**
 * Returns all raffle entries with data specified in donationPattern
 * @param donationPattern i.e {entryID: true, sponsor: true, date: true, location: true, amount: true, message: true, timeStamp: true}
 * @returns donation entry
 */
async function getAllRaffleEntries(donationPattern: any) {
  throw new Error("Not implemented");
  // let validRaffleEntries = [];
  // let i = 2;

  // while (processedSheet.getCellByA1(`B${i}`).value !== null) {
  //   if (processedSheet.getCellByA1(`A${i}`).value === false) {
  //     let obj: any = {};
  //     if (donationPattern.entryID) {
  //       obj.entryID = i;
  //     }
  //     if (donationPattern.sponsor) {
  //       obj.sponsor = processedSheet.getCellByA1(`B${i}`).value;
  //     }
  //     if (donationPattern.date) {
  //       obj.date = processedSheet.getCellByA1(`C${i}`).value;
  //     }
  //     if (donationPattern.location) {
  //       obj.location = processedSheet.getCellByA1(`D${i}`).value;
  //     }
  //     if (donationPattern.amount) {
  //       obj.amount = processedSheet.getCellByA1(`E${i}`).value;
  //     }
  //     if (donationPattern.message) {
  //       obj.message = processedSheet.getCellByA1(`F${i}`).value;
  //     }

  //     validRaffleEntries.push(obj);
  //   }
  //   i++;
  // }

  // return validRaffleEntries;
}

/**
 * Update the latest entries in the spreadsheet
 * @param scrapedEntries
 * @param fromSponsors
 * @param toSponsors
 * @param offset
 * @param lazy lazy use cache only, !lazy query Google Sheets
 */
async function updateLatest(
  scrapedEntries: Donation[],
  fromSponsors: number,
  toSponsors: number,
  offset: number,
  lazy: boolean
) {
  let start = fromSponsors + offset;
  if (!lazy) {
    await rawDataSheet.loadCells(`A${start}:I${toSponsors + offset}`);
    console.log(
      `Loaded cells in Spreadsheet from A${start}:I${toSponsors + offset}`
    );
  }

  scrapedEntries.reverse().forEach((entry, index) => {
    const row = index + start;
    rawDataSheet.getCellByA1(`A${row}`).numberValue = 1 + row - offset;
    rawDataSheet.getCellByA1(`B${row}`).value = entry.flagCode;
    rawDataSheet.getCellByA1(`C${row}`).value = entry.sponsor;
    rawDataSheet.getCellByA1(`D${row}`).value = entry.date;
    rawDataSheet.getCellByA1(`E${row}`).value = entry.location;
    rawDataSheet.getCellByA1(`F${row}`).value = entry.amount;
    rawDataSheet.getCellByA1(`G${row}`).numberValue = entry.USDollarAmount;
    rawDataSheet.getCellByA1(`H${row}`).numberValue = entry.giftAid;
    rawDataSheet.getCellByA1(`I${row}`).value = entry.message;
    rawDataSheet.getCellByA1(`J${row}`).value = entry.distributionFlag;
    rawDataSheet.getCellByA1(`K${row}`).value = entry.distributionStatus;
    rawDataSheet.getCellByA1(`L${row}`).numberValue = entry.numberOfNetsFunded;
    rawDataSheet.getCellByA1(`M${row}`).numberValue = entry.numberOfPeopleSaved;
  });
  console.log("Prepared cells for update");

  return await rawDataSheet
    .saveUpdatedCells()
    .then(() => {
      console.log("Cells updated");
    })
    .catch((error) => {
      console.log(error);
    });
}

const APIEndPoint = {
  fetchTotal,
  fetchTop,
  fetchYeeAndPepe,
  fetchLatest,
  fetchTodaysTop: fetchTodaysTops,
  fetchTodaysTotal,
  fetchAccessCodes,
  fetchValidRaffleEntries,
  fetchEntryByID,
  setEntryToPlayed,
  fetchLatest50,
  fetchRaffledEntries,
  setEntryTimeStamp,
  updateLatest,
  getAllRaffleEntries,
  instantiate,
  getInstantiated,
  saveUpdated,
  loadAllSheets,
  fetchYeeAndPepeList,
};
export default APIEndPoint;
