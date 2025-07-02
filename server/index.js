const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Schema and model
const textSchema = new mongoose.Schema({ content: String });
const Text = mongoose.model('Text', textSchema);

// Routes
app.get('/text', async (req, res) => {
  const doc = await Text.findOne();
  res.json(doc || {});
});

app.post('/text', async (req, res) => {
  const { content } = req.body;
  let doc = await Text.findOne();
  if (doc) {
    doc.content = content;
    await doc.save();
  } else {
    doc = new Text({ content });
    await doc.save();
  }
  res.json(doc);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
