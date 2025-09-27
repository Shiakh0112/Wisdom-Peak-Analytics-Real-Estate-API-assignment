const Property = require("../models/Property");
const cacheService = require("./cacheService");

// Get all properties with pagination
const getAllProperties = async (page = 1, limit = 10) => {
  try {
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Check cache first
    const cacheKey = `properties:${page}:${limit}`;
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    // Get properties from database
    const properties = await Property.find()
      .populate("owner")
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

    // Save to cache for 5 minutes
    cacheService.set(cacheKey, result);

    return result;
  } catch (error) {
    throw new Error(`Error getting properties: ${error.message}`);
  }
};

// Get a single property by ID
const getPropertyById = async (id) => {
  try {
    const property = await Property.findById(id).populate("owner");

    if (!property) {
      throw new Error("Property not found");
    }

    return property;
  } catch (error) {
    throw new Error(`Error getting property: ${error.message}`);
  }
};

// Create a new property
const createProperty = async (propertyData, userId) => {
  try {
    const newProperty = new Property({
      ...propertyData,
      owner: userId,
    });

    await newProperty.save();

    // Clear cache to ensure data consistency
    cacheService.flush();

    return newProperty;
  } catch (error) {
    throw new Error(`Error creating property: ${error.message}`);
  }
};

// Update a property
const updateProperty = async (id, updateData) => {
  try {
    const property = await Property.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!property) {
      throw new Error("Property not found");
    }

    // Clear cache to ensure data consistency
    cacheService.flush();

    return property;
  } catch (error) {
    throw new Error(`Error updating property: ${error.message}`);
  }
};

// Delete a property
const deleteProperty = async (id) => {
  try {
    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      throw new Error("Property not found");
    }

    // Clear cache to ensure data consistency
    cacheService.flush();

    return property;
  } catch (error) {
    throw new Error(`Error deleting property: ${error.message}`);
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
