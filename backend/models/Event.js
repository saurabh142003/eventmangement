const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Event name/title
    description: { type: String, required: true },
    location: { type: String }, // Optional location field
    imageUrl: { type: String, required: true }, // Image for event
    startDateTime: { type: Date, required: true }, // Event start time & date
    endDateTime: { type: Date, required: true }, // Event end time & date
    price: { type: String, default: "0" }, // Event price (if any)
    isFree: { type: Boolean, required: true, default: false }, // Check if event is free
    url: { type: String }, // Optional event link
    maxAttendees: { type: Number, required: true }, // Max people allowed
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who joined
    category: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Creator reference
},{timestamps:true});

module.exports = mongoose.model("Event", EventSchema);
