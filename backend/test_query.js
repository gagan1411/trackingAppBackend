require('dotenv').config();
const mongoose = require('mongoose');
const Civilian = require('./models/Civilian');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/movement_db', { family: 4, dbName: 'movement_db' }).then(async () => {
    const id = '894963220888';
    console.log(`Querying MongoDB for ID: ${id}...`);
    
    const query = {
        $or: [
            { idNumber: id },
            { idProof: id },
            { syncId: id },
            { idNumber: Number(id) }
        ]
    };
    
    const civ = await Civilian.findOne(query);
    if (civ) {
        console.log('SUCCESS: FOUND IN DATABASE:');
        console.log(JSON.stringify(civ, null, 2));
    } else {
        console.log('ERROR: Civilian does NOT exist in MongoDB!');
    }
    process.exit(0);
}).catch(e => {
    console.log('MongoDB Connection Error:', e.message);
    process.exit(1);
});
