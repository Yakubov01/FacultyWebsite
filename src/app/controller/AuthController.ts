import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { validationResult, Result, ValidationError } from "express-validator";
import { User } from "../../entity/User";
import { generateToken } from "./../utils";

class AuthController {
  /**
   * Login to system
   * @param req
   * @param res
   */

  login = async (req: Request, res: Response) => {
    const data: {
      email: string;
      password: string;
    } = {
      email: req.body.email,
      password: req.body.password,
    };

    const errors: Result<ValidationError> = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      const userRepository = getRepository(User);
      let user: User;
      try {
        user = await userRepository
          .createQueryBuilder("user")
          .addSelect("user.role")
          .addSelect("user.password")
          .addSelect("user.email")
          .where("user.email = :email", { email: data.email })
          .getOne();

        //Check if encrypted password match
        if (!user.checkUserPasswordCrypt(data.password)) {
          res.status(401).send({
            status: "Fail",
            message: "Password or phone incorrect!",
          });
        }

        //Sing JWT, valid for max age
        // look at on .env

        const token = generateToken(user);
        //Send the jwt in the response
        res.status(201).json({
          status: "success",
          token,
        });
      } catch (error) {
        res.status(404).json({
          status: "error",
          message: "User not found",
          error: error,
        });
      }
    }
  };

  /**
   * Change user password
   * @param req
   * @param res
   */
  changePassword = async (req: Request, res: Response) => {
    //Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    const { old_password, new_password } = req.body;
    if (!(old_password && new_password)) {
      res.status(400).json({
        status: "Error",
        message: "You entered same password like your old password",
      });
    }

    //Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(404).json({
        status: "Error",
        message: "User not found",
      });
    }

    //Check if old password match
    if (!user.checkUserPasswordCrypt(old_password)) {
      res.status(401).json({
        status: "Error",
        message: "Please enter new password Not old password",
      });
      return;
    }

    //Validate de model (password length)
    user.password = new_password;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(401).json({
        status: "Error",
        message: errors,
      });
      return;
    }
    //Hash the new password and save
    user.hashPassword();
    userRepository.save(user);
    res.status(204).json({
      status: "Success",
      message: user,
    });
  };

  /**
   * Logging out from system
   * @param req
   * @param res
   */

  logout = async (req: Request, res: Response) => {
    res.set(
      // expiresIn: process.env.JWT_MAX_AGE,
      "Set-Cookie",
      ["token=; Max-age=0"]
    );

    res.status(204).json({
      status: "success",
      message: "You've logged out",
    });
  };
}

export default AuthController;
