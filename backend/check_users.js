const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/movement_db', { family: 4, dbName: 'movement_db' });
        const users = await User.find({}, 'username role password');
        console.log('Total users:', users.length);
        users.forEach(u => console.log(`- ${u.username} (${u.role})`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
