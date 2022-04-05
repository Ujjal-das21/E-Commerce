const app = require('./app');
const dotenv = require('dotenv');

const { path } = require('./app');
//config
dotenv.config({path:"backend/config/config.env"});
//connecting to the database
const connectDatabase = require("./config/database");
connectDatabase()









app.listen(process.env.PORT,()=>{

    console.log(`server is working on running sucessfully on port:${process.env.PORT}`);
})