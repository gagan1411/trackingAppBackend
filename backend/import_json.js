require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Civilian = require('./models/Civilian');

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/movement_db', { family: 4, dbName: 'movement_db' });
        console.log('MongoDB perfectly connected...');

        const dataPath = '../biometric-service/ready_for_mongodb.json';
        if (!fs.existsSync(dataPath)) {
            console.log('ERROR: The JSON dataset file does not exist at ' + dataPath);
            process.exit(1);
        }

        const rawData = fs.readFileSync(dataPath);
        const civilians = JSON.parse(rawData);

        console.log(`Found ${civilians.length} civilians in JSON. Wiping collection and re-importing...`);
        
        await Civilian.deleteMany({});
        await Civilian.insertMany(civilians);

        console.log(`✅ SUCCESS! Successfully injected ${civilians.length} documents into MongoDB Cloud!`);
        process.exit(0);
    } catch (e) {
        console.error('Fatal Error during MongoDB Injection:', e);
        process.exit(1);
    }
};

importData();
