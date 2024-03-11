const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const dbConfig = require('./config/dbConfig');
app.use(express.json());

const usersRoute = require('./routes/userRoute');
const inventoryRoute = require("./routes/inventoryRoute")
const dashboardRoute = require(`./routes/dashboardRoute`)

//users
app.use('/api/users', usersRoute);

//inventory
app.use('/api/inventory', inventoryRoute);

//dashboard
app.use(`/api/dashboard`, dashboardRoute);










app.listen(port, ()=>{
    console.log(`server is runnig at ${port}`)
})


