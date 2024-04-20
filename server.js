const { connect } = require("mongoose");
const app = require("./app");
const { config } = require("./src/config");
const router = require("./src/routes");
const { errorHandler, notFounds } = require("./src/middlewares/error.middleware");
app.use("/api/v1", router)

app.all("*", notFounds)
app.use(errorHandler)
app.listen(config.PORT, async()=>{
try{
        //connect to database
        console.log("connecting to database...");              //CONNECTING TO DATABASE
        console.log("217697267169795:Dgc7h8DF35oRATf4KTkb4yiWd-8@dyhmpbt5u")
        // CLOUDINARY_URL=cloudinary://217697267169795:Dgc7h8DF35oRATf4KTkb4yiWd-8@dyhmpbt5u
        
        // mongoose.set("StrictQuery", true);
        connect (config.DB_URL)      // connection strings
        console.log("database connected successfully...");
        

        console.log(`server is running on local host:${config.PORT}`);              // SHOWING OUR SERVER IS RUNNING
    }catch(error){
        console.error(error);
        process.exit(-1);
    }
    })