const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js");
const uploadRoutes = require("./routes/uploadRoutes.js"); // ✅ Added Upload Routes
const socketHandler = require("./socket/socketHandler.js");
const path = require('path')
require("dotenv").config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Attach Socket.io to req object for real-time updates
app.use((req, res, next) => {
    req.io = io;
    next();
});



// ✅ API Routes
app.use("/api/auth", authRoutes); // Authentication Routes
app.use("/api/events", eventRoutes); // Event Routes
// app.use(express.static(path.join(__dirname, '/frontend/dist')));
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
//   });
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'build', 'index.html'));
  });
// ✅ WebSockets (Real-Time Attendee Updates)
socketHandler(io);

// ✅ Server Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
