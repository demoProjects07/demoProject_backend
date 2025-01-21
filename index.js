require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { DBConfig } = require("./config/dbconfig"); // Assuming you have a DBConfig class like in the template
const { Routes } = require("./routes"); // Assuming you will define your routes in this file
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.ENVIRONMENT || "";
// DB Connection
const dbConfig = new DBConfig();
dbConfig.connect(); // Assuming this handles your DB connection
app.use(helmet()); // Helmet helps secure Express apps by setting HTTP response headers.
app.use(cors());
app.all("/*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Request-Headers", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept,Access-Control-Allow-Headers, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST");
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
    } else {
        next();
    }
});
app.use(morgan("dev")); // Log every request to the console
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Setup the multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
// Serve static files from the uploads folder
app.use("/uploads", express.static("uploads"));
const userSchema = new mongoose.Schema({
    name: String,
    socialMediaHandle: String,
    images: [String],
});
const User = mongoose.model("User", userSchema);
// Submit route
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
// Submissions route
app.get("/submissions", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).send("Error fetching data: " + error.message);
    }
});
// Routes setup
const routes = new Routes(NODE_ENV);
app.use("/api/v1", routes.path());
// Export the app for Vercel deployment
module.exports = app;