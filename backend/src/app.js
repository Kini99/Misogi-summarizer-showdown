require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const summarizeRoutes = require('./routes/summarize');
const ratingRoutes = require('./routes/ratings');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/summarize', summarizeRoutes);
app.use('/api/ratings', ratingRoutes);

// Available models endpoint
app.get('/api/models', (req, res) => {
  const models = {
    closedSource: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'claude-2', name: 'Claude 2' }
    ],
    openSource: [
      { id: 'facebook/bart-large-cnn', name: 'BART Large CNN' },
      { id: 'google/pegasus-xsum', name: 'Pegasus XSum' },
      { id: 'mistralai/Mixtral-8x7B', name: 'Mixtral 8x7B' }
    ]
  };
  res.json(models);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 