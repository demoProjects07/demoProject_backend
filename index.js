require("dotenv").config();
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Ensure /tmp/uploads directory exists for Vercel
const uploadsDir = "/tmp/uploads";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Temporary uploads directory created.");
}

// MongoDB connection
mongoose.connect(
    "mongodb+srv://demofor26:6QYaf1NiE1mq79kK@project-practice.rk6y4.mongodb.net/socialMediaTask",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

// Middleware
app.use(cors());
app.all("/*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Request-Headers", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST");
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
    } else {
        next();
    }
});
app.use(express.json());

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "/tmp/uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Serve static files from the /tmp/uploads folder (optional)
// app.use("/uploads", express.static("tmp/uploads"));

// Mongoose schema and model
const userSchema = new mongoose.Schema({
    name: String,
    socialMediaHandle: String,
    images: [String],
});
const User = mongoose.model("User", userSchema);

// Routes
app.post("/submit", upload.array("images"), async (req, res) => {
    try {
        const { name, socialMediaHandle } = req.body;
        const images = req.files.map((file) => file.path);
        const newUser = new User({ name, socialMediaHandle, images });
        await newUser.save();
        res.status(200).send("User data saved successfully!");
    } catch (error) {
        res.status(500).send("Error saving data: " + error.message);
    }
});

app.get("/submissions", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).send("Error fetching data: " + error.message);
    }
});

// Export the app for Vercel deployment
module.exports = app;
