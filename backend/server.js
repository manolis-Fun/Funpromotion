const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Special handling for search-kit endpoints that expect raw text
app.use('/api/search-kit', express.raw({ type: '*/*' }));

// JSON parsing for other routes
app.use(express.json());
app.use(express.text());

const searchRoutes = require('./routes/search');
const searchKitRoutes = require('./routes/search-kit');

app.use('/api/search', searchRoutes);
app.use('/api/search-kit', searchKitRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Funpromotion Backend API Server' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});