import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }),
);
app.use(
    express.json({
        limit: "16kb",
    }),
);
app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    }),
);
app.use(express.static("public"));
app.use(cookieParser());

// routes
import userRoute from "./routes/user.js";

app.use("/users", userRoute);

// app.get("/", (req, res)=>{
//     res.send("Working")
// })


export { app };
