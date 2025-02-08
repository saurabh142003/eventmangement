const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// 🔹 Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "event_images", // Folder name in Cloudinary
        allowedFormats: ["jpg", "jpeg", "png"],
    },
});

const upload = multer({ storage });

// 🔹 Upload Image API Handler
const uploadImage = (req, res, next) => {
    // if (!req.file) {
    //     return res.status(400).json({ message: "No file uploaded" });
    // }
    console.log("inside upload controller",)
    // Pass the image URL to the next middleware (which is createEvent)
    req.imageUrl = req.file?.path || req.body.imageUrl // Store imageUrl in the request object
    next(); // Move to the next middleware (in your case, createEvent)
};

// 🔹 Export the upload middleware and the handler
module.exports = {
    upload,
    uploadImage,
};
