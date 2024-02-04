import express from "express";
import schedule from "node-schedule";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { auth } from "./auth";
import rateLimit from "express-rate-limit";
import cors, { CorsOptions } from "cors";
import logger from "./logger";
import APIEndPoint from "./APIEndpointFunctions";
import { DonationsScraper, scrapeSinglePage } from "./ScrapeAgainstMalaria";
import { Response } from "express";
import http from "http";
import { Server } from "socket.io";
const app = express();

const normalizePort = (val: string) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const instantiateServer = async () => {
  await APIEndPoint.instantiate();
  logger.info("APIEndPoint Instantiated");
  const totalResult = await APIEndPoint.fetchTotal();
  logger.info("Total Donations: " + totalResult.donationCount);

  DonationsScraper.lastTotalDonations = totalResult.donationCount;
};
instantiateServer();

const port = normalizePort(process.env.PORT || "3001");
app.set("port", port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Curb Cores Error by adding a header here
app.use((req, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
const corsOptions: CorsOptions = {
  origin: [
    "http://localhost/",
    process.env.HOST_URL as string,
    process.env.DOMAIN_NAME as string,
  ],
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 3 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Repeatable scrape job, checks if APIEndpoint is instantiated first
 * @returns
 */
const scrapeJob = async () => {
  try {
    console.log("scrapeJob");
    if (APIEndPoint.getInstantiated() === false) return;
    console.log("scrapeJob2");
    logger.info("Current time: " + new Date());
    logger.info("Running Scrape Job");

    const data = await scrapeSinglePage();
    console.log("scrapeJob3");

    if (typeof data === "undefined") {
      console.log("No data");
      return;
    }
    const start = data.totalDonations - data.endSponsorCount;
    const end = data.totalDonations - data.startSponsorCount;

    await APIEndPoint.updateLatest(data.donations, start, end, 3, false);
    await APIEndPoint.saveUpdated();
    await APIEndPoint.loadAllSheets();

    while (DonationsScraper.lastTotalDonations < data.totalDonations) {
      const index = Math.max(
        data.totalDonations - DonationsScraper.lastTotalDonations,
        0
      ); // this will ignore donations before the latest 20

      const donation = data.donations[data.donations.length - index];
      io.emit("donations", donation);

      DonationsScraper.lastTotalDonations++;
    }
  } catch (error) {
    console.log("scrapeJob error");
    console.log(error);
    logger.error(error);
  }
};

const scrapeNPages = async (n: number) => {
  try {
    if (APIEndPoint.getInstantiated() === false) return;
    logger.info("Current time: " + new Date());
    logger.info("Running Scrape Job");

    let ds: DonationsScraper = await DonationsScraper.createScraper(n);
    const totalDonations = ds.totalDonations;
    do {
      let donationBatch = await ds.donationBatch();
      logger.info("Fetched Data")
      if (typeof donationBatch === "undefined") {
        logger.info("No data");
        return;
      }
      try {
        logger.info("Updating Latest Data")
        await APIEndPoint.updateLatest(
          donationBatch.donations,
          totalDonations - donationBatch.endSponsorCount,
          totalDonations - donationBatch.startSponsorCount,
          3,
          false
        );
      } catch (e) {
        logger.error("GoogleAPI Error");
        logger.error(e);
      }
    } while (await ds.goToNextPage());
    ds.close();
  } catch (error) {
    logger.error(error);
  }
  logger.info("Multi Scrape Job Complete");
};

/**
 * Schedule the scrape job to run every 15 minutes
 */
const job = schedule.scheduleJob("*/15 * * * *", scrapeJob);
app.get("/api/ping", (req, response) => {
  response.send("pong");
  logger.info("Ping");

  io.emit("ping", "pong");
});

app.post("/api/login", limiter, async (request, response) => {
  try {
    let requestAccessCode = request.body.accessCode;
    let accessCodes = await APIEndPoint.fetchAccessCodes();

    logger.info({ requestAccessCode });
    let result = accessCodes.find(
      (entry) =>
        "" + entry.accessCode === requestAccessCode &&
        entry.isActive &&
        entry.accessCode != null
    );
    if (result !== undefined) {
      //   create JWT token
      const token = jwt.sign(
        {
          accessCode: requestAccessCode,
          alias: result.alias,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "24h" }
      );

      //   return success response
      response.status(200).send({
        message: "Login Successful",
        accessCode: requestAccessCode,
        token,
      });
    } else {
      // Delay the response for failed login attempts
      setTimeout(() => {
        response.status(404).send({
          message: "accessCode not found",
        });
      }, 2000); // Delay of 2000 milliseconds (2 seconds)
    }
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

// free endpoint
app.get("/api/free-endpoint", (request, response) => {
  try {
    response.json({ message: "You are free to access me anytime" });
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

// authentication endpoint
app.get("/api/auth-endpoint", auth, (request, response) => {
  try {
    response.json({ message: "You are authorized to access me" });
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.get("/api/total", async (req, response) => {
  try {
    const result = await APIEndPoint.fetchTotal();

    logger.info("Total");
    //logger.info("total " + JSON.stringify(result));
    response.json(result);
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.get("/api/top", async (req, response) => {
  try {
    response.json(await APIEndPoint.fetchTop());
    logger.info("Top");
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.get("/api/YeeAndPepe", async (req, response) => {
  try {
    response.json(await APIEndPoint.fetchYeeAndPepe());
    logger.info("Yee and Pepe");
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.get("/api/yeeAndPepeList", async (req, response) => {
  function replacer(key: any, value: any) {
    if (value instanceof Map) {
      return {
        dataType: "Map",
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else {
      return value;
    }
  }
  try {
    const stringified = JSON.stringify(
      await APIEndPoint.fetchYeeAndPepeList(),
      replacer
    );

    response.send(stringified);
    logger.info("yee And Pepe List");
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.get("/api/latest", async (req, response) => {
  try {
    response.json(await APIEndPoint.fetchLatest());
    logger.info("Latest");
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.get("/api/todaysTop", async (req, response) => {
  try {
    response.json(await APIEndPoint.fetchTodaysTop());
    logger.info("Todays Top");
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.get("/api/todaysTotal", async (req, response) => {
  try {
    response.json(await APIEndPoint.fetchTodaysTotal());
    logger.info("Todays Total");
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.get("/api/entry/:NR", auth, async (req, response) => {
  try {
    response.json(
      await APIEndPoint.fetchEntryByID(parseInt(req.params.NR), true)
    );
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.get("/api/rollRaffle", auth, async (req, response) => {
  try {
    logger.info(`Rolling Raffle |` + new Date().toLocaleString());
    let validRaffleEntries = await APIEndPoint.fetchValidRaffleEntries(false);
    logger.info(
      `Valid Entries: ${validRaffleEntries.length} ` +
        new Date().toLocaleString()
    );

    const max = validRaffleEntries[validRaffleEntries.length - 1].rollingSum;
    console.log(max);
    const random = Math.floor(Math.random() * max);
    console.log(random);
    let winner: number | undefined = undefined;

    for (let i = 0; i < validRaffleEntries.length; i++) {
      if (random < validRaffleEntries[i].rollingSum) {
        winner = i;
        break;
      }
    }
    logger.info(
      `Determined winner: ${JSON.stringify(winner)} ` +
        new Date().toLocaleString()
    );

    if (winner === undefined) {
      throw new Error("Winner went to shit");
    }

    let winnerNR: number = validRaffleEntries[winner].nr;

    logger.info(`Fetching winner ${winnerNR} |${new Date().toLocaleString()}`);
    let winnerData = await APIEndPoint.fetchEntryByID(winnerNR, true);

    await APIEndPoint.setEntryTimeStamp(winnerNR, req.alias, true);
    logger.info("Fetched winner |" + new Date().toLocaleString());
    await APIEndPoint.saveUpdated();
    response.json(winnerData);

    io.emit("raffle", winnerData);
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

/// Rolls raffle without Writing to db
app.get("/api/rollRaffleNW", auth, async (req, response) => {
  try {
    let validRaffleEntries = await APIEndPoint.fetchValidRaffleEntries(true);
    const min = validRaffleEntries[0].rollingSum;
    logger.info(`Min: ${min}`);
    const max = validRaffleEntries[validRaffleEntries.length - 1].rollingSum;

    logger.info(`Max: ${max}`);
    const random = Math.floor(Math.random() * max);

    let winner: number | undefined = undefined;

    logger.info(`Random: ${random}`);
    for (let i = 0; i < validRaffleEntries.length; i++) {
      if (random < validRaffleEntries[i].rollingSum) {
        winner = i;
        break;
      }
    }

    if (winner === undefined) {
      throw new Error("Winner went to shit");
    }

    let winnerNR = validRaffleEntries[winner].nr;

    let winnerData = await APIEndPoint.fetchEntryByID(winnerNR, true);

    response.json(winnerData);
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

/**
 * Set entry to be played, can be done lazy
 */
app.post("/api/setEntryToPlayed", auth, async (request, response) => {
  try {
    const entryID = request.body.entryID;
    const lazy = request.body.lazy;

    await APIEndPoint.setEntryToPlayed(entryID, request.alias, true);
    response.status(200).send({
      message: "Updated Entry",
    });
    if (!lazy) {
      logger.info("Set entry to played force");
      APIEndPoint.saveUpdated();
    }
  } catch (error) {
    logger.error(error);
    response.status(404).send({
      message: "Something went wrong",
    });
  }
});

/**
 * To be used after lazy writing.
 */
app.get("/api/saveUpdated", auth, async (request, response) => {
  try {
    APIEndPoint.saveUpdated();
    response.status(200).send({
      message: "Updated Entry",
    });
  } catch (error) {
    logger.error(error);
    response.status(404).send({
      message: "Something went wrong",
    });
  }
});

const scrapeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.get("/api/runScrape", auth, scrapeLimiter, async (req, response) => {
  logger.info(`Scrape requested by ${req.alias}`);
  try {
    await scrapeJob();

    response.status(200).send({
      message: "Scrape job finished",
    });
  } catch (error) {
    logger.error(error);
    response.status(404).send({
      message: "Something went wrong",
    });
  }
});

app.get(
  "/api/runScrape/pages/:pages",
  auth,
  scrapeLimiter,
  async (req, response) => {
    logger.info(`Multi Scrape requested by ${req.alias}`);
    try {
      const nrPages: number = parseInt(req.params.pages);
      await scrapeNPages(nrPages);

      response.status(200).send({
        message: "Multi Scrape job finished",
      });
    } catch (error) {
      logger.error(error);
      response.status(404).send({
        message: "Something went wrong",
      });
    }
  }
);

app.get("/api/latestFifty", async (req, response) => {
  try {
    response.json(await APIEndPoint.fetchLatest50());
    logger.info("latestFifty");
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.post("/api/getAllRaffleEntries", auth, async (req, response) => {
  try {
    response.json(await APIEndPoint.getAllRaffleEntries(req.body));
    logger.info("getAllRaffleEntries");
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.get("/api/raffledEntries", async (req, response) => {
  try {
    logger.info("raffledEntries");
    response.json(await APIEndPoint.fetchRaffledEntries(true));
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

app.post("/api/rollRaffles", auth, async (req, response) => {
  try {
    const amount = req.body.amount;
    logger.info(`Rolling ${amount} raffles ` + new Date().toLocaleString());
    let validRaffleEntries = await APIEndPoint.fetchValidRaffleEntries(false);
    logger.info(
      `Valid Entries: ${validRaffleEntries.length} ` +
        new Date().toLocaleString()
    );

    const max = validRaffleEntries[validRaffleEntries.length - 1].rollingSum;
    let winners: number[] = [];

    while (winners.length < amount) {
      const random = Math.floor(Math.random() * max);
      for (let i = 0; i < validRaffleEntries.length; i++) {
        if (random < validRaffleEntries[i].rollingSum) {
          if (!winners.includes(i)) winners.push(i);
          break;
        }
      }
    }
    logger.info(
      `Determined winners: ${JSON.stringify(winners)} ` +
        new Date().toLocaleString()
    );

    let winnerIDs = winners.map((winner) => validRaffleEntries[winner].nr);

    logger.info("Fetching winners " + new Date().toLocaleString());
    let fetches = winnerIDs.map((winnerID) =>
      APIEndPoint.fetchEntryByID(winnerID, true)
    );

    Promise.all(fetches).then((values) => {
      response.json(values);
      logger.info("Fetched winners " + new Date().toLocaleString());
    });
  } catch (error) {
    handleErrorResponse(response, error);
  }
});

/**
 * Send broadcast message to all socket clients, clients expect {message: string}
 */
app.post("/api/broadcast", auth, async (req, response) => {
  try {
    logger.info("Broadcast requested by " + req.alias);
    io.emit("broadcast", req.body);
    response.status(200).send({
      message: "Broadcast message sent",
    });
  } catch (error) {
    logger.error(error);
  }
});

//404
app.use((req, response, next) => {
  response.status(404).send({ message: "404: endpoint not found" });
});

const server = http.createServer(app);
const io = new Server(server, { path: "/socket.io" });
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  console.log("a user connected");
});
server.listen(port, () => {
  logger.info(`Now listening on port ${port}`);
});

function handleErrorResponse(response: Response | null = null, error: any) {
  logger.error(error);
  if (response === null) {
    return;
  }
  try {
    if (error instanceof Error) {
      response.json({ error: error.message });
    } else {
      response.json({ error: "Error" });
    }
  } catch (error) {
    console.log("Response already sent");
  }
}
