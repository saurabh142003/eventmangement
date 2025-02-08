const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("✅ New user connected:", socket.id);
      
        socket.on("joinEvent", ({ eventId, attendees }) => {
            console.log(`📢 User joined event: ${eventId}, New Attendees Count: ${attendees.length}`);

            // ✅ Emit updated attendees list to all users
            io.emit("updateAttendees", { eventId, attendees });
        });

        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });
};

module.exports = socketHandler;
