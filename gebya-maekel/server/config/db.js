const mongoose = require('mongoose'); // 👈 ADD THIS LINE AT THE TOP

const connectDB = async () => {
  try {
    // This line was failing because 'mongoose' was undefined
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;