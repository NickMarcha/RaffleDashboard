import winston from "winston";

const rootLogLocation = "./logs/" + process.env.NODE_ENV + "/";

/**
 * Winston logger, info and error logs are stored in the logs folder
 */
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamps to logs
    winston.format.json()
  ),

  transports: [
    new winston.transports.File({
      filename: rootLogLocation + "error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: rootLogLocation + "combined.log" }),
  ],
});

// Log to console regardless of environment
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(), // Add colors for console output
      winston.format.timestamp(), // Add timestamps to console logs
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
  })
);

export default logger;
