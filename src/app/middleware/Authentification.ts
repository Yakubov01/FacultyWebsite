import express from "express";
import * as jwt from "jsonwebtoken";

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  if (
    req.path === "/user/register" ||
    req.path === "/user/login" ||
    req.path === "/user/verify"
  ) {
    return next();
  }

  const token: string | null =
    "token" in req.headers ? (req.headers.token as string) : null;
  let jwtPayload;
  const secret: string = process.env.JWT_SECRET || "";

  if (token) {
    //Try to validate the token and get data
    try {
      jwtPayload = <any>jwt.verify(token, secret);
      res.locals.jwtPayload = jwtPayload;
      res.locals.user = res.locals.jwtPayload.data;
    } catch (error) {
      //If token is not valid, respond with 401 (unauthorized)
      res.status(401).json({
        message: "Invalid auth token provided or user unauthorized!",
        error,
      });
      return;
    }

    //The token is valid for 1 hour
    //We want to send a new token on every request
    const { userId, email } = jwtPayload;
    const newToken = jwt.sign({ userId, email }, secret, {
      // expiresIn: process.env.JWT_MAX_AGE,
      expiresIn: "60d",
      algorithm: "HS256",
    });
    res.setHeader("token", newToken);
    //Call the next middleware or controller
    next();
  } else {
    res.json({
      message: "Something went wrong! Please try again later...",
    });
  }
};
