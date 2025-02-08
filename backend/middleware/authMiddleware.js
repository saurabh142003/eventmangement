const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");



const verifyToken = async (req, res, next) => {
    try {
        console.log(req.host)
        const token = req.body.token || req.headers.authorization?.split(" ")[1];
        console.log(token)
        // console.log(req)
        // ✅ 1. Token Missing → Send Unauthorized Response
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // ✅ 2. Verify Token Using Secret Key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded,"decoded ")
        // ✅ 3. Fetch User from Database (Exclude Password)
        req.user = await User.findById(decoded.id).select("-password");
        console.log(req.user,"req.user value ")
        // ✅ 4. If User Not Found → Unauthorized
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next(); // ✅ Proceed to next middleware
    } catch (err) {
       
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports= verifyToken;