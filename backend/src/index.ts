import express from "express"
import {connect, disconnect} from "./configs/db"

connect()

const app = express()
const port = 3000;

app.get("/", (req, res) => {
    res.send("hello world");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on("SIGINT", async () => {
  await disconnect();
  process.exit(0);
});