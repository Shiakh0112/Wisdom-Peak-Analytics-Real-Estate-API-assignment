const Property = require("../models/Property");
const User = require("../models/User");

const sampleProperties = [
  {
    title: "Luxury Apartment in Gurgaon",
    location: "Gurgaon",
    price: 15000000,
    bhk: 3,
    type: "Apartment",
    description:
      "A luxurious 3BHK apartment in the heart of Gurgaon with modern amenities.",
    status: "sale",
    images: [
      "https://picsum.photos/seed/gurgaon1/800/600.jpg",
      "https://picsum.photos/seed/gurgaon2/800/600.jpg",
      "https://picsum.photos/seed/gurgaon3/800/600.jpg",
    ],
  },
  {
    title: "Spacious House in Delhi",
    location: "Delhi",
    price: 20000000,
    bhk: 4,
    type: "House",
    description:
      "A spacious 4BHK house with a beautiful garden in a prime Delhi locality.",
    status: "sale",
    images: [
      "https://picsum.photos/seed/delhi1/800/600.jpg",
      "https://picsum.photos/seed/delhi2/800/600.jpg",
      "https://picsum.photos/seed/delhi3/800/600.jpg",
    ],
  },
  {
    title: "Modern Villa in Mumbai",
    location: "Mumbai",
    price: 35000000,
    bhk: 5,
    type: "Villa",
    description:
      "A modern 5BHK villa with a private pool and stunning city views.",
    status: "sale",
    images: [
      "https://picsum.photos/seed/mumbai1/800/600.jpg",
      "https://picsum.photos/seed/mumbai2/800/600.jpg",
      "https://picsum.photos/seed/mumbai3/800/600.jpg",
    ],
  },
  {
    title: "Cozy Studio in Bangalore",
    location: "Bangalore",
    price: 8000000,
    bhk: 1,
    type: "Studio",
    description:
      "A cozy studio apartment perfect for young professionals in Bangalore.",
    status: "rent",
    images: [
      "https://picsum.photos/seed/bangalore1/800/600.jpg",
      "https://picsum.photos/seed/bangalore2/800/600.jpg",
    ],
  },
  {
    title: "Penthouse in Hyderabad",
    location: "Hyderabad",
    price: 25000000,
    bhk: 4,
    type: "Apartment",
    description: "A luxurious penthouse with panoramic views of the city.",
    status: "sale",
    images: [
      "https://picsum.photos/seed/hyderabad1/800/600.jpg",
      "https://picsum.photos/seed/hyderabad2/800/600.jpg",
      "https://picsum.photos/seed/hyderabad3/800/600.jpg",
      "https://picsum.photos/seed/hyderabad4/800/600.jpg",
    ],
  },
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Create a sample user if none exists
    const user = await User.findOne();
    if (!user) {
      const newUser = new User({
        name: "Property Owner",
        email: "owner@example.com",
        password:
          "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      });
      await newUser.save();
    }

    // Get the user (either existing or newly created)
    const propertyOwner = await User.findOne();

    // Add owner to each property
    const propertiesWithOwner = sampleProperties.map((property) => ({
      ...property,
      owner: propertyOwner._id,
    }));

    await Property.insertMany(propertiesWithOwner);
    console.log("Database seeded with sample properties");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
};

module.exports = { sampleProperties, seedDatabase };
