import express from "express";
import schedule from "node-schedule";
import { fetchData } from "./scrapejob.js";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import auth from "./auth.js";
import rateLimit from "express-rate-limit";
import {
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
} from "./APIEndpointFunctions.js";
import cors from "cors";
import logger from "./logger.js";

const app = express();
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const port = normalizePort(process.env.PORT || 3001);
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
const corsOptions = {
  origin: ["http://localhost/", process.env.HOST_URL, process.env.DOMAIN_NAME],
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 3 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/*
app.get("/", function (req, res) {
  res.sendFile("<file-name>", { root: __dirname });
});
*/
const job = schedule.scheduleJob("*/15 * * * *", () => {
  try {
    logger.info("Current time:", new Date());
    logger.info("Running Scrape Job");
    fetchData();
  } catch (error) {
    logger.error(error);
  }
});

app.post("/api/login", limiter, async (request, response) => {
  try {
    let reqaccessCode = request.body.accessCode;
    let accesscodes = await fetchAccessCodes();
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
        process.env.JWT_SECRET,
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
    res.json(await fetchTotal());
    logger.info("Total");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/top", async (req, res) => {
  try {
    res.json(await fetchTop());
    logger.info("Top");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/yeeandpepe", async (req, res) => {
  try {
    res.json(await fetchYeeAndPepe());
    logger.info("Yee and Pepe");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/latest", async (req, res) => {
  try {
    res.json(await fetchLatest());
    logger.info("Latest");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/todaysTop", async (req, res) => {
  try {
    res.json(await fetchTodaysTop());
    logger.info("Todays Top");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/todaysTotal", async (req, res) => {
  try {
    res.json(await fetchTodaysTotal());
    logger.info("Todays Total");
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.get("/api/rollRaffle", auth, async (req, res) => {
  try {
    let validRaffleEntries = await fetchValidRaffleEntries();
    const min = validRaffleEntries[0].rollingSum;
    logger.info(`Min: ${min}`);
    const max = validRaffleEntries[validRaffleEntries.length - 1].rollingSum;

    logger.info(`Max: ${max}`);
    const random = Math.floor(Math.random() * max);

    let winner;

    logger.info(`Random: ${random}`);
    for (let i = 0; i < validRaffleEntries.length; i++) {
      if (random < validRaffleEntries[i].rollingSum) {
        winner = i;
        break;
      }
    }

    let winnerID = validRaffleEntries[winner].index;

    let winnerData = await fetchEntryByID(winnerID);

    res.json(winnerData);

    setEntryTimeStamp(winnerID, req.alias);
  } catch (error) {
    logger.error(error);
    res.json(error);
  }
});

app.post("/api/setEntryToPlayed", auth, async (request, response) => {
  try {
    const entryID = request.body.entryID;
    await setEntryToPlayed(entryID, request.alias);
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
    await fetchData();

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
    res.json(await fetchLatest50());
    logger.info("latestfifty");
  } catch (error) {
    logger.info(error);
    res.json(error);
  }
});

app.get("/api/sortedByRaffleTime", async (req, res) => {
  try {
    res.json(await fetchEntriesSortedByRaffleTime());
    logger.info("sortedByRaffleTime");
  } catch (error) {
    logger.info(error);
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
