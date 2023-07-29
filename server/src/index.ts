import express from "express";
import schedule from "node-schedule";
import { fetchScrapeJob } from "./scrapejob";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { auth } from "./auth";
import rateLimit from "express-rate-limit";
import cors, { CorsOptions } from "cors";
import logger from "./logger";
import APIEndPoint from "./APIEndpointFunctions";

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
APIEndPoint.instantiate();

const port = normalizePort(process.env.PORT || "3001");
app.set("port", port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
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

const scrapeJob = () => {
  try {
    if (APIEndPoint.instantiated === false) return;
    logger.info("Current time: " + new Date());
    logger.info("Running Scrape Job");
    fetchScrapeJob();
  } catch (error) {
    logger.error(error);
  }
};
const job = schedule.scheduleJob("*/15 * * * *", scrapeJob);

app.post("/api/login", limiter, async (request, response) => {
  try {
    let reqaccessCode = request.body.accessCode;
    let accesscodes = await APIEndPoint.fetchAccessCodes();
    //logger.info(accesscodes);

    logger.info({ reqaccessCode });
    let result = accesscodes.find(
      (entry) =>
        "" + entry.accessCode === reqaccessCode &&
        entry.isActive &&
        entry.accessCode != null
    );
    if (result !== undefined) {
      //   create JWT token
      const token = jwt.sign(
        {
          accessCode: reqaccessCode,
          alias: result.alias,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "24h" }
      );

      //   return success response
      response.status(200).send({
        message: "Login Successful",
        accessCode: reqaccessCode,
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
    logger.error(error);
    response.json(error);
  }
});

// free endpoint
app.get("/api/free-endpoint", (request, response) => {
  try {
    response.json({ message: "You are free to access me anytime" });
  } catch (error) {
    logger.info(error);
    response.json(error);
  }
});

// authentication endpoint
app.get("/api/auth-endpoint", auth, (request, response) => {
  try {
    response.json({ message: "You are authorized to access me" });
  } catch (error) {
    logger.error(error);
    response.json(error);
  }
});

app.get("/api/total", async (req, res) => {
  try {
    res.json(await APIEndPoint.fetchTotal());
    logger.info("Total");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/top", async (req, res) => {
  try {
    res.json(await APIEndPoint.fetchTop());
    logger.info("Top");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/yeeandpepe", async (req, res) => {
  try {
    res.json(await APIEndPoint.fetchYeeAndPepe());
    logger.info("Yee and Pepe");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/latest", async (req, res) => {
  try {
    res.json(await APIEndPoint.fetchLatest());
    logger.info("Latest");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/todaysTop", async (req, res) => {
  try {
    res.json(await APIEndPoint.fetchTodaysTop());
    logger.info("Todays Top");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/todaysTotal", async (req, res) => {
  try {
    res.json(await APIEndPoint.fetchTodaysTotal());
    logger.info("Todays Total");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/rollRaffle", auth, async (req, res) => {
  try {
    let validRaffleEntries = await APIEndPoint.fetchValidRaffleEntries();
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

    let winnerID: number = validRaffleEntries[winner].index;

    let winnerData = await APIEndPoint.fetchEntryByID(winnerID, true);

    res.json(winnerData);

    APIEndPoint.setEntryTimeStamp(winnerID, req.alias);
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

/// Rolls raffle without Writing to db
app.get("/api/rollRaffleNW", auth, async (req, res) => {
  try {
    let validRaffleEntries = await APIEndPoint.fetchValidRaffleEntries();
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

    let winnerID = validRaffleEntries[winner].index;

    let winnerData = await APIEndPoint.fetchEntryByID(winnerID, true);

    res.json(winnerData);
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.post("/api/setEntryToPlayed", auth, async (request, response) => {
  try {
    const entryID = request.body.entryID;
    await APIEndPoint.setEntryToPlayed(entryID, request.alias);
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

const scrapelimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.get("/api/runScrape", auth, scrapelimiter, async (req, res) => {
  logger.info(`Scrape requested by ${req.alias}`);
  try {
    await fetchScrapeJob();

    res.status(200).send({
      message: "Scrape job finished",
    });
  } catch (error) {
    logger.error(error);
    res.status(404).send({
      message: "Something went wrong",
    });
  }
});

app.get("/api/latestfifty", async (req, res) => {
  try {
    res.json(await APIEndPoint.fetchLatest50());
    logger.info("latestfifty");
  } catch (error) {
    logger.info(error);
    res.json(error);
  }
});

app.post("/api/getAllRaffleEntries", auth, async (req, res) => {
  try {
    res.json(await APIEndPoint.getAllRaffleEntries(req.body));
    logger.info("getAllRaffleEntries");
  } catch (error) {
    logger.info(error);
    res.json(error);
  }
});

app.get("/api/sortedByRaffleTime", async (req, res) => {
  try {
    res.json(await APIEndPoint.fetchEntriesSortedByRaffleTime(true));
    logger.info("sortedByRaffleTime");
  } catch (error) {
    logger.info(error);
    res.json(error);
  }
});

app.post("/api/rollRaffles", auth, async (req, res) => {
  try {
    const amount = req.body.amount;
    let validRaffleEntries = await APIEndPoint.fetchValidRaffleEntries();
    const min = validRaffleEntries[0].rollingSum;
    logger.info(`Min: ${min}`);
    const max = validRaffleEntries[validRaffleEntries.length - 1].rollingSum;

    logger.info(`Max: ${max}`);

    let winners: number[] = [];
    while (winners.length < amount) {
      const random = Math.floor(Math.random() * max);
      logger.info(`Random: ${random}`);
      for (let i = 0; i < validRaffleEntries.length; i++) {
        if (random < validRaffleEntries[i].rollingSum) {
          if (!winners.includes(i)) winners.push(i);
          break;
        }
      }
    }

    let winnerIDs = winners.map((winner) => validRaffleEntries[winner].index);

    let fetches = winnerIDs.map((winnerID) =>
      APIEndPoint.fetchEntryByID(winnerID, true)
    );

    Promise.all(fetches).then((values) => {
      res.json(values);
    });
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

//404
app.use((req, res, next) => {
  res.status(404).send({ message: "404: endpoint not found" });
});
app.listen(port, () => {
  logger.info(`Now listening on port ${port}`);
});
