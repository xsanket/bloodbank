const mongoose = require('mongoose');

mongoose.connect(process.env.mongo_url)

const connection = mongoose.connection;

// Verify connection and handle connection events
connection.on('connected', () => {
    console.log("MongoDB connected successfully");
})

connection.on('error', (err)=>{
    console.log('Mongo Errorrrr', err)
})