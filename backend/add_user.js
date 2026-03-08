const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const addUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/movement_db');

        const username = 'kpsnegi12';
        const password = 'password123'; // Default password for testing

        let user = await User.findOne({ username });
        if (user) {
            console.log(`User ${username} already exists.`);
        } else {
            user = new User({
                username,
                password,
                name: 'K.P.S. Negi',
                role: 'operator'
            });
            await user.save();
            console.log(`User ${username} created successfully with password: ${password}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

addUser();
