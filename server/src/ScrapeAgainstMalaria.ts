import { CheerioAPI, load, Element, Cheerio } from "cheerio";
import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import { Donation } from "./types/Donation";

/////////// CONSTANTS ///////////

const fundRaiserID = process.env.FUNDRAISER_ID;
const scrapeURL =
  "https://www.againstmalaria.com/Fundraiser.aspx?FundraiserID=" + fundRaiserID;
const tableSelector = "#MainContent_UcFundraiserSponsors1_grdDonors";
const rowSelectorOne = "tr.TableItemStyle.TableItemText";
const rowSelectorTwo = "tr.TableAlternatingItemStyle.TableItemText";
const totalSelector =
  "#MainContent_UcFundraiserSponsors1_ucPager2_pnlTextCounter";
const nextPageSelector = "MainContent_UcFundraiserSponsors1_ucPager1_lnkNext";

/**
 * Scrapes donations from first page of scrapeURL
 * @returns
 */
export async function scrapeSinglePage(): Promise<{
  donations: Donation[];
  pageCount: number;
  startSponsorCount: number;
  endSponsorCount: number;
  totalDonations: number;
}> {
  let ds: DonationsScraper = await DonationsScraper.createScraper(1);
  let donationBatch = await ds.donationBatch();
  ds.close();

  return {
    totalDonations: ds.totalDonations,
    ...donationBatch,
  };
}
export class DonationsScraper {
  browser: Browser;
  page: Page;
  promises: Promise<any>[] = [];
  totalDonations: number;
  scrapedDonations: number = 0;
  pageCount: number = 0;
  rootCheerio: CheerioAPI;
  pagesToScrape: number;
  //lastPageSponsorCount:number = 0;

  /**
   * Should not be used directly, use createScraper instead
   * @param browser
   * @param page
   * @param totalDonations
   */
  private constructor(
    browser: Browser,
    page: Page,
    rootCheerio: CheerioAPI,
    totalDonations: number,
    pagesToScrape: number = -1
  ) {
    this.browser = browser;
    this.page = page;
    this.rootCheerio = rootCheerio;
    this.totalDonations = totalDonations;
    this.pagesToScrape = pagesToScrape;
  }

  /**
   * Creates a new scraper, loads the first page of the scrapeURL
   * @returns
   */
  static async createScraper(
    pagesToScrape?: number
  ): Promise<DonationsScraper> {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(scrapeURL);
    const htmlString = await page.content();
    const newRootCheerio = load(htmlString);
    const pageInfo = getPageInfo(newRootCheerio);

    const nds = new DonationsScraper(
      browser,
      page,
      newRootCheerio,
      pageInfo.totalDonations,
      pagesToScrape
    );
    return nds;
  }

  async close() {
    await this.browser.close();
  }

  async donationBatch(): Promise<{
    donations: Donation[];
    pageCount: number;
    startSponsorCount: number;
    endSponsorCount: number;
  }> {
    await Promise.all(this.promises);
    this.promises = [];
    const htmlString = await this.page.content();
    this.rootCheerio = load(htmlString);

    const currentPageInfo = getPageInfo(this.rootCheerio);
    const tableExists = this.rootCheerio(tableSelector).length > 0;
    console.log(`Table exists: ${tableExists}`);

    if (currentPageInfo.currentSponsorCountEnd >= this.scrapedDonations) {
      //not scraped current page
      const newDonations = scrapePage(this.rootCheerio);
      this.scrapedDonations += newDonations.length;
      this.pageCount++;
      return {
        donations: newDonations,
        pageCount: this.pageCount,
        startSponsorCount: currentPageInfo.currentSponsorCountStart,
        endSponsorCount: currentPageInfo.currentSponsorCountEnd,
      };
    } else {
      //Already scraped current page
      console.log("Already scraped current page");
      return {
        donations: [],
        pageCount: this.pageCount,
        startSponsorCount: currentPageInfo.currentSponsorCountStart,
        endSponsorCount: currentPageInfo.currentSponsorCountEnd,
      };
    }
  }

  /**
   * Starts to go to next page, returns true if next page exists,
   * false if no next page
   * @param rootCheerio
   * @returns
   */
  async goToNextPage(): Promise<boolean> {
    if (
      this.scrapedDonations >= this.totalDonations || //check if last page
      this.pagesToScrape === this.pageCount //check if reached page limit
    ) {
      return false;
    }

    const nextPageButton = this.rootCheerio("#" + nextPageSelector);
    //console.log(`Next page button exists: ${nextPageButton.length}`);
    if (nextPageButton.length === 0) {
      console.log("No next page button");
      return false;
    }

    let nextButtonElement = await this.page.waitForSelector(
      `[id="${nextPageSelector}"`
    );
    if (nextButtonElement === null) {
      console.log("No next page button puppeteer");
      return false;
    }
    const anchor: ElementHandle<HTMLAnchorElement> =
      await nextButtonElement.toElement("a");
    //console.log("anchor here");

    this.promises = [sleep(20000), anchor.evaluate((node) => node.click())];
    return true;
  }
}

