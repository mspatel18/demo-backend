import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
); // it is used to allow the request from the frontend
app.use(express.json({ limit: "32kb" })); // it is used to parse the request body
app.use(express.urlencoded({ extended: true, limit: "32kb" })); // it is used to handle url encoded data
app.use(express.static("public")); // it is used to serve the static files into the public folder
app.use(cookieParser()); // it is used to handle the cookie

export { app };
