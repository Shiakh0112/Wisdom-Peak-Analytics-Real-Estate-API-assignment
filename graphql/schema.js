const { gql } = require("apollo-server-express");

const typeDefs = gql`
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
    properties(limit: Int, page: Int): [Property]
    property(id: ID!): Property
    searchProperties(
      query: String
      bhk: Int
      location: String
      status: String
    ): [Property]
    recommendations(id: ID!): [Property]
  }
`;

module.exports = typeDefs;
