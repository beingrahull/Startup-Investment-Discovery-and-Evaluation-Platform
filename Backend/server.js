require("dotenv").config();
const app=require("./app")
const ConnecttoDB=require("./db/db")

const port=process.env.PORT || 4000


ConnecttoDB().then(()=>
app.listen(port,console.log("Server is live at 3000"))
)

