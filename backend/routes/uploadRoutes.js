const express = require('express');
const { uploadImage, upload } = require("../controllers/uploadController");
const { createEvent } = require("../controllers/eventController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Post route for creating events with image upload
// router.post("/", protect, upload.single("image"), uploadImage, createEvent);

module.exports = router;

