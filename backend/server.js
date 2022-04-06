const app = require('./app');
const dotenv = require('dotenv');

const { path } = require('./app');
//handling Uncaught Exceptions
process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exceptions`);

    process.exit(1);
})

//config
dotenv.config({path:"backend/config/config.env"});
//connecting to the database
const connectDatabase = require("./config/database");
connectDatabase()

const server=app.listen(process.env.PORT,()=>{

    console.log(`server is working on running sucessfully on port:${process.env.PORT}`);
})


//unhandled Promise Rejection
process.on("unhandledRejection",err=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    server.close(()=>{
        process.exit(1);
    });
});