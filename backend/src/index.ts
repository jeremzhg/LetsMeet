import express from "express"
import {connectDB, disconnectDB} from "./configs/db"

connectDB()

const app = express()
const port = 3000;

app.get("/", (req, res) => {
    res.send("hello world");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});