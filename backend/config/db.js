const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/movement_db', {
            family: 4, // Prevents Node 18+ IPv6 DNS timeout bug
            serverSelectionTimeoutMS: 15000, // Fails faster instead of 30s
            dbName: 'movement_db' // Explicitly force the correct database name
        });
        console.log('MongoDB Connected to DB:', mongoose.connection.db.databaseName);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
