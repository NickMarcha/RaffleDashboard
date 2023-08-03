// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    /**
     * Allows variables to be passed along the the request with Express.NextFunction
     */
    export interface Request {
      alias?: any;
    }
  }
}
