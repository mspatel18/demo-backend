import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});
// console.log("MONGODB_URI", process.env.MONGODB_URI);
app.on("error", (error) => {
  console.log("Server error:", error);
  throw error;
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb connection error:", error);
  });
