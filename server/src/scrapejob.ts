import axios from "axios";
import cheerio from "cheerio";
import "dotenv/config";
import logger from "./logger.js";
import APIEndPoint from "./APIEndpointFunctions.js";

/**
 * Url To scrape - malaria donations page
 */
const scrapeURL =
  "https://www.againstmalaria.com/Fundraiser.aspx?FundraiserID=8960";
/**
 * Selector to wait for the table to load
 */
const tableSelector = "#MainContent_UcFundraiserSponsors1_grdDonors";
/**
 * One of two selectors for a table entry
 */
const rowSelectorOne = "tr.TableItemStyle.TableItemText";
/**
 * Second of two selectors for a table entry
 */
const rowSelectorTwo = "tr.TableAlternatingItemStyle.TableItemText";
/**
 * Selector for total amount of donations
 */
const totalSelector =
  "#MainContent_UcFundraiserSponsors1_ucPager2_pnlTextCounter";

/**
 * Runs a scrape job then calls Sheets API(APIEndpointFunctions) with scraped data
 */
export async function fetchScrapeJob() {
  logger.info(`Starting load from: ${scrapeURL}`);
  await axios
    .get(scrapeURL)
    .then(async (response) => {
      logger.info(`Loaded`);
      const html = response.data;
      const $ = cheerio.load(html);

      const tableExists = $(tableSelector).length > 0; //waiting for table to load
      logger.info(`Table exists: ${tableExists}`);

      /**
       * Total amount of donations
       */
      const scrapedTotalDonos = +$(totalSelector)
        .text()
        .trim()
        .split(" ")
        .filter((str) => str !== "")[5];

      //two arrays due to the two table selectors
      let dataOne: any[] = [];
      let dataTwo: any[] = [];

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

      const zipped: any = dataOne.map((value, index) => [
        value,
        dataTwo[index],
      ]);
      const scrapedEntries = [].concat(...zipped).map((entry: string[]) => {
        /**
         * helper function,current scrape mistakenly combines two number values, this separates them
         * @param nstr i.e "113"
         * @returns i.e {one:"1",two:"13"}
         */
        const split = (nstr: string) => {
          let l = nstr.length / 2;
          return {
            one: nstr.substring(0, l),
            two: nstr.substring(l, nstr.length),
          };
        };
        /**
         * TBA is when donations page has not provided distribution of nets yet
         */
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

      await APIEndPoint.updateLatest(scrapedEntries, scrapedTotalDonos, false);
    })
    .catch((error) => {
      logger.error(error);
    });
}
