import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import {server} from "./socket/socket.js"
import cors from "cors";
dotenv.config({});

const app = express();
// middlewares
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
    origin:'http://localhost:5173',
    credentials:true
}
app.use(cors(corsOptions));

const port = process.env.PORT || 5000;

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);
// localhost : http://localhost:8080/api/v1/user/register

app.listen(port, ()=>{
    connectDB();
    console.log(`server is running at port ${port}`);
})

server.listen(4000,()=>console.log("lising port 4000 io"));