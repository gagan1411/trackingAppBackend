const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/movement_db');
        console.log('MongoDB Connected...');

        let admin = await User.findOne({ username: 'admin' });
        if (admin) {
            console.log('Admin already exists. Updating password to plain text (model will hash).');
            admin.password = 'admin123';
            await admin.save();
        } else {
            console.log('Creating Admin user with password "admin123" (model will hash).');
            admin = new User({
                username: 'admin',
                password: 'admin123'
            });
            await admin.save();
        }
        console.log('Admin user ready.');
        process.exit();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

createAdmin();
