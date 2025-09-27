const Property = require("../models/Property");
const cacheService = require("../services/cacheService");
const propertyService = require("../services/propertyService");
const searchService = require("../services/searchService");
const auth = require("../middleware/auth");
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
    // Log file details for debugging
    console.log("File details:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname,
    });

    // More permissive file type checking
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    // Check if file extension is allowed
    const isExtensionValid = allowedExtensions.includes(extname);

    // Check if MIME type is allowed
    const isMimeValid = allowedMimeTypes.includes(mimetype);

    // Allow if either extension or MIME type is valid
    if (isExtensionValid || isMimeValid) {
      cb(null, true);
    } else {
      console.log(
        `File rejected: ${file.originalname} (ext: ${extname}, mime: ${mimetype})`
      );
      cb(
        new Error(
          `Invalid file type. Only ${allowedExtensions.join(
            ", "
          )} files are allowed.`
        )
      );
    }
  },
}).array("images", 4);

// Create a new property (without images)
exports.createProperty = [
  auth,
  async (req, res) => {
    try {
      const { title, location, price, bhk, type, description, status, images } =
        req.body;

      // Validate required fields
      if (
        !title ||
        !location ||
        !price ||
        !bhk ||
        !type ||
        !description ||
        !status
      ) {
        return res
          .status(400)
          .json({ msg: "Please provide all required fields" });
      }

      // Create new property
      const newProperty = new Property({
        title,
        location,
        price,
        bhk,
        type,
        description,
        status,
        images: images || [],
        owner: req.user.id,
      });

      const property = await newProperty.save();

      // Clear cache to ensure data consistency
      cacheService.flush();

      res.status(201).json(property);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
];

// Create a new property with images (single request)
exports.createPropertyWithImages = [
  auth,
  upload,
  async (req, res) => {
    try {
      console.log("Request body:", req.body);
      console.log("Uploaded files:", req.files);

      const { title, location, price, bhk, type, description, status } =
        req.body;

      // Validate required fields
      if (
        !title ||
        !location ||
        !price ||
        !bhk ||
        !type ||
        !description ||
        !status
      ) {
        return res
          .status(400)
          .json({ msg: "Please provide all required fields" });
      }

      // Generate image URLs if files were uploaded
      const images = req.files
        ? req.files.map(
            (file) =>
              `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
          )
        : [];

      // Create new property
      const newProperty = new Property({
        title,
        location,
        price,
        bhk,
        type,
        description,
        status,
        images,
        owner: req.user.id,
      });

      const property = await newProperty.save();

      // Clear cache to ensure data consistency
      cacheService.flush();

      res.status(201).json(property);
    } catch (err) {
      console.error("Error creating property with images:", err.message);

      // Handle multer errors specifically
      if (err.message && err.message.includes("Invalid file type")) {
        return res.status(400).json({ msg: err.message });
      }

      // Handle other multer errors
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

      res.status(500).send("Server error");
    }
  },
];

// Get all properties with pagination
exports.getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `properties:${page}:${limit}`;
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const properties = await Property.find()
      .populate("owner", "name email")
      .skip(skip)
      .limit(limit);
    const total = await Property.countDocuments();

    const result = {
      properties,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };

    cacheService.set(cacheKey, result, 300);
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!property) {
      return res.status(404).json({ msg: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Search properties - Hybrid Search
exports.searchProperties = async (req, res) => {
  try {
    const { query, bhk, location, status, minPrice, maxPrice } = req.query;

    let searchQuery = {};

    // --- Exact match filters ---
    if (bhk) searchQuery.bhk = bhk;
    if (location) searchQuery.location = { $regex: location, $options: "i" };
    if (status) searchQuery.status = status;
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseInt(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseInt(maxPrice);
    }

    // --- Keyword / Semantic search simulation ---
    if (query) {
      const lowerQuery = query.toLowerCase();

      // Normal keyword match in title & description
      searchQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];

      // Simple semantic simulation:
      if (lowerQuery.includes("cyberhub")) {
        // Treat Cyberhub as Gurgaon
        searchQuery.location = { $regex: "gurgaon", $options: "i" };
      }

      if (lowerQuery.includes("flat")) {
        // Flat ~ Apartment
        searchQuery.type = { $regex: "apartment|flat", $options: "i" };
      }
    }

    // Call service
    const properties = await searchService.searchProperties(searchQuery);
    res.json(properties);
  } catch (err) {
    console.error("Error in hybrid search:", err.message);
    res.status(500).send("Server error");
  }
};

// Get property recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await searchService.getRecommendations(
      req.params.id
    );
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Update property images
exports.updatePropertyImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    // Validate input
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res
        .status(400)
        .json({ msg: "At least one image URL is required" });
    }

    // Find and update property
    const property = await Property.findByIdAndUpdate(
      id,
      { images },
      { new: true } // Return the updated document
    ).populate("owner", "name email");

    if (!property) {
      return res.status(404).json({ msg: "Property not found" });
    }

    // Clear cache to ensure data consistency
    cacheService.flush();

    res.json({
      msg: "Property images updated successfully",
      property,
    });
  } catch (err) {
    console.error("Error updating property images:", err.message);
    res.status(500).send("Server error");
  }
};

// Update property details
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, price, bhk, type, description, status } = req.body;

    // Build update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (location) updateFields.location = location;
    if (price) updateFields.price = price;
    if (bhk) updateFields.bhk = bhk;
    if (type) updateFields.type = type;
    if (description) updateFields.description = description;
    if (status) updateFields.status = status;

    // Find and update property
    const property = await Property.findByIdAndUpdate(
      id,
      updateFields,
      { new: true } // Return the updated document
    ).populate("owner", "name email");

    if (!property) {
      return res.status(404).json({ msg: "Property not found" });
    }

    // Clear cache to ensure data consistency
    cacheService.flush();

    res.json({
      msg: "Property updated successfully",
      property,
    });
  } catch (err) {
    console.error("Error updating property:", err.message);
    res.status(500).send("Server error");
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({ msg: "Property not found" });
    }

    // Clear cache to ensure data consistency
    cacheService.flush();

    res.json({
      msg: "Property deleted successfully",
      property,
    });
  } catch (err) {
    console.error("Error deleting property:", err.message);
    res.status(500).send("Server error");
  }
};
