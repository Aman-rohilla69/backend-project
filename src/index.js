// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
import express from "express";
 const app = express()
//  (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("ERROR : ", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log("app is listening on port", process.env.PORT);
//     });
//   } catch (error) {
//     console.log("error", error);
//     throw err;
//   }
// })();

//  import express from "express";
// require('dotenv').config({path: './env'})

import "dotenv/config.js"
// dotenv.config();
import connectDB from "./db/index.js";
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT,process.env.PORT || 5000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
