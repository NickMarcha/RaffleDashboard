import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

import axios from "axios";
import cheerio from "cheerio";
import "dotenv/config";

import { toSerialDate } from "./utils.js";
import logger from "./logger.js";

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

const scrapeURL =
  "https://www.againstmalaria.com/Fundraiser.aspx?FundraiserID=8960";
const tableSelector = "#MainContent_UcFundraiserSponsors1_grdDonors";
const rowSelectorOne = "tr.TableItemStyle.TableItemText";
const rowSelectorTwo = "tr.TableAlternatingItemStyle.TableItemText";
const totalSelector =
  "#MainContent_UcFundraiserSponsors1_ucPager2_pnlTextCounter";

await doc.loadInfo(); // loads document properties and worksheets
logger.info(doc.title);

const rawDataSheet = doc.sheetsByTitle["Raw Data"];
logger.info(rawDataSheet.title);

const refreshMilliseconds = 300000; // 5 minutes

export async function fetchScrapeJob() {
  logger.info(`Starting load from: ${scrapeURL}`);
  await axios
    .get(scrapeURL)
    .then(async (response) => {
      logger.info(`Loaded`);
      const html = response.data;
      const $ = cheerio.load(html);

      const tableExists = $(tableSelector).length > 0;
      logger.info(`Table exists: ${tableExists}`);

      const scrapedTotalDonos = +$(totalSelector)
        .text()
        .trim()
        .split(" ")
        .filter((str) => str !== "")[5];

      let dataOne = [];
      let dataTwo = [];

      let rows = $(`${tableSelector} ${rowSelectorOne}`);
      rows.each((index, element) => {
        const rowText = $(element).text().trim();
        const rowLines = rowText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== "");
        dataOne.push(rowLines);
      });

      rows = $(`${tableSelector} ${rowSelectorTwo}`);
      rows.each((index, element) => {
        const rowText = $(element).text().trim();
        const rowLines = rowText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== "");
        dataTwo.push(rowLines);
      });
      logger.info(`Scraped ${dataOne.length + dataTwo.length} rows`);

      const zipped = dataOne.map((value, index) => [value, dataTwo[index]]);
      const scrapedEntries = [].concat(...zipped).map((entry) => {
        const split = (nstr) => {
          let l = nstr.length / 2;
          return {
            one: nstr.substring(0, l),
            two: nstr.substring(l, nstr.length),
          };
        };
        if (entry.length === 8 && entry[6] == "TBA") {
          return {
            Sponsor: entry[0],
            Date: entry[1],
            Location: entry[2],
            Amount: entry[3],
            US$: entry[4],
            "Gift Aid": 0,
            Message: entry[5],
            Nets: split(entry[7]).one,
            "People Saved": split(entry[7]).two,
          };
        } else if (entry.length > 7) {
          return {
            Sponsor: entry[0],
            Date: entry[1],
            Location: entry[2],
            Amount: entry[3],
            US$: entry[4],
            "Gift Aid": entry[5],
            Message: entry[6],
            Nets: split(entry[7]).one,
            "People Saved": split(entry[7]).two,
          };
        } else {
          return {
            Sponsor: entry[0],
            Date: entry[1],
            Location: entry[2],
            Amount: entry[3],
            US$: entry[4],
            "Gift Aid": "",
            Message: entry[5],
            Nets: split(entry[6]).one,
            "People Saved": split(entry[6]).two,
          };
        }
      });

      let start = scrapedTotalDonos - scrapedEntries.length + 2;
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
        })
        .catch((error) => {
          logger.error(error);
        });
    })
    .catch((error) => {
      logger.error(error);
    });
}
