const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// File upload config (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema for attaching the file and model
const fileSchema = new mongoose.Schema({
  filename: String,
  mimetype: String,
  data: Buffer,
});


// Schema for each note and model
const textSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
  files: [fileSchema],
});

const Text = mongoose.model('Text', textSchema);

// Routes
// GET the latest note
app.get('/texts', async (req, res) => {
  const notes = await Text.find().sort({ createdAt: -1 });
  res.json(notes);
});

// POST to create a new note
app.post('/text', upload.array('files'), async (req, res) => {
  const { title, content } = req.body;
  const files = req.files?.map(file => ({
    filename: file.originalname,
    mimetype: file.mimetype,
    data: file.buffer,
  }));

  const newNote = new Text({ title, content, files });
  await newNote.save();
  res.json(newNote);
});

// DELETE a note by ID
app.delete('/text/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Text.findByIdAndDelete(id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

//Get a file from a note
app.get('/text/:id/file/:filename', async (req, res) => {
  const note = await Text.findById(req.params.id);
  if (!note) return res.status(404).send('Note not found');

  const file = note.files.find(f => f.filename === req.params.filename);
  if (!file) return res.status(404).send('File not found');

  res.set({
    'Content-Type': file.mimetype,
    'Content-Disposition': `attachment; filename="${file.filename}"`,
  });
  res.send(file.data);
});



app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
