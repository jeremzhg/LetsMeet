import "dotenv/config";
import express from "express"
import { connectDB, disconnectDB } from "./configs/db"
import { AuthRouter } from "./routes/auth_route"
import { EventManagementRouter } from "./routes/event_management_route"
import { PartnerRouter } from "./routes/partner_route"
import { MatchingRouter } from "./routes/matching_route"
import cookieParser from "cookie-parser"
import swaggerUi from "swagger-ui-express"
import swaggerDocument from "./swagger.json"
import cors from "cors"
import path from "path"
import { ProfileRouter } from "./routes/profile_route"

connectDB()

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")))
const port = 3000;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
app.use("/", ProfileRouter)

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});