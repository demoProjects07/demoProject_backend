project-practice.rk6y4const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://username:password@domain_name/DB_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  socialMediaHandle: String,
  images: [String],
});

const User = mongoose.model('User', userSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Serve static files from the uploads folder
app.use('/uploads', express.static('uploads'));

app.post('/submit', upload.array('images'), async (req, res) => {
  try {
    const { name, socialMediaHandle } = req.body;
    const images = req.files.map((file) => file.path);

    const newUser = new User({ name, socialMediaHandle, images });
    await newUser.save();

    res.status(200).send('User data saved successfully!');
  } catch (error) {
    res.status(500).send('Error saving data: ' + error.message);
  }
});

app.get('/submissions', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send('Error fetching data: ' + error.message);
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