/////////// HELPERS ///////////

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Finds stats from current page
 * @param page Root Page Cheerio instance
 * @returns
 */
function getPageInfo(page: CheerioAPI) {
  const totalArray = page(totalSelector)
    .text()
    .trim()
    .split(" ")
    .filter((str) => str !== "");

  const currentSponsorCountStart: number = parseInt(totalArray[1]);
  const currentSponsorCountEnd: number = parseInt(totalArray[3]);
  const totalDonations: number = parseInt(totalArray[5]);

  return { currentSponsorCountStart, currentSponsorCountEnd, totalDonations };
}

/**
 * Scrapes a page for donations
 * @param page Root Page Cheerio instance
 * @returns donation array
 */
function scrapePage(page: CheerioAPI): Donation[] {
  const vOneRows = page(`${tableSelector} ${rowSelectorOne}`);
  const vTwoRows = page(`${tableSelector} ${rowSelectorTwo}`);
  let allRows: Element[] = [];

  vOneRows.each((index, element) => {
    allRows.push(element);
    allRows.push(vTwoRows[index]);
  });

  return allRows
    .map((row) => {
      return scrapeDonation(page, row);
    })
    .filter((donation) => donation !== null) as Donation[];
}

/**
 * Scrapes a donation from a row
 * @param root Root Page Cheerio instance
 * @param element donation row
 * @returns Donation object
 */
function scrapeDonation(root: CheerioAPI, element: Element): Donation | null {
  const rowData: cellEntry[] = [];
  // Iterate over each cell of the row using the find and each methods
  root(element)
    .find("td, th")
    .each((j, cell) => {
      // Add the cell data to the row data object
      rowData.push({ data: root(cell), index: j });
    });

  let shift = 0;

  switch (rowData.length) {
    case 13:
      console.log("reoccurring donation in table");
      shift = 1; // if there is reoccurring donation in the table, the table will have an extra column, shift everything after that column by 1
      break;
    case 12:
      shift = 0; //normal table
      break;
    case 0:
      return null; //empty Row
    default:
      throw new Error(
        `Error in table, unexpected number of columns${
          rowData.length
        } found in row ${rowData.toString()}`
      );
  }

  const sortedData = rowData
    .sort((a, b) => a.index - b.index)
    .map((a) => a.data);

  //check if empty
  if (
    sortedData === null ||
    sortedData === undefined ||
    sortedData.length === 0 ||
    sortedData[0] === null ||
    sortedData[0] === undefined ||
    sortedData[0].children() === null ||
    sortedData[0].children() === undefined ||
    sortedData[0].children().first() === null ||
    sortedData[0].children().first() === undefined ||
    sortedData[0].children().first().attr("class") === null ||
    sortedData[0].children().first().attr("class") === undefined ||
    sortedData[0].children().first().attr("class") === ""
  ) {
    //console.log("Empty Row");
    return null;
  }

  const flagCodeStr = sortedData[0]
    .children()
    .first()
    .attr("class")
    ?.split("-")[1];

  const flagCode = flagCodeStr ? flagCodeStr : "none";
  const sponsor = sortedData[1].text().trim();
  const date = sortedData[2].text().trim();
  const location = sortedData[3].text().trim();

  function parseDollars(str: string) {
    if (str === "") return 0;
    try {
      const match = str.substring(3, str.length).replace(",", "");
      const parsed = parseFloat(match);
      if (isNaN(parsed)) {
        throw new Error("NaN");
      }
      return parsed;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }
  const amount = sortedData[4 + shift].children().first().text().trim();
  const USDollarAmount = parseDollars(sortedData[5 + shift].text().trim());
  const giftAid = parseDollars(sortedData[6 + shift].text().trim());
  const message = sortedData[7 + shift].text().trim();

  let distributionFlag = "none";

  try {
    const data = sortedData[8 + shift]
      .children()
      .first()
      .children()
      .last()
      .attr("class")
      ?.split("-")[1];
    distributionFlag = data ? data : distributionFlag;
  } catch (e) {
    console.log("Distribution flag error");
    console.log(e);
  }

  let distributionStatus = "none";

  try {
    const title = sortedData[9 + shift].children().first()?.attr("title");
    if (title === undefined) {
    } else {
      distributionStatus = title;
    }
  } catch (e) {
    console.log("Distribution status error");
    console.log(e);
  }

  const numberOfNetsFunded = parseInt(sortedData[10 + shift].text());
  const numberOfPeopleSaved = parseInt(sortedData[11 + shift].text());
  const newDonation = new Donation(
    flagCode,
    sponsor,
    date,
    location,
    amount,
    USDollarAmount,
    giftAid,
    message,
    distributionFlag,
    distributionStatus,
    numberOfNetsFunded,
    numberOfPeopleSaved
  );

  return newDonation;
}

/**
 * Cell entry interface
 */
interface cellEntry {
  data: Cheerio<Element>;
  index: number;
}
