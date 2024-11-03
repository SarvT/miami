import dotenv from "dotenv"
import connectDB from "./db/db.js"
import { express } from "express"

const app = express()

dotenv.config({
    path:'/.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8081, ()=>{
        console.log(`server is live at: ${process.env.PORT}`);
    })
})
.catch((err)=>{

})
// cFHvNxHvGCd3LH3k

/*
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/