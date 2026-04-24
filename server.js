require('dotenv').config();
require('express-async-errors');

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
