const Event = require("../models/Event");

// ✅ 1. Get All Events

const getEvents = async (req, res) => {
    try {
        const { title, category } = req.query;
        let filter = {};

        // Filter by title (case-insensitive search)
        if (title) {
            filter.title = { $regex: title, $options: "i" };
        }

        // Filter by category (ignore if 'all' is selected)
        if (category && category !== "all") {
            filter.category = category;
        }

        // Fetch filtered events and populate createdBy field (name & email)
        const events = await Event.find(filter).populate("createdBy");
        console.log(filter,"this is filter")
        console.log(events,"this is events")
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Failed to fetch events" });
    }
};

// ✅ 2. Create an Event (Protected)
const createEvent = async (req, res) => {
    try {
        const { title, description, location, startDateTime, endDateTime, price, isFree, url, maxAttendees, category } = req.body;
        const imageUrl = req.imageUrl;
        const event = new Event({
            title,
            description,
            location,
            startDateTime,
            endDateTime,
            price,
            isFree,
            url,
            maxAttendees,
            imageUrl,
            category,
            createdBy: req.user._id
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: "Error creating event" });
    }
};

// ✅ 3. Join an Event (Protected)
const joinEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: "Event not found" });

        if (event.attendees.includes(req.user._id)) {
            return res.status(400).json({ message: "Already joined this event" });
        }

        if (event.attendees.length >= event.maxAttendees) {
            return res.status(400).json({ message: "Event is full" });
        }

        event.attendees.push(req.user._id);
        await event.save();

        req.io.emit("updateAttendees", {eventId,attendees: event.attendees}); // ✅ Real-time update for all users

        res.json({ message: "Joined event successfully!", attendees: event.attendees });
    } catch (error) {
        res.status(500).json({ message: "Error joining event" });
    }
};

const editEvent = async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        console.log("Inside edit event");

        const { eventId } = req.params;

        // ✅ Get existing event data
        // const existingEvent = await Event.findById(eventId);
        // if (!existingEvent) {
        //     return res.status(404).json({ message: "Event not found" });
        // }

        // ✅ If new image is uploaded, use it. Otherwise, keep old image.
        const imageUrl = req.imageUrl;

        console.log("Final Image URL:", imageUrl);

        const {
            title,
            description,
            location,
            startDateTime,
            endDateTime,
            price,
            isFree,
            url,
            maxAttendees,
            category,
        } = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(eventId, {
            title,
            description,
            location,
            startDateTime: new Date(startDateTime),
            endDateTime: new Date(endDateTime),
            price: Number(price),
            isFree: isFree === "true",
            url,
            maxAttendees: Number(maxAttendees),
            imageUrl, // ✅ Now correctly handles old/new image
            category,
            createdBy: req.user._id,
        }, { new: true });

        console.log("Updated Event:", updatedEvent);
        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Error updating event", error });
    }
};


// Delete an Event
const deleteEvent = async (req, res) => {
    try {
        console.log("hii from deletevent")
        const { eventId } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(eventId);

        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting event", error });
    }
};

const getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId).populate("createdBy");
        console.log("this is eventbyId",event)
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fetch Events by CreatedBy (User ID)
const fetchEventsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const events = await Event.find({ createdBy: userId });

        if (!events.length) return res.status(400).json({ message: "No events found for this user" });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "Error fetching events", error });
    }
};

module.exports = { getEvents, createEvent, joinEvent,editEvent,deleteEvent,fetchEventsByUser,getEventById };
