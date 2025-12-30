require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const setupBot = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', apiRoutes);

// Start Bot
if (process.env.TELEGRAM_BOT_TOKEN) {
    setupBot();
} else {
    console.log('TELEGRAM_BOT_TOKEN not set, bot will not start');
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
