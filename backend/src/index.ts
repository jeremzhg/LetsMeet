import "dotenv/config";
import express from "express"
import { connectDB, disconnectDB } from "./configs/db"
import { AuthRouter } from "./routes/auth_route"
import { EventManagementRouter } from "./routes/event_management_route"
import { PartnerRouter } from "./routes/partner_route"
import { MatchingRouter } from "./routes/matching_route"
import cookieParser from "cookie-parser"
connectDB()

const app = express()
app.use(express.json())
app.use(cookieParser())
const port = 3000;

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.use("/auth", AuthRouter)
app.use("/", EventManagementRouter)
app.use("/partners", PartnerRouter)
app.use("/matches", MatchingRouter)

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});