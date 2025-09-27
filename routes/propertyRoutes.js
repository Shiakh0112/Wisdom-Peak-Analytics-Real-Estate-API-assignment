// routes/propertyRoutes.js
const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");

// @route   GET /api/properties
// @desc    Get all properties with pagination
// @access  Public
router.get("/properties", propertyController.getAllProperties);

// @route   POST /api/properties
// @desc    Create a new property (without images)
// @access  Private
router.post("/properties", propertyController.createProperty);

// @route   POST /api/properties-with-images
// @desc    Create a new property with images
// @access  Private
router.post(
  "/properties-with-images",
  propertyController.createPropertyWithImages
);

// @route   GET /api/properties/:id
// @desc    Get a single property by ID
// @access  Public
router.get("/properties/:id", propertyController.getPropertyById);

// @route   PUT /api/properties/:id
// @desc    Update property details
// @access  Private
router.put("/properties/:id", propertyController.updateProperty);

// @route   PUT /api/properties/:id/images
// @desc    Update property images
// @access  Private
router.put("/properties/:id/images", propertyController.updatePropertyImages);

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private
router.delete("/properties/:id", propertyController.deleteProperty);

// @route   GET /api/search
// @desc    Search properties
// @access  Public
router.get("/search", propertyController.searchProperties);

// @route   GET /api/recommendations/:id
// @desc    Get property recommendations
// @access  Public
router.get("/recommendations/:id", propertyController.getRecommendations);

module.exports = router;
