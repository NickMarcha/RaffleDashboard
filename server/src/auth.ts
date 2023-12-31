import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import logger from "./logger";
import "dotenv/config";

const JWT_SECRET: string = process.env.JWT_SECRET as string;

/**
 * Middleware authentication check
 * @param request
 * @param response
 * @param next
 */
export async function auth(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    if (!JWT_SECRET) {
      logger.info("JWT_SECRET not set");
      throw new Error("JWT_SECRET not set");
    }
    //   get the token from the authorization header
    if (!request.headers.authorization) {
      logger.info("No token provided");
      throw new Error("No token provided");
    }

    const token = await request.headers.authorization?.split(" ")[1];

    //check if the token matches the supposed origin
    const decodedToken = await jwt.verify(token, JWT_SECRET);

    // retrieve the user details of the logged in user
    const tokenObject = await decodedToken;
    if (typeof tokenObject === "string") {
      logger.info("Invalid token");
      throw new Error("Invalid token");
    }

    // pass the user down to the endpoints here
    //console.log("tokenObject ", tokenObject);
    request.alias = tokenObject.alias;

    // pass down functionality to the endpoint
    next();
  } catch (error) {
    if (error instanceof Error) {
      response.status(401).json({
        error: error.message,
      });
    } else {
      response.status(401).json({
        error: "Something went wrong!",
      });
    }
  }
}
export default auth;
