const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const auth = require("../middleware/auth");

// @route   POST /api/upload
router.post("/", auth, uploadController.uploadImages); // Changed from uploadImage to uploadImages

module.exports = router;
