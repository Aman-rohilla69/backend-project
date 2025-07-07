import express from "express";
import cors from "cors"; //cors is
import cookieParser from "cookie-parser";
const app = express();
// const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Allow requests from this origin
    credentials: true, // Allow cookies to be sent with requests
  })
);
//cors use
app.use(express.json({ limit: "20kb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "20kb" })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(express.static("public")); // Serve static files from the "public" directory

// routes import :-

import userRouter from "./routes/user.routes.js";
// import router from "./routes/user.routes.js";
// routes declarations :-

app.use("/api/v1/users", userRouter);   // router ko call krne ke liye middleware ka use hota h..
//  http://localhost:8000/api/v1/users
export {app};


