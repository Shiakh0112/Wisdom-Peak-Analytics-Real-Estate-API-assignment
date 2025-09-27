import Property from "../models/Property.js";

// 🔍 Search properties
export const searchProperties = async (searchQuery) => {
  const properties = await Property.find(searchQuery).populate(
    "owner",
    "name email"
  ); // ✅ FIXED populate
  return properties;
};

// 📌 Get property by ID
export const getPropertyById = async (id) => {
  const property = await Property.findById(id).populate("owner", "name email"); // ✅ FIXED populate
  return property;
};

// 🤝 Get recommendations
export const getRecommendations = async (propertyId) => {
  const referenceProperty = await Property.findById(propertyId);

  if (!referenceProperty) return [];

  const recommendations = await Property.find({
    _id: { $ne: propertyId },
    location: referenceProperty.location,
    bhk: referenceProperty.bhk,
    status: referenceProperty.status,
  })
    .populate("owner", "name email") // ✅ FIXED populate
    .limit(3);

  return recommendations;
};
