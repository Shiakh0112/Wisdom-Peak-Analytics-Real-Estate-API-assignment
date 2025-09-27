const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  bhk: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["Apartment", "House", "Villa", "Studio"],
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["sale", "rent"],
    default: "sale",
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Make sure this matches the model name
    required: true,
  },
});

module.exports = mongoose.model("Property", PropertySchema);
