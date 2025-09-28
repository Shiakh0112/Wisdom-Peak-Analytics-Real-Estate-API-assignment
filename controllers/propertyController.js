const Property = require("../models/Property");
const cacheService = require("../services/cacheService");
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 4,
  },
  fileFilter: (req, file, cb) => {
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

    if (allowedExtensions.includes(extname) || allowedMimeTypes.includes(mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${allowedExtensions.join(", ")} files are allowed.`));
    }
  },
}).array("images", 4);

// ---------------- CREATE PROPERTY ----------------
exports.createProperty = [
  auth,
  async (req, res) => {
    try {
      const { title, location, price, bhk, type, description, status, images } =
        req.body;

      if (!title || !location || !price || !bhk || !type || !description || !status) {
        return res.status(400).json({ msg: "Please provide all required fields" });
      }

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
      cacheService.flush();

      res.status(201).json(property);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
];

// ---------------- CREATE PROPERTY WITH IMAGES ----------------
exports.createPropertyWithImages = [
  auth,
  upload,
  async (req, res) => {
    try {
      const { title, location, price, bhk, type, description, status } = req.body;

      if (!title || !location || !price || !bhk || !type || !description || !status) {
        return res.status(400).json({ msg: "Please provide all required fields" });
      }

      const images = req.files
        ? req.files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`)
        : [];

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
      cacheService.flush();

      res.status(201).json(property);
    } catch (err) {
      console.error("Error creating property with images:", err.message);
      res.status(500).send("Server error");
    }
  },
];

// ---------------- GET ALL PROPERTIES ----------------
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

// ---------------- GET PROPERTY BY ID ----------------
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner", "name email");

    if (!property) {
      return res.status(404).json({ msg: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// ---------------- SEARCH PROPERTIES ----------------
exports.searchProperties = async (req, res) => {
  try {
    const { query, bhk, location, status, minPrice, maxPrice } = req.query;

    let searchQuery = {};

    if (bhk) searchQuery.bhk = bhk;
    if (status) searchQuery.status = status;
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseInt(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseInt(maxPrice);
    }

    // ✅ FIXED: Exact match for location (case-insensitive)
    if (location) {
      searchQuery.location = { $regex: `^${location}$`, $options: "i" };
    }

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    let properties = await searchService.searchProperties(searchQuery);

    // ✅ Remove duplicates by _id
    properties = [
      ...new Map(properties.map((p) => [p._id.toString(), p])).values(),
    ];

    res.json(properties);
  } catch (err) {
    console.error("Error in hybrid search:", err.message);
    res.status(500).send("Server error");
  }
};

// ---------------- GET RECOMMENDATIONS ----------------
exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await searchService.getRecommendations(req.params.id);
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// ---------------- UPDATE PROPERTY IMAGES ----------------
exports.updatePropertyImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ msg: "At least one image URL is required" });
    }

    const property = await Property.findByIdAndUpdate(id, { images }, { new: true }).populate(
      "owner",
      "name email"
    );

    if (!property) {
      return res.status(404).json({ msg: "Property not found" });
    }

    cacheService.flush();

    res.json({ msg: "Property images updated successfully", property });
  } catch (err) {
    console.error("Error updating property images:", err.message);
    res.status(500).send("Server error");
  }
};

// ---------------- UPDATE PROPERTY DETAILS ----------------
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, price, bhk, type, description, status } = req.body;

    const updateFields = {};
    if (title) updateFields.title = title;
    if (location) updateFields.location = location;
    if (price) updateFields.price = price;
    if (bhk) updateFields.bhk = bhk;
    if (type) updateFields.type = type;
    if (description) updateFields.description = description;
    if (status) updateFields.status = status;

    const property = await Property.findByIdAndUpdate(id, updateFields, { new: true }).populate(
      "owner",
      "name email"
    );

    if (!property) {
      return res.status(404).json({ msg: "Property not found" });
    }

    cacheService.flush();

    res.json({ msg: "Property updated successfully", property });
  } catch (err) {
    console.error("Error updating property:", err.message);
    res.status(500).send("Server error");
  }
};

// ---------------- DELETE PROPERTY ----------------
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({ msg: "Property not found" });
    }

    cacheService.flush();

    res.json({ msg: "Property deleted successfully", property });
  } catch (err) {
    console.error("Error deleting property:", err.message);
    res.status(500).send("Server error");
  }
};
