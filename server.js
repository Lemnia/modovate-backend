// server.js
const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');

dotenv.config();

// CORS konfiguracija
const corsOptions = {
  origin: ['https://www.modovatestudio.com'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(mongoSanitize());
app.use(xssClean());
app.use(cookieParser());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 100, // Maksimalno 100 zahteva po IP
});
app.use(limiter);

// MongoDB konekcija
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
