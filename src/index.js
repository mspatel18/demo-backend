import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
}); // it is used because of types:modules is used in package.json
app.on("error", (error) => {
  console.log("Server error:", error);
  throw error;
}); // it is used to handle the error in the server
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb connection error:", error);
  }); // it is used to connect the database and then start the server
