const Property = require("../models/Property");
const searchService = require("../services/searchService");
const recommendationService = require("../services/recommendationService");

const resolvers = {
  Query: {
    properties: async (_, { limit = 10, page = 1 }) => {
      const skip = (page - 1) * limit;
      return await Property.find().populate("owner").skip(skip).limit(limit);
    },
    property: async (_, { id }) => {
      return await Property.findById(id).populate("owner");
    },
    searchProperties: async (_, { query, bhk, location, status }) => {
      return await searchService.searchProperties({
        query,
        bhk,
        location,
        status,
      });
    },
    recommendations: async (_, { id }) => {
      const property = await Property.findById(id);
      if (!property) {
        throw new Error("Property not found");
      }
      return await recommendationService.getSimilarProperties(property);
    },
  },
};

module.exports = resolvers;
