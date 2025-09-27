const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename to remove special characters and spaces
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const baseName = originalName
      .substring(0, originalName.lastIndexOf("."))
      .replace(/[^a-zA-Z0-9]/g, "_");

    cb(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 4, // Maximum 4 files
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
}).array("images", 4);

// Upload multiple images - Note the function name is "uploadImages" (plural)
exports.uploadImages = (req, res) => {
  upload(req, res, async (err) => {
    // Handle Multer errors
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ msg: "File size too large. Maximum size is 5MB per file." });
      } else if (err.code === "LIMIT_FILE_COUNT") {
        return res
          .status(400)
          .json({ msg: "Too many files. Maximum 4 files allowed." });
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          msg: "Unexpected field name. Use 'images' for the field name.",
        });
      } else if (err.code === "MISSING_FIELD_NAME") {
        return res
          .status(400)
          .json({ msg: "Field name missing. Use 'images' as the field name." });
      }
      return res.status(400).json({ msg: err.message });
    } else if (err) {
      return res.status(400).json({ msg: err.message });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: "No files uploaded" });
    }

    // Generate URLs for the uploaded files
    const imageUrls = req.files.map((file) => {
      return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    });

    res.json({
      msg: "Files uploaded successfully",
      images: imageUrls,
    });
  });
};
