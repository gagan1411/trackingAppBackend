const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();
connectDB();

const app = express();

const fs = require('fs');
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const log = `${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${Date.now() - start}ms\n`;
        fs.appendFile('requests.log', log, () => { });
    });

    next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movements', require('./routes/movementRoutes'));
app.use('/api/civilians', require('./routes/civilianRoutes'));
app.use('/api/logs', require('./routes/entryLogRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));
