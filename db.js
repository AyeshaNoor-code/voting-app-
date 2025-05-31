var mongoose = require('mongoose');
require('dotenv').config();
// MongoDB connection string

//const mongoURL=process.env.MONGODB_URL; //For online db server
const mongoURL=process.env.MONGO_URL;//For local db server


mongoose.connect(mongoURL);
//
const db = mongoose.connection;


db.on('connected', () => {
    console.log('Connected to MongoDB Server');
});

db.on('error', (err) => {
    console.error('Connection Error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB Disconnected');
});

module.exports = db;
