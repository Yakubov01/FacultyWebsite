import express from "express";
import { getConnection } from "typeorm";

import { User } from "./../../entity/User";
import { validationResult } from "express-validator";

class UserController {
  /**
   * List all stored User
   * @param req
   * @param res
   */

  /**
   *  Creating User
   * @param req
   * @param res
   */
  create = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    // We'll create a new user by taking the information coming from the body.
    const postData: {
      email: string;
      username: string;
      password: string;
    } = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({
        status: "Error",
        message: "Something went wrong!",
        errors: errors.array(),
      });
      // res.status(422).json({ errors: errors.array() });
    } else {
      const userRep = getConnection().getRepository(User);
      const user = userRep.create(postData);

      await userRep
        .save(user)
        .then((obj: User) => {
          res.status(200).json({
            status: "Success",
            message: "User registered  successfully",
            data: obj,
          });
          // res.status(200).json(obj);
        })
        .catch((reason) => {
          if ((reason.code = "ER_DUP_ENTRY")) {
            res.status(500).json({
              status: "Error",
              message:
                "the email already exists. Please use another email for registration",
              error: reason,
            });
          } else {
            res.status(500).json({
              status: "error",
              message: "Something went wrong!",
              error: reason,
            });
          }
        });
    }
  };
}
export default UserController;
