const express = require("express");
const { registerUser, loginUser, userSignOut, deleteUser } = require("../controllers/authController");
const router = express.Router();

// ✅ User Registration Route
router.post("/register", registerUser);

// ✅ User Login Route
router.post("/login", loginUser);

router.post("/user/signout", userSignOut);  // User signout
router.delete("/user/delete/:userId", deleteUser);

module.exports = router;
