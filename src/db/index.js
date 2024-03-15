import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\nMongoDB connected !! DB Host:${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error connecting to the database", error);
    process.exit(1);
  }
}; //explaination: The connectDB function is an async function that connects to the MongoDB database using the mongoose.connect method. It takes the MongoDB URI and the database name as the parameters. It uses the process.env.MONGODB_URI environment variable to get the MongoDB URI. It uses the DB_NAME constant to get the database name. It uses the await keyword to wait for the connection to be established. If the connection is successful, it logs a message to the console. If the connection fails, it logs an error message to the console and exits the process using the process.exit method. The function is exported from the file.
export default connectDB;
