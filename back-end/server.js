const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const dbConfig = require('./config/dbConfig');
app.use(express.json());

const usersRoute = require('./routes/userRoute');

app.use('/api/users', usersRoute);










app.listen(port, ()=>{
    console.log(`server is runnig at ${port}`)
})
