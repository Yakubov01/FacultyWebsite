import "reflect-metadata";
import { createConnection } from "typeorm";

createConnection()
  .then((connection) => {
    // here you can start to work with your entities
    //console.log( "Created Connection", connection );
    console.log("DB Connected");
  })
  .catch((error) => {
    console.log("Something went wrong! Your connection felled");
    console.log(error);
  });
