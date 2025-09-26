import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import { connection } from "./Database/dbConnection.js";
import userRoutes from "./routes/userRoutes.js";
import { errorMiddleware } from "./middleware/error.js";

config({ path: "./config.env" });

const app = express();

app.use(cors({ origin: [process.env.FRONTEND_URL], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true,
}))

app.use("/api/v1/users", userRoutes);

connection();
app.use(errorMiddleware);

export default app;
