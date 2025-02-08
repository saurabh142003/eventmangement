const express = require("express");
const { getEvents,joinEvent,createEvent, editEvent, deleteEvent, fetchEventsByUser, getEventById } = require("../controllers/eventController.js");
const protect = require("../middleware/authMiddleware.js");
const { uploadImage, upload } = require("../controllers/uploadController");
const router = express.Router();

// ✅ Get All Events
router.get("/", getEvents);

// ✅ Create New Event (Protected Route)
router.post("/", protect,upload.single("image"), uploadImage, createEvent);

// ✅ Join an Event (Protected Route)
router.post("/:eventId/join", protect, joinEvent);
router.get("/:eventId", getEventById);
router.put("/event/edit/:eventId",protect,upload.single("image"), uploadImage, editEvent);         // Edit an event
router.delete("/event/delete/:eventId",protect, deleteEvent); // Delete an event
router.get("/user/:userId", fetchEventsByUser);

module.exports = router;
