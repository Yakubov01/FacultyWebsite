import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import * as jwt from "jsonwebtoken";

import { User } from "../../entity/User";

export default (role: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //Get the user ID from previous midleware
    // const id = res.locals.jwtPayload.userId;

    const token: string | null =
      "token" in req.headers ? (req.headers.token as string) : null;
    let jwtPayload;
    const secret: string = process.env.JWT_SECRET || "";

    jwtPayload = <any>jwt.verify(token, secret);
    res.locals.jwtPayload = jwtPayload;
    const id = res.locals.jwtPayload.data.id;

    //Get user role from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    //Check if array of authorized roles includes the user's role
    if (role.indexOf(user.role) > -1) {
      return next();
    } else {
      res.status(401).json({
        status: "Error",
        message: "Unauthorized Error",
      });
    }
  };
};
