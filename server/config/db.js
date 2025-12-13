// server/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

let dbInstance;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    dbInstance = conn.connection.db;
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const getDB = () => {
  if (!dbInstance) {
    if (mongoose.connection.db) {
        return mongoose.connection.db;
    }
    throw new Error("Database not initialized! Tunggu connectDB selesai.");
  }
  return dbInstance;
};

module.exports = { connectDB, getDB };