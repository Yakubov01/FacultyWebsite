import bodyParser from "body-parser";
import express from "express";

import cors from "cors";

import { RegValidation, SignValidation } from "../app/utils";
import { UserCtrl, AuthCtrl } from "../app/controller";
import { CheckRole } from "../app/middleware";
import { CheckAuth } from "../app/middleware";

const createRoutes = (app: express.Express) => {
  const options: cors.CorsOptions = {
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "X-Access-Token",
    ],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: true,
    //origin: "*",
    optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
    preflightContinue: false,
  };

  // declare controllers
  const UserController = new UserCtrl();

  // AuthCtrl
  const Auth = new AuthCtrl();

  app.use(cors());
  //enable pre-flight
  app.options("*", cors(options));

  //Load files via URL
  app.use(CheckAuth);
  app.use(bodyParser.json());

  app.get(
    "/",
    CheckRole(["Admin"]),
    (_: express.Request, res: express.Response) => {
      res.json({ msg: "Hello World" });
    }
  );

  // User API
  app.post("/user/register", RegValidation, UserController.create);
  app.post("/user/login", SignValidation, Auth.login);
  app.post("/user/change/password/", SignValidation, Auth.changePassword);
  app.post("/user/logout", SignValidation, Auth.logout);
};

export default createRoutes;
