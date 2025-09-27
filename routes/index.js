const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const propertyRoutes = require("./propertyRoutes");
const uploadRoutes = require("./uploadRoutes");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const User = require("../models/User"); // Import User model

// GraphQL Schema
const schema = buildSchema(`
  type Property {
    id: ID!
    title: String!
    location: String!
    price: Float!
    bhk: Int!
    type: String!
    description: String!
    status: String!
    images: [String!]
    owner: User
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    properties(bhk: Int, location: String, type: String, status: String): [Property]
    property(id: ID!): Property
  }
`);

// GraphQL Resolvers
const root = {
  properties: async (args) => {
    const Property = require("../models/Property");
    let query = {};

    if (args.bhk) query.bhk = args.bhk;
    if (args.location)
      query.location = { $regex: args.location, $options: "i" };
    if (args.type) query.type = args.type;
    if (args.status) query.status = args.status;

    return await Property.find(query).populate({
      path: "owner",
      model: User, // Use the actual User model
      select: "name email",
    });
  },
  property: async (args) => {
    const Property = require("../models/Property");
    return await Property.findById(args.id).populate({
      path: "owner",
      model: User, // Use the actual User model
      select: "name email",
    });
  },
};

// Use routes
router.use("/auth", authRoutes);
router.use("/", propertyRoutes);
router.use("/upload", uploadRoutes);

// GraphQL endpoint
router.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

module.exports = router;
