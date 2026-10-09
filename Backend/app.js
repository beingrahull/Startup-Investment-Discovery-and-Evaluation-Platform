const express=require("express")
const errorHandler=require("./middleware/error.middleware")
const cookieParser=require("cookie-parser")

const userLogin=require("./routes/auth.routes")
const AskRoute=require("./routes/ask.routes")
const ConnectionRoute=require("./routes/connection.routes")
const cors = require("cors");


const app=express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


app.get("/",(req,res)=>{
    res.status(201).json("Welcome to the platform")
})

app.use("/api/auth",userLogin);
app.use("/api/asks",AskRoute);
app.use("/api/connections",ConnectionRoute);

app.use(errorHandler)

module.exports=app